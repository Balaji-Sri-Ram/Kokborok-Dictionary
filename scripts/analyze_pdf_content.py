
import pdfplumber
import re

PDF_PATH = "6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf"

def analyze_pdf():
    with pdfplumber.open(PDF_PATH) as pdf:
        print(f"Total Pages: {len(pdf.pages)}")
        
        # 1. Dump Pages 280-286 (Indices 279-285)
        print("\n--- DUMPING PAGES 280-286 ---")
        for i in range(279, 286):
            if i >= len(pdf.pages): break
            text = pdf.pages[i].extract_text()
            print(f"\n[PAGE {i+1}]")
            print(text if text else "<NO TEXT EXTRACTED>")
            
        # 2. Search for T-Z start
        # Look for headers like "T", "U", "V"... or words starting with these
        print("\n--- SEARCHING FOR T-Z ---")
        found_t = False
        found_z = False
        
        for i in range(len(pdf.pages)):
            text = pdf.pages[i].extract_text()
            if not text: continue
            
            # Simple heuristic: Look for entries starting with T/Z
            # Regex: Start of line, T or Z followed by letters, then [pronunciation]
            if not found_t and re.search(r"^\s*take\s*\[", text, re.I | re.M):
                print(f"Potential 'T' section (take) on Page {i+1}")
                found_t = True
            
            if not found_z and re.search(r"^\s*zone\s*\[", text, re.I | re.M):
                print(f"Potential 'Z' section (zone) on Page {i+1}")
                found_z = True
                
            if found_t and found_z: break

if __name__ == "__main__":
    analyze_pdf()
