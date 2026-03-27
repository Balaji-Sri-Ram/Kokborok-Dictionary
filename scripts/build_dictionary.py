
import pdfplumber
import re
import json

PDF_PATH = "6 - PDF Copy - English-Kokborok-Bengali Dictionary.pdf"
OUTPUT_PATH = "src/data/dictionary.json"

def clean_text(text):
    if not text: return ""
    return text.strip().replace('\n', ' ').replace('  ', ' ')

def extract_dictionary(pdf_path, output_path):
    print(f"Opening {pdf_path}...")
    dictionary_entries = []
    
    # POS specific pattern to separating definitions
    # Capture standard tags like n., v.t., adj.
    # ADDED \s*[,–-]?\s* at start to handle newlines, commas, or dashes before POS tag
    # EXTENDED list based on dictionary introduction (sorted by length desc for correctness)
    pos_types = [
        "v\\.t\\.i\\.", "interro\\.", "interj\\.", "indef\\.", "imper\\.", "pr\\.v\\.", 
        "v\\.t\\.", "v\\.i\\.", "suff\\.", "pref\\.", "pron\\.", "prep\\.", "conj\\.", 
        "abbr\\.", "f\\.v\\.", "p\\.t\\.", "p\\.v\\.", "adj\\.", "adv\\.", "aux\\.", 
        "vt\\.", "vi\\.", "n\\.", "v\\."
    ]
    pos_regex_str = "|".join(pos_types)
    pos_pattern = re.compile(r"^\s*[,–-]?\s*((?:" + pos_regex_str + r")+)\s*[-–]?\s*(.*)", re.DOTALL | re.IGNORECASE)

    # Dictionary Entry Pattern: Word [pronunciation]
    # Allow unicode dashes
    entry_pattern = re.compile(r"([a-zA-Z\s/\-\u2010-\u201F]+)\s*\[(.+?)\]")
    
    # Number Table Entry: 1 One sa  OR  1. One sa
    number_pattern = re.compile(r"^(\d+)\.?\s+([a-zA-Z]+)\s+(.+)")

    # Vocabulary mapping for numbers (1-100)
    number_vocab = {
        "One": "sa", "Two": "nwi", "Three": "tham", "Four": "brwi", "Five": "ba",
        "Six": "dok", "Seven": "sni", "Eight": "char", "Nine": "chuku", "Ten": "chi",
        "Twenty": "nwipe", "Thirty": "thampe", "Forty": "brwipe", "Fifty": "bape",
        "Sixty": "dokpe", "Seventy": "snipe", "Eighty": "charpe", "Ninety": "chukupe",
        "Hundred": "ra", "Thousand": "sai", "Lakh": "rwjak", "Crore": "kuti"
    }

    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            print(f"Total pages: {total_pages}")

            for i in range(total_pages):
                page = pdf.pages[i]
                
                # --- COLUMN AWARE EXTRACTION (4-Column Layout) ---
                width = page.width
                height = page.height
                
                # Helper to safely crop and extract
                def get_col_text(x1, x2):
                    bbox = (x1, 0, x2, height)
                    try:
                        return page.crop(bbox=bbox).extract_text() or ""
                    except ValueError:
                        return ""

                # Check for numbers page (280-285) - Use 2 Columns for Table
                if i >= 279 and i <= 285:
                     text_l = get_col_text(0, width * 0.5)
                     text_r = get_col_text(width * 0.5, width)
                     full_text = text_l + "\n" + text_r
                else:
                     # Main Dictionary: 4 Column Split
                     # Because "Account" and "Accuse" appear side-by-side in Left Half
                     col_w = width / 4
                     text_1 = get_col_text(0, col_w)
                     text_2 = get_col_text(col_w, col_w * 2)
                     text_3 = get_col_text(col_w * 2, col_w * 3)
                     text_4 = get_col_text(col_w * 3, width)
                     full_text = text_1 + "\n" + text_2 + "\n" + text_3 + "\n" + text_4
                
                # Global cleanup
                full_text = full_text + "" 
                # -------------------------------

                # Process merged text line by line
                lines = full_text.split('\n')
                print(f"Processing page {i+1}/{total_pages}...")

                # 1. Check for Numbers Appendix (Found around PDF Page 280)
                # The Numbers Table is consistently in this range.
                if i >= 279 and i <= 285:
                    print(f"Scanning match-based numbers on page {i+1}")
                    for line in lines:
                        line = line.strip()
                        found_vocab = False
                        for eng_num, kok_num in number_vocab.items():
                            # Loose match to catch "1 One sa" or "One - sa"
                            if eng_num.lower() in line.lower(): 
                                 # Regex: digits? .? English ... Kokborok
                                 # Allow for "1. One sa", "One sa", "30. Thirty" etc.
                                 vocab_pattern = re.compile(rf"^(\d{{0,3}})\.?\s*({eng_num})\s+([a-zA-Z\s]+)", re.IGNORECASE)
                                 v_match = vocab_pattern.search(line)
                                 if v_match:
                                     digits, eng, kok = v_match.groups()
                                     entry = {
                                         "english": eng.strip(),
                                         "pronunciation": digits.strip(), # Might be empty
                                         "pos": "Number",
                                         "kokborok": kok.strip(),
                                         "bengali": "",
                                         "page": i + 1
                                     }
                                     dictionary_entries.append(entry)
                                     found_vocab = True
                                     break
                        if found_vocab: continue

                # 2. Standard Dictionary Entries
                for line in lines:
                    line = line.strip()
                    if not line: continue

                    # Find ALL headwords in the line (e.g., "word1 [p] ... word2 [p] ...")
                    matches = list(entry_pattern.finditer(line))
                    
                    if matches:
                        for idx, match in enumerate(matches):
                            headword, pronunciation = match.groups()
                            headword = clean_text(headword)
                            # Skip if headword is likely noise (too long or numbers)
                            if len(headword) > 40: continue

                            # Determine content range for this entry
                            start = match.end()
                            end = matches[idx+1].start() if idx + 1 < len(matches) else len(line)
                            remainder = line[start:end].strip()
                            
                            entry = {
                                "english": headword,
                                "pronunciation": pronunciation,
                                "pos": "",
                                "kokborok": "",
                                "bengali": "",
                                "page": i + 1
                            }
                            dictionary_entries.append(entry)
                            
                            pos_match = pos_pattern.search(remainder)
                            if pos_match:
                                entry["pos"] = pos_match.group(1).strip()
                                entry["kokborok"] = pos_match.group(2).strip()
                            else:
                                entry["kokborok"] = remainder
                    
                    elif number_pattern.search(line) and "Appendix" in full_text:
                         # Fallback number regex
                         n_match = number_pattern.search(line)
                         digits, eng, kok = n_match.groups()
                         # Double check it looks like a number entry
                         if eng in number_vocab:
                             entry = {
                                "english": clean_text(eng),
                                "pronunciation": digits,
                                "pos": "Number",
                                "kokborok": kok.strip(),
                                "bengali": "",
                                "page": i + 1
                             }
                             dictionary_entries.append(entry)

                    else:
                        # Continuation of previous entry
                        # If the line had NO new entries, it belongs to the previous entry
                        if dictionary_entries:
                            last_entry = dictionary_entries[-1]
                            # Only append if page aligns
                            if last_entry["page"] == i + 1:
                                if not last_entry["pos"]:
                                    pos_match = pos_pattern.search(line)
                                    if pos_match:
                                        last_entry["pos"] = pos_match.group(1).strip()
                                        last_entry["kokborok"] += " " + pos_match.group(2).strip()
                                        continue
                                last_entry["kokborok"] += " " + line

    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return

    print(f"Extracted {len(dictionary_entries)} total entries.")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(dictionary_entries, f, indent=2, ensure_ascii=False)
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    extract_dictionary(PDF_PATH, OUTPUT_PATH)
