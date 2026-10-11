import urllib.request
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

base = "https://www.bi.go.id"

# Check GetRefProvince, GetRefCommodityAndCategory, GetRefPriceType
endpoints = [
    "/hargapangan/WebSite/TabelHarga/GetRefProvince",
    "/hargapangan/WebSite/TabelHarga/GetRefPriceType",
    "/hargapangan/WebSite/TabelHarga/GetRefCommodityAndCategory"
]

for ep in endpoints:
    url = base + ep
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
            data = json.loads(r.read().decode("utf-8"))
            print(f"\nEndpoint {ep} -> Type: {type(data)}, Count: {len(data) if isinstance(data, (list, dict)) else 'N/A'}")
            if isinstance(data, list):
                print("Sample item:", data[0])
            elif isinstance(data, dict):
                print("Keys:", list(data.keys())[:5])
                for k in list(data.keys())[:2]:
                    print(f"  {k}:", data[k])
    except Exception as e:
        print(f"Error {ep}:", e)
