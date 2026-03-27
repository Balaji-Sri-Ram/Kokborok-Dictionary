
import pdfplumber

def locate_content():
    found_z = False
    found_nums = False
    
    with pdfplumber.open("6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf") as pdf:
        print(f"Total Pages: {len(pdf.pages)}")
        
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if not text: continue
            
            # Helper to print matches
            def report(tag):
                print(f"[{tag}] Found on Page Index {i} (Slide {i+1})")
                print(text[:100].replace('\n', ' '))
            
            # Z Section
            if not found_z and "zebra" in text.lower():
                report("Z_SECTION")
                found_z = True
                
            # Numbers Section (Look for tabular 1 One sa)
            # Use strict text check
            if "One" in text and "sa" in text and "Two" in text and "nwi" in text:
                 report("NUMBERS_EXACT")
                 found_nums = True
            
            # User's Claimed Range check
            if 279 <= i <= 286:
                if "One" in text or "sa" in text:
                    report(f"USER_RANGE_HIT_{i}")

if __name__ == "__main__":
    locate_content()
