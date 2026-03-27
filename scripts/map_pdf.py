
import pdfplumber
import re

def map_sections():
    keywords = {
        "Numbers_Start": ["One", "sa", "Two", "nwi"],
        "T_Start": ["Take", "Time", "Table"],
        "Z_Start": ["Zone", "Zero", "Zoo", "Zeal"],
        "Appendix_XII": ["Appendix - XII", "Appendix-XII"]
    }
    
    with pdfplumber.open("6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf") as pdf:
        print(f"Total Pages: {len(pdf.pages)}")
        
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if not text: continue
            
            # Check keywords
            for key, words in keywords.items():
                # Check if ALL words in the list are present (for strong match)
                # Or at least 2 for robust match
                matches = [w for w in words if w in text]
                if len(matches) >= 2:
                    print(f"[{key}] Found on Page {i+1} (Index {i}): Found {matches}")
                    print(f"Context: {text[:100]}...")
            
            # Special check for user's slide 280-286 claims
            if 280 <= i+1 <= 286:
                print(f"[USER_RANGE_CHECK] Page {i+1} Start: {text[:50].replace(chr(10), ' ')}")

if __name__ == "__main__":
    map_sections()
