
import pdfplumber

def debug_short():
    with pdfplumber.open("6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf") as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text and "vicinity" in text.lower():
                idx = text.lower().find("vicinity")
                snippet = text[idx:idx+200]
                print(f"PAGE {i+1} SNIPPET:")
                print(snippet.replace('\n', ' <NL> '))
                break

if __name__ == "__main__":
    debug_short()
