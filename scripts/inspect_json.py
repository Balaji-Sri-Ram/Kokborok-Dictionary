
import json

def inspect():
    with open('src/data/dictionary.json', encoding='utf-8') as f:
        data = json.load(f)
    
    # 1. Who owns 'lekhama'?
    print("\n--- LEKHAMA OWNERS ---")
    for entry in data:
        if 'lekhama' in entry['kokborok']:
            print(json.dumps(entry, indent=2, ensure_ascii=False))

    # 2. Who owns 'kwthwng'?
    print("\n--- KWTHWNG OWNERS ---")
    for entry in data:
        if 'kwthwng' in entry['kokborok']:
            print(json.dumps(entry, indent=2, ensure_ascii=False))

    # 3. Check Account and Accuse specifically
    print("\n--- ACCOUNT/ACCUSE ---")
    for entry in data:
        if entry['english'] in ['account', 'accuse', 'raw', 'ration']:
             print(json.dumps(entry, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    inspect()
