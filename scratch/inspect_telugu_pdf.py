import pdfplumber
import os

pdf_path = os.path.join("ingest", "english-telugu.pdf")
if not os.path.exists(pdf_path):
    print(f"Error: {pdf_path} not found")
else:
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total Pages: {len(pdf.pages)}")
        for i in range(min(5, len(pdf.pages))):
            text = pdf.pages[i].extract_text()
            print(f"\n--- PAGE {i+1} ---")
            print(text)
