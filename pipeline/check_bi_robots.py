import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://www.bi.go.id/robots.txt"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
        print("Status:", r.status)
        content = r.read().decode("utf-8", errors="ignore")
        print("Robots length:", len(content))
        print("Content sample:\n", content[:500])
except Exception as e:
    print("Error:", e)
