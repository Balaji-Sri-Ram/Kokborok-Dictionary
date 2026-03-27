
import pdfplumber

def check_pages():
    with pdfplumber.open("6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf") as pdf:
        # User said 280 to 286. Let's look at 279 to 287 (0-indexed)
        for i in range(279, 287):
            if i < len(pdf.pages):
                text = pdf.pages[i].extract_text()
                print(f"--- PAGE {i+1} START ---")
                print(text[:300] if text else "NO TEXT")
                print("--- PAGE {i+1} END ---")

if __name__ == "__main__":
    check_pages()
