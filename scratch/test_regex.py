import re

text = """
develop 160 [develop], verb - abhivruddi cheyyu
different 161 [difrent], adj. - veru
do 162 [du], verb - cheyyu
eat 163 [it], verb - tinu
end 164 [end], noun - mugimpu
"""

pattern = r"^\s*(?P<english>[a-zA-Z\s\-']+?)(?:\s+\d+)?\s*\[(?P<pronunciation>[^\]]*)\]\s*,\s*(?P<pos>[^-\s]+)?\s*-\s*(?P<translation>.+)$"

for line in text.split('\n'):
    line = line.strip()
    if not line: continue
    
    match = re.match(pattern, line, re.I)
    if match:
        print(f"Match found: {match.group('english')} | {match.group('pronunciation')} | {match.group('pos')} | {match.group('translation')}")
    else:
        print(f"No match: {line}")
