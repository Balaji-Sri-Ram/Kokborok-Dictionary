
import pdfplumber
import re

PDF_PATH = "6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf"

def debug_pages():
    with pdfplumber.open(PDF_PATH) as pdf:
        # Page 12 for abrogate/absorption
        text_12 = pdf.pages[11].extract_text()
        print("--- PAGE 12 RAW START ---")
        print(text_12[:1000]) # First 1000 chars should cover it
        print("--- PAGE 12 RAW END ---")

        # Page 301 for Numbers
        text_301 = pdf.pages[300].extract_text()
        print("--- PAGE 301 RAW START ---")
        print(text_301[:1000])
        print("--- PAGE 301 RAW END ---")

        # Test Regex on snippet
        # mimic build_dictionary regex
        entry_pattern = re.compile(r"([a-zA-Z\s/-]+)\s*\[(.+?)\]")
        
        snippet = text_12[:1000]
        matches = list(entry_pattern.finditer(snippet))
        print(f"\nFound {len(matches)} matches in snippet:")
        for m in matches:
            print(f"Match: '{m.group(1)}' -> [{m.group(2)}]")

if __name__ == "__main__":
    debug_pages()
