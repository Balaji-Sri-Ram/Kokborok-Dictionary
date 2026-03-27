
import json
import sys

def verify():
    with open('src/data/dictionary.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"Total entries: {len(data)}")
    
    found_abundant = False
    found_one = False
    found_bangjak = False
    
    for entry in data:
        if entry['english'].lower().strip() == 'abundant':
            found_abundant = True
            print(f"Found 'abundant': {entry}")
        
        if entry['english'].lower().strip() == 'one':
            if entry['pos'].lower() == 'number':
                found_one = True
                print(f"Found 'One': {entry}")
            else:
                print(f"Found 'One' but POS is {entry['pos']}")
        
        if 'bangjak' in entry['kokborok'].lower():
            found_bangjak = True
            if entry['english'].lower().strip() != 'abundant' and 'abundant' not in entry['english'].lower():
                 print(f"WARNING: 'bangjak' found in entry for '{entry['english']}'")

    if not found_abundant: print("ERROR: 'abundant' not found as headword")
    if not found_one: print("ERROR: 'One' (Number) not found")
    
if __name__ == "__main__":
    verify()
