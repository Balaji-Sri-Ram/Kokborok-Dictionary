
import pdfplumber

def debug_cols():
    with pdfplumber.open('6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf') as pdf:
        
        # PAGE 13 (Account/Accuse)
        page13 = pdf.pages[12]
        width = page13.width
        height = page13.height
        
        crop_l = page13.crop(bbox=(0, 0, width*0.5, height))
        crop_r = page13.crop(bbox=(width*0.5, 0, width, height))
        
        l_text = crop_l.extract_text()
        r_text = crop_r.extract_text()
        
        with open('debug_cols_13.txt', 'w', encoding='utf-8') as f:
            f.write("--- LEFT COL ---\n")
            f.write(l_text)
            f.write("\n\n--- RIGHT COL ---\n")
            f.write(r_text)

        # PAGE 259 (Ration/Raw estimate)
        # Search for Ration around 250-270
        raw_page = None
        for i in range(250, 270):
             txt = pdf.pages[i].extract_text()
             if "Ration" in txt:
                 raw_page = pdf.pages[i]
                 print(f"Ration found on Page {i+1}")
                 break
        
        if raw_page:
            width = raw_page.width
            height = raw_page.height
            crop_l = raw_page.crop(bbox=(0, 0, width*0.5, height))
            crop_r = raw_page.crop(bbox=(width*0.5, 0, width, height))
            
            with open('debug_cols_raw.txt', 'w', encoding='utf-8') as f:
                f.write(f"--- LEFT COL (Page {raw_page.page_number}) ---\n")
                f.write(crop_l.extract_text())
                f.write(f"\n\n--- RIGHT COL (Page {raw_page.page_number}) ---\n")
                f.write(crop_r.extract_text())

if __name__ == "__main__":
    debug_cols()
