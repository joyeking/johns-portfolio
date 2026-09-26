from pathlib import Path
import re,html
for p in sorted((Path(__file__).parent/'source-pages').glob('*.html')):
    raw=p.read_text(encoding='utf-8',errors='replace')
    raw=re.sub(r'<(script|style)[^>]*>.*?</\1>',' ',raw,flags=re.I|re.S)
    bits=[]
    for x in re.findall(r'>([^<>]{2,})<',raw):
        x=html.unescape(re.sub(r'\s+',' ',x)).strip()
        if x and x not in bits and not x.startswith('{') and len(x)<400: bits.append(x)
    print('\n###',p.stem)
    print('\n'.join(bits[:120]))
