import os
import json
import time
import re
import pdfplumber
import spacy
from google import generativeai as genai
from dotenv import load_dotenv

# Resolve project root
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

# Load API Key
load_dotenv(dotenv_path=os.path.join(PROJECT_ROOT, '.env.local'))
GENAI_API_KEY = os.getenv('VITE_GEMINI_API_KEY')

DATA_DIR = os.path.join(PROJECT_ROOT, 'public', 'data')
MANIFEST_FILE = os.path.join(DATA_DIR, 'languages.json')
PROGRESS_FILE = os.path.join(PROJECT_ROOT, 'scripts', 'ingest_progress.json')

class ExtractionEngine:
    def extract(self, text, lang_name):
        raise NotImplementedError

class LocalNLPEngine(ExtractionEngine):
    def __init__(self):
        print("  [Local] Initializing Heuristic Engine...")
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            self.nlp = None

    def is_translation_char(self, char):
        # Treat anything non-ASCII or specific symbols as translation text
        # to handle PDFs with custom font mapping (where Telugu is stored as Latin symbols)
        return ord(char) > 127 or char in '~#<>[]'

    def extract(self, text, lang_name):
        entries = []
        # Regex to match: English [pronunciation], pos - meaning
        # Optional number between english and pronunciation
        pattern = r"^\s*(?P<english>[a-zA-Z\s\-']+?)(?:\s+\d+)?\s*\[(?P<pronunciation>[^\]]*)\]\s*,\s*(?P<pos>[^-\s]+)?\s*-\s*(?P<translation>.+)$"
        
        for line in text.split('\n'):
            line = line.strip()
            if not line: continue
            
            match = re.match(pattern, line, re.I)
            if match:
                entries.append({
                    "english": match.group("english").strip(),
                    lang_name.lower(): match.group("translation").strip(),
                    "pos": match.group("pos").strip() if match.group("pos") else "",
                    "pronunciation": match.group("pronunciation").strip()
                })
        
        return entries

class GeminiEngine(ExtractionEngine):
    def __init__(self, model_name='gemini-2.0-flash'):
        if not GENAI_API_KEY:
            raise ValueError("VITE_GEMINI_API_KEY not found in .env.local")
        genai.configure(api_key=GENAI_API_KEY)
        self.model = genai.GenerativeModel(model_name)

    def extract(self, text, lang_name):
        # Updated prompt for the new format
        prompt = f"""
        You are a dictionary data extractor. The provided text is from an English to {lang_name} dictionary.
        Format per line: Word [Pronunciation], PartOfSpeech - Meaning
        Example: "develop 160 [develop], verb - abhivruddi cheyyu"
        
        Extract word pairs into JSON array:
        {{ 
          "english": "string", 
          "{lang_name.lower()}": "string", 
          "pos": "string", 
          "pronunciation": "string" 
        }}
        
        IMPORTANT: If the {lang_name} text is scrambled/encoded in a custom font, map it back to real scripts.
        IGNORE page numbers and serial numbers.
        
        TEXT:
        \"\"\"{text}\"\"\"
        """
        
        for attempt in range(3):
            try:
                # Add delay to respect 15 RPM limit (each batch is one request)
                # With 20-page batches, we only need ~10 requests for a 200-page book
                response = self.model.generate_content(prompt)
                cleaned = response.text.strip().replace('```json', '').replace('```', '')
                return json.loads(cleaned)
            except Exception as e:
                print(f"  [Error] Batch failed: {e}. Retrying...")
                time.sleep(10)
        return []

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_progress(lang, last_page):
    progress = load_progress()
    progress[lang] = last_page
    if not os.path.exists(os.path.dirname(PROGRESS_FILE)):
        os.makedirs(os.path.dirname(PROGRESS_FILE))
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2)

def update_manifest(lang_name, file_name):
    if not os.path.exists(MANIFEST_FILE):
        manifest = {"languages": []}
    else:
        with open(MANIFEST_FILE, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
    
    if not any(l['name'].lower() == lang_name.lower() for l in manifest['languages']):
        manifest['languages'].append({"name": lang_name.capitalize(), "file": file_name})
        with open(MANIFEST_FILE, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2)

def main():
    print("=== Universal Ingestor V5.1 (Optimized API + Flexible Models) ===")
    print("1. Local Heuristic (No API Key, FAST)")
    print("2. Gemini API Engine (SMART, converts symbols to real script)")
    choice = input("Select Extraction Engine (1 or 2): ").strip()
    
    if choice == '2':
        model_name = input("Enter model name [default: gemini-2.0-flash]: ").strip()
        if not model_name: model_name = 'gemini-2.0-flash'
        engine = GeminiEngine(model_name)
    else:
        engine = LocalNLPEngine()
    lang_name = input("Enter language: ").strip()
    pdf_path = input("Enter PDF path: ").strip()
    
    if not os.path.exists(pdf_path):
        print("Error: PDF not found.")
        return

    progress = load_progress()
    start_page = progress.get(lang_name, 0)
    
    # 20-30 page clusters reduce total API requests massively
    batch_size = 20 if choice == '2' else 50
    wait_time = 6 if choice == '2' else 0 # 6 second wait = Max 10 RPM (Safer than 15)

    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        for i in range(start_page, total_pages, batch_size):
            end_p = min(i + batch_size, total_pages)
            print(f"\n[Batch] Pages {i+1} to {end_p}...")
            
            text = ""
            for p in range(i, end_p):
                extracted = pdf.pages[p].extract_text()
                if extracted: text += extracted + "\n"
            
            if not text.strip():
                save_progress(lang_name, end_p)
                continue
                
            entries = engine.extract(text, lang_name)
            if entries:
                target_file = f"{lang_name.lower()}.json"
                target_path = os.path.join(DATA_DIR, target_file)
                
                existing = []
                if os.path.exists(target_path):
                    with open(target_path, 'r', encoding='utf-8') as f:
                        existing = json.load(f)
                
                existing.extend(entries)
                # Deduplicate
                seen = set()
                final = []
                for e in existing:
                    key = e['english'].lower().strip()
                    if key not in seen:
                        final.append(e)
                        seen.add(key)
                
                with open(target_path, 'w', encoding='utf-8') as f:
                    json.dump(final, f, indent=2, ensure_ascii=False)
                
                update_manifest(lang_name, target_file)
                print(f"  [Done] Extracted {len(entries)} entries. (Total: {len(final)})")
                save_progress(lang_name, end_p)
            else:
                print("  [Warning] No data found in this batch.")
            
            if choice == '2' and end_p < total_pages:
                time.sleep(wait_time)

if __name__ == "__main__":
    main()
