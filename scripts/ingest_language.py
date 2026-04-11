import os
import json
import time
import pdfplumber
try:
    from docx import Document
    DOCX_SUPPORT = True
except ImportError:
    DOCX_SUPPORT = False
from google import generativeai as genai
from dotenv import load_dotenv

# Load API Key from .env.local
load_dotenv(dotenv_path='.env.local')
GENAI_API_KEY = os.getenv('VITE_GEMINI_API_KEY')

if not GENAI_API_KEY:
    print("Error: VITE_GEMINI_API_KEY not found in .env.local")
    exit(1)

genai.configure(api_key=GENAI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

PROGRESS_FILE = 'scripts/ingest_progress.json'
DICT_PATH = 'src/data/dictionary.json'

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_progress(lang, last_page):
    progress = load_progress()
    progress[lang] = last_page
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)

def ai_parse_batch(text, lang_name):
    prompt = f"""
    You are a linguistic expert. I am providing you with text from a {lang_name} dictionary.
    Extract the word pairs into a JSON array of objects with this structure:
    {{
        "english": "string",
        "{lang_name.lower()}": "string",
        "pos": "n., v.t., adj., etc.",
        "pronunciation": "[bracketed text]"
    }}
    
    CRITICAL RULES:
    1. Focus ONLY on English and {lang_name}.
    2. IGNORE Bengali script, page numbers, and headers.
    3. If a word is split across lines, merge it.
    4. Return ONLY the JSON array (no markdown, no preamble).
    
    TEXT:
    \"\"\"{text}\"\"\"
    """
    
    try:
        response = model.generate_content(prompt)
        # Strip markdown if present
        cleaned = response.text.strip().replace('```json', '').replace('```', '')
        return json.loads(cleaned)
    except Exception as e:
        print(f"  [Error] AI extraction failed: {e}")
        return []

def merge_to_master(parsed_entries, target_lang):
    if not os.path.exists(DICT_PATH):
        master_dict = []
    else:
        with open(DICT_PATH, 'r', encoding='utf-8') as f:
            master_dict = json.load(f)
    
    master_map = {entry['english'].lower(): entry for entry in master_dict}
    lang_key = target_lang.lower()
    
    updated = 0
    new = 0
    
    for entry in parsed_entries:
        eng = entry.get('english', '').strip().lower()
        if not eng: continue
        
        target_val = entry.get(lang_key, '').strip()
        
        if eng in master_map:
            # Update existing entry with the new language
            master_map[eng][lang_key] = target_val
            updated += 1
        else:
            # Create new entry
            new_entry = {
                "english": entry.get('english', ''),
                lang_key: target_val,
                "pos": entry.get('pos', ''),
                "pronunciation": entry.get('pronunciation', ''),
                "kokborok": ""
            }
            master_dict.append(new_entry)
            new += 1
            
    with open(DICT_PATH, 'w', encoding='utf-8') as f:
        json.dump(master_dict, f, indent=2, ensure_ascii=False)
    
    return updated, new

def main():
    print("=== Batch Language Ingestor v2 ===")
    target_lang = input("Enter language name (e.g. Uchoi): ").strip()
    file_path = input("Enter path to PDF: ").strip()
    
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    # Resume capability
    progress = load_progress()
    start_page = progress.get(target_lang, 0)
    
    print(f"Target: {target_lang}")
    print(f"Status: Resuming from page {start_page + 1}")
    
    batch_size = 5 # Process 5 pages at a time
    wait_time = 5  # Seconds to wait between batches to avoid rate limits
    
    try:
        with pdfplumber.open(file_path) as pdf:
            total_pages = len(pdf.pages)
            print(f"Total pages in file: {total_pages}")
            
            for i in range(start_page, total_pages, batch_size):
                end_idx = min(i + batch_size, total_pages)
                print(f"\n[Batch] Processing pages {i+1} to {end_idx}...")
                
                batch_text = ""
                for p_idx in range(i, end_idx):
                    page_text = pdf.pages[p_idx].extract_text()
                    if page_text:
                        batch_text += page_text + "\n"
                
                if not batch_text.strip():
                    print(f"  [Skip] Pages {i+1}-{end_idx} appear empty.")
                    save_progress(target_lang, end_idx)
                    continue
                
                # AI Extraction
                print(f"  [AI] Extracting {target_lang} entries...")
                parsed = ai_parse_batch(batch_text, target_lang)
                
                if parsed:
                    upd, nwi = merge_to_master(parsed, target_lang)
                    print(f"  [Done] Updated {upd}, Created {nwi} entries.")
                    save_progress(target_lang, end_idx)
                else:
                    print("  [Warning] No entries extracted in this batch.")
                
                # Rate limiting
                if end_idx < total_pages:
                    print(f"  [Wait] Cooling down for {wait_time}s...")
                    time.sleep(wait_time)
                    
    except KeyboardInterrupt:
        print("\n[Stopped] Progress has been saved. Run the script again to resume.")
    except Exception as e:
        print(f"\n[Critical Error] {e}")

if __name__ == "__main__":
    main()
