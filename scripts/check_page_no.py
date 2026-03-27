
import pdfplumber

def check_printed_pages():
    with pdfplumber.open("6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf") as pdf:
        indices = [0, 279, 319] # Cover, User's 280, End
        
        for i in indices:
            if i < len(pdf.pages):
                text = pdf.pages[i].extract_text()
                # Get last few lines for footer
                lines = text.split('\n')
                footer = lines[-3:] if len(lines) > 3 else lines
                print(f"--- PDF PAGE INDEX {i} (Slide {i+1}) ---")
                print("Footer/Content Snippet:")
                for l in footer: print(f"  {l}")
                print("---------------------------------------")

if __name__ == "__main__":
    check_printed_pages()
