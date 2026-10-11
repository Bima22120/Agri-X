import urllib.request
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

candidates = [
    "https://hargapangan.id",
    "https://www.bi.go.id/hargapangan",
    "https://hargapangan.id/tabel-harga/pasar-tradisional/daerah",
    "https://hargapangan.id/tabel-harga/pedagang-besar/daerah",
    "https://hargapangan.id/robots.txt"
]

for url in candidates:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            print(f"URL: {url} -> Status: {resp.status}, Length: {len(resp.read())}")
    except Exception as e:
        print(f"URL: {url} -> Error: {e}")
