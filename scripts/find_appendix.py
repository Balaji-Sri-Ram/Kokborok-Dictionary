
import pdfplumber
import re

PDF_PATH = "6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf"

def find_appendix():
    with pdfplumber.open(PDF_PATH) as pdf:
        # Search last 50 pages for "Appendix"
        start_page = max(0, len(pdf.pages) - 50)
        for i in range(start_page, len(pdf.pages)):
            text = pdf.pages[i].extract_text()
            if "Appendix" in text or "APPENDIX" in text:
              if "XII" in text or "Numbers" in text or "NUMBERS" in text:
                print(f"Found potential Appendix XII on page {i+1}")
                print(text[:500]) # Print start of page to verify

if __name__ == "__main__":
    find_appendix()
