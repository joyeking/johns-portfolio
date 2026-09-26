from pathlib import Path
from urllib.request import urlopen
from xml.etree import ElementTree as ET
import re, html
root=Path(__file__).parent
sitemap=root/'sitemap.xml'
urls=re.findall(r'<loc>(.*?)</loc>', sitemap.read_text(encoding='utf-8'))
out=root/'source-pages';out.mkdir(exist_ok=True)
for url in urls:
    path=url.removeprefix('https://appreciative-methods-876869.framer.app').strip('/') or 'home'
    filename=path.replace('/','__')+'.html'
    try:
        raw=urlopen(url,timeout=30).read().decode('utf-8',errors='replace')
        (out/filename).write_text(raw,encoding='utf-8')
        title=re.search(r'<title>(.*?)</title>',raw,re.S)
        desc=re.search(r'<meta[^>]+name="description"[^>]+content="([^"]*)"',raw,re.S)
        print(f'{path or "home"}\t{len(raw)}\t{html.unescape(re.sub("<.*?>","",title.group(1))).strip() if title else ""}\t{html.unescape(desc.group(1)) if desc else ""}')
    except Exception as e: print(path,'ERROR',e)
