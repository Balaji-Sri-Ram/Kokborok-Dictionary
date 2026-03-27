
import re
import json

if __name__ == "__main__":
    import sys
    # Re-encoding stdout is tricky in some envs, implies writing to file in script is safer
    output_path = "src/data/numbers.json"
    
    english_numerals = {
        "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
        "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
        "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
        "hundred", "thousand", "and", "&"
    }

    entries = []

    with open("scripts/numbers_raw.txt", 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Typos fix
        line = line.replace("wenty six", "Twenty six")
        line = line.replace("thousand&one", "thousand & one")
        line = line.replace("hundred&one", "hundred & one")
        line = line.replace("&one", "& one")
        line = line.replace("oneSnira", "one Snira")
        
        # Skip header or noise
        if "English" in line and "Kokborok" in line:
            continue
        
        # Try to match starting number
        match = re.match(r'^(\d+)\s+(.*)', line)
        if not match:
            continue
            
        number_str = match.group(1)
        remainder = match.group(2).strip()
        
        if not remainder:
            continue

        # Split remainder into words
        parts = remainder.split()
        
        english_part = []
        kokborok_part = []
        
        is_english = True
        for part in parts:
            clean_part = part.lower().replace(',', '')
            if is_english:
                if clean_part in english_numerals:
                    english_part.append(part)
                else:
                    # Found first non-English word
                    is_english = False
                    kokborok_part.append(part)
            else:
                kokborok_part.append(part)
        
        if not english_part:
            pass
            
        english_text = " ".join(english_part)
        
        final_str = " ".join(kokborok_part)
        
        # Strings to fix
        final_str = final_str.replace("saChukura", "sa, Chukura")
        final_str = final_str.replace("saSnira", "sa, Snira")
        
        processed = final_str
        # 1. Place comma before any Capital letter that follows a lowercase letter or space (but not start of string)
        processed = re.sub(r'(\S)\s+([A-Z])', r'\1, \2', processed)
        
        # 2. Place comma before "chi", "ra", "sai" if they are start of explanation
        processed = re.sub(r'(\S)\s+(chi\b|ra\b|sai\b)', r'\1, \2', processed)
        
        entries.append({
            "english": english_text,
            "pronunciation": "",
            "pos": "Number",
            "kokborok": processed,
            "bengali": "",
            "page": 0
        })

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)
