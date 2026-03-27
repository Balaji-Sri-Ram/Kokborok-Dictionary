
import pdfplumber

def dump_raw_pages():
    with pdfplumber.open("6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf") as pdf:
        # Page 44 (index 43) for 'choose'
        p44 = pdf.pages[43]
        text44 = p44.extract_text()
        print(f"--- PAGE 44 RAW (Choose) ---")
        # Find 'choose' and print content around it
        idx = text44.lower().find("choose")
        if idx != -1:
            print(text44[max(0, idx-100):min(len(text44), idx+300)])
        else:
            print("String 'choose' not found in text!")
            print(text44[:500]) # Print start if not found

        # Page 282 (index 281) for 'One'
        p282 = pdf.pages[281]
        text282 = p282.extract_text()
        print(f"\n--- PAGE 282 RAW (Numbers) ---")
        # Find '1' or 'One'
        print(text282[:500]) # Just print the start/table

if __name__ == "__main__":
    dump_raw_pages()
