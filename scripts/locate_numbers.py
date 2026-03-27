
import pdfplumber

PDF_PATH = "6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf"

def find_numbers_appendix():
    with pdfplumber.open(PDF_PATH) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if not text: continue
            if "Appendix" in text and "XII" in text:
                print(f"FOUND APPENDIX XII ON PAGE {i+1}")
                print(text[:300])
                return
            if "One" in text and "sa" in text and "Two" in text and "nwi" in text:
                 # Backup check if header is missing
                 print(f"Potential Numbers table on page {i+1}")
                 print(text[:100])

if __name__ == "__main__":
    find_numbers_appendix()
