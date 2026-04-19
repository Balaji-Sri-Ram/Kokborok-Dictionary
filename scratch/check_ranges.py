import sys

def check_ranges(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    ranges = {}
    for char in content:
        if ord(char) < 128:
            cat = 'ASCII'
        elif 0x0C00 <= ord(char) <= 0x0C7F:
            cat = 'Telugu'
        else:
            cat = f'Other (U+{ord(char):04X})'
        
        ranges[cat] = ranges.get(cat, 0) + 1
    
    for cat, count in sorted(ranges.items(), key=lambda x: x[1], reverse=True):
        print(f"{cat}: {count}")

if __name__ == "__main__":
    check_ranges(sys.argv[1])
