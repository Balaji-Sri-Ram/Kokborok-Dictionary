
import pdfplumber

def find_page():
    with pdfplumber.open("6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf") as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text and "Appendix-XII" in text:
                print(f"PAGE_FOUND: {i+1}")
                print(text[:200])
                break

if __name__ == "__main__":
    find_page()
