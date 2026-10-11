import urllib.request
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://siskaperbapo.jatimprov.go.id/harga/tabel'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
    html = r.read().decode('utf-8', errors='ignore')
    with open('f:/AgriX/system/pipeline/siskaperbapo_tabel.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    scripts = re.findall(r'<script[\s\S]*?</script>', html, re.IGNORECASE)
    for s in scripts:
        if 'ajax' in s.lower() or 'url' in s.lower() or 'fetch' in s.lower() or 'datatable' in s.lower():
            print("SCRIPT FOUND:")
            print(s[:500])
