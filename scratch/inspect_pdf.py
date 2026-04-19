import pdfplumber
import sys
import io

# Ensure stdout can handle unicode
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def inspect_pdf(file_path):
    try:
        with pdfplumber.open(file_path) as pdf:
            print(f"Total Pages: {len(pdf.pages)}")
            # Sample pages where content actually starts
            pages_to_check = [1, 2, 50, 100]
            for p_num in pages_to_check:
                if p_num >= len(pdf.pages): continue
                print(f"\n--- Page {p_num + 1} ---")
                text = pdf.pages[p_num].extract_text()
                if text:
                    # Save to a temp file to avoid console issues
                    with open(f"scratch/page_{p_num+1}.txt", "w", encoding="utf-8") as f:
                        f.write(text)
                    print(f"Saved text to scratch/page_{p_num+1}.txt (First 200 chars: {text[:200]})")
                else:
                    print("No text found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        inspect_pdf(sys.argv[1])
    else:
        print("Please provide a PDF path.")
