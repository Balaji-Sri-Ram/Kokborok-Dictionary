import os
import json
import pdfplumber
from docx import Document
from google import generativeai as genai
from dotenv import load_dotenv

# Load API Key from .env.local
load_dotenv(dotenv_path='.env.local')
GENAI_API_KEY = os.getenv('VITE_GEMINI_API_KEY') # Assuming this is the key from previous setup

if not GENAI_API_KEY:
    print("Error: VITE_GEMINI_API_KEY not found in .env.local")
    exit(1)

genai.configure(api_key=GENAI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(file_path):
    doc = Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

def ai_parse_to_json(text, lang_name):
    prompt = f"""
    You are a linguistic expert. I am providing you with text from a {lang_name} dictionary.
    Extract the word pairs into a JSON array of objects with this structure:
    {{
        "english": "string",
        "{lang_name.lower()}": "string",
        "pos": "n., v.t., adj., etc.",
        "pronunciation": "[bracketed text]"
    }}
    
    If the text contains Bengla or other languages, IGNORE THEM. Only focus on English and {lang_name}.
    Deduce the structure carefully. Return ONLY the JSON array.
    
    TEXT:
    \"\"\"{text[:5000]}\"\"\"
    """
    
    response = model.generate_content(prompt)
    try:
        # Strip markdown if present
        cleaned_response = response.text.strip().replace('```json', '').replace('```', '')
        return json.loads(cleaned_response)
    except Exception as e:
        print(f"Error parsing AI response: {e}")
        return []

def main():
    target_lang = input("Enter the language name (e.g., Uchoi): ").strip()
    file_path = input("Enter the path to the PDF/DOCX file: ").strip()
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print(f"--- Processing {target_lang} from {file_path} ---")
    
    # 1. Extract raw text
    if file_path.endswith('.pdf'):
        raw_text = extract_text_from_pdf(file_path)
    elif file_path.endswith('.docx'):
        raw_text = extract_text_from_docx(file_path)
    else:
        print("Unsupported file format. Use .pdf or .docx")
        return
    
    # 2. AI Parsing (In chunks if large)
    print("Consulting Gemini for accurate extraction...")
    parsed_entries = ai_parse_to_json(raw_text, target_lang)
    
    if not parsed_entries:
        print("No entries could be extracted.")
        return

    # 3. Merge with existing dictionary
    dict_path = 'src/data/dictionary.json'
    with open(dict_path, 'r', encoding='utf-8') as f:
        master_dict = json.load(f)
    
    count_updated = 0
    count_new = 0
    
    # Convert master dict to a map for faster lookup
    master_map = {{entry['english'].lower(): entry for entry in master_dict}}
    
    for entry in parsed_entries:
        eng = entry['english'].lower()
        lang_key = target_lang.lower()
        
        if eng in master_map:
            master_map[eng][lang_key] = entry[lang_key]
            count_updated += 1
        else:
            # Add new entry if not exists
            new_entry = {{
                "english": entry['english'],
                lang_key: entry[lang_key],
                "pos": entry.get('pos', ''),
                "pronunciation": entry.get('pronunciation', ''),
                "kokborok": "" # Explicitly empty for now
            }}
            master_dict.append(new_entry)
            count_new += 1
            
    # 4. Save results
    with open(dict_path, 'w', encoding='utf-8') as f:
        json.dump(master_dict, f, indent=2, ensure_ascii=False)
        
    print(f"--- SUCCESS ---")
    print(f"Updated: {{count_updated}} entries")
    print(f"Created: {{count_new}} new entries")
    print(f"Dictionary saved to {{dict_path}}")

if __name__ == "__main__":
    main()
