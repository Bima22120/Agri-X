import urllib.request
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://www.bi.go.id/hargapangan"
req = urllib.request.Request(
    url,
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
        print(f"HTTP Status: {resp.status}")
        print(f"Length: {len(html)} bytes")
        with open("f:/AgriX/system/pipeline/bi_hargapangan_sample.html", "w", encoding="utf-8") as f:
            f.write(html)
            
        # Title
        title = re.findall(r"<title>(.*?)</title>", html, re.IGNORECASE)
        print("Title:", title)
        
        # Look for links, tables, iframe, or api scripts
        apis = re.findall(r"['\"](/[a-zA-Z0-9_\-\./]*(?:api|ajax|json|data|harga|tabel|wholesale|pedagang)[a-zA-Z0-9_\-\./]*)['\"]", html, re.IGNORECASE)
        print("Potential endpoints in HTML:")
        for ep in sorted(set(apis))[:15]:
            print(" -", ep)
            
        # Check script tags
        scripts = re.findall(r"<script[^>]*src=[\"'](.*?)[\"']", html, re.IGNORECASE)
        print("\nScripts found:", len(scripts))
        for s in scripts[:10]:
            print(" -", s)
            
        # Check iframes
        iframes = re.findall(r"<iframe[^>]*src=[\"'](.*?)[\"']", html, re.IGNORECASE)
        print("\nIframes found:", iframes)
except Exception as e:
    print("Error:", e)
