
import pdfplumber
import re

def find_real_page():
    with pdfplumber.open("6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf") as pdf:
        # Start from page 100
        for i in range(100, len(pdf.pages)):
            text = pdf.pages[i].extract_text()
            if not text: continue
            
            # Check for generic keywords
            if ("Appendix" in text and "XII" in text) or ("NUMBERS" in text and "One" in text):
                print(f"MATCH_ON_PAGE_INDEX: {i}")
                print(text[:200])

if __name__ == "__main__":
    find_real_page()
