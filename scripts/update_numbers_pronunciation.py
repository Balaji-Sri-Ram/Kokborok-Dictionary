
import json

def update_pronunciation(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for entry in data:
        # User requested pronunciation to be same as English word
        # "like for one pronouciation is same 'one'"
        if entry.get('pos') == 'Number':
            entry['pronunciation'] = entry['english']
            
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Updated {len(data)} entries in {file_path}")

if __name__ == "__main__":
    update_pronunciation('src/data/numbers.json')
