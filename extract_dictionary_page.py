
import PyPDF2

filename = "6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf"

try:
    with open(filename, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        print(f"Total Pages: {len(reader.pages)}")
        
        # Read pages 20-25 (index 19-24)
        for i in range(19, 25):
            if i >= len(reader.pages): break
            page = reader.pages[i]
            text = page.extract_text()
            print(f"--- Page {i+1} ---")
            print(text)
            
except Exception as e:
    print(f"Error: {e}")
