
import pdfplumber
import json

def debug_vicinity():
    # 1. Search in JSON to see how it looks now
    try:
        data = json.load(open('src/data/dictionary.json', encoding='utf-8'))
        found = [e for e in data if 'vicinity' in e['english'].lower()]
        print("JSON Entry:", found)
    except: pass

    # 2. Search in PDF
    with pdfplumber.open("6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf") as pdf:
        print("\nScanning PDF for 'vicinity'...")
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text and "vicinity" in text.lower():
                print(f"FOUND ON PAGE INDEX {i}")
                # Print context
                idx = text.lower().find("vicinity")
                print(text[max(0, idx-100):min(len(text), idx+200)])
                break

if __name__ == "__main__":
    debug_vicinity()
