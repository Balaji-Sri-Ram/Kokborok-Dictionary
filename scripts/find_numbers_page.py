
import pdfplumber

def find_numbers_page(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            # Check for actual content, skip ToC
            # Look for specific number mappings
            if "One" in text and "sa" in text and "Two" in text and "nwi" in text:
                print(f"!!! MATCH FOUND !!!")
                print(f"PAGE_INDEX: {i+1}")
                print(text[:200])
                return i
            
            # Fallback: check appendix header but ensure it's late in the book
            if ("Appendix-XII" in text or "Appendix - XII" in text) and i > 100:
                print(f"!!! HEADER FOUND !!!")
                print(f"PAGE_INDEX: {i+1}")
                print(text[:200])
                return i

if __name__ == "__main__":
    find_numbers_page("6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf")
