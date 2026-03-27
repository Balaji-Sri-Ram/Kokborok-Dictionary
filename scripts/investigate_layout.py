
import pdfplumber

def investigate():
    with pdfplumber.open("6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf") as pdf:
        # 1. Search for 'choose'
        print("Searching for 'choose'...")
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text and "choose" in text.lower():
                # Check context to ensure it's a headword
                # Look for "choose [" or similar
                if "choose [" in text or "choose[" in text:
                    print(f"FOUND 'choose' HEADWORD on Page Index {i}")
                    print(text[:200].replace('\n', ' '))
                    break
        
        # 2. Test Table Extraction on Page 282 (Numbers)
        print("\nTesting Table Extraction on Page 282...")
        try:
            p282 = pdf.pages[281] # Index 281? User said 282 was One.
            # My previous output said "page": 282. So index 281.
            tables = p282.extract_tables()
            if tables:
                print(f"Found {len(tables)} tables.")
                for row in tables[0][:5]: # Print first 5 rows
                    print(row)
            else:
                print("No tables found on Page 282.")
                # Print raw lines to see column spacing
                print("Raw lines sample:")
                print(p282.extract_text().split('\n')[:10])
        except Exception as e:
            print(f"Error extracting table: {e}")

if __name__ == "__main__":
    investigate()
