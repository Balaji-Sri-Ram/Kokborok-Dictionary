
import pdfplumber

def dump_debug():
    with pdfplumber.open('6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf') as pdf:
        output = []
        
        # 1. Search for Account area (Pg 10-15)
        output.append("--- SCANNING FOR ACCOUNT (Pg 10-15) ---")
        for i in range(10, 16):
            text = pdf.pages[i].extract_text() or ""
            if "accompany" in text or "account" in text:
                output.append(f"\n[[PAGE {i+1} START]]\n")
                output.append(text)
                output.append(f"\n[[PAGE {i+1} END]]\n")

        # 2. Search for Raw area (Pg 200-320)
        output.append("\n--- SCANNING FOR RAW (Pg 200-320) ---")
        for i in range(200, 320):
            text = pdf.pages[i].extract_text() or ""
            # Strict word boundary check for Raw to avoid "Drawing" etc.
            if "Raw" in text and "Ration" in text:
                 output.append(f"\n[[PAGE {i+1} START]]\n")
                 output.append(text)
                 output.append(f"\n[[PAGE {i+1} END]]\n")
                 break

        with open('debug_dump.txt', 'w', encoding='utf-8') as f:
            f.write("".join(output))
        print("Dump saved to debug_dump.txt")

if __name__ == "__main__":
    dump_debug()
