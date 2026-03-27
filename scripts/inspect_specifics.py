
import json
import pdfplumber

def inspect_data():
    # 1. JSON Inspection
    try:
        with open('src/data/dictionary.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print("\n--- JSON ENTRIES ---")
        targets = ["choose", "one", "1"]
        for entry in data:
            if entry['english'].strip().lower() in targets:
                print(f"FOUND: {entry}")
                
        # 2. PDF Page Index 280-ish Check (for Printed Page 560 claim)
        # I extracted numbers from around here. Let's see the footer.
        # User claims "page number 560"
        with pdfplumber.open("6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf") as pdf:
            # Check indices around 289-295 (where I found numbers before? No, found Z at 285)
            # Let's check ranges 280-300
            for i in range(280, 290):
                text = pdf.pages[i].extract_text()
                if not text: continue
                # Print footer (last line)
                lines = text.split('\n')
                if lines:
                    print(f"PDF Index {i} Footer: {lines[-1]}")
                    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_data()
