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
    print('Title:', re.findall(r'<title>(.*?)</title>', html))
    tables = re.findall(r'<table[^>]*>', html)
    print('Tables:', len(tables))
    selects = re.findall(r'<select[^>]*name=[\"\'](.*?)[\"\']', html)
    print('Selects:', selects)
    headers = re.findall(r'<th[^>]*>(.*?)</th>', html)
    print('THs:', [re.sub('<[^>]+>', '', x).strip() for x in headers][:15])
    form = re.findall(r'<form[^>]*action=[\"\'](.*?)[\"\'][^>]*method=[\"\'](.*?)[\"\']', html)
    print('Form:', form)
