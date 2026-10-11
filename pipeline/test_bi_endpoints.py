import urllib.request
import ssl
import json
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

base = "https://www.bi.go.id"

# Test 1: GetCommoditiesTree
print("--- TEST 1: GetCommoditiesTree ---")
url1 = f"{base}/hargapangan/WebSite/Home/GetCommoditiesTree"
req1 = urllib.request.Request(url1, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
try:
    with urllib.request.urlopen(req1, context=ctx, timeout=10) as r:
        txt = r.read().decode("utf-8")
        print("Status:", r.status, "Length:", len(txt))
        data = json.loads(txt)
        print("Data sample:", json.dumps(data[:3], indent=2))
        with open("f:/AgriX/system/pipeline/bi_commodities_tree.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
except Exception as e:
    print("Error 1:", e)

# Test 2: PedagangBesarDaerah
print("\n--- TEST 2: PedagangBesarDaerah ---")
url2 = f"{base}/hargapangan/TabelHarga/PedagangBesarDaerah"
req2 = urllib.request.Request(url2, headers={"User-Agent": "Mozilla/5.0"})
try:
    with urllib.request.urlopen(req2, context=ctx, timeout=10) as r:
        txt2 = r.read().decode("utf-8", errors="ignore")
        print("Status:", r.status, "Length:", len(txt2))
        # Look for script or ajax endpoints in PedagangBesarDaerah
        calls = re.findall(r"['\"](/[a-zA-Z0-9_\-\./]*(?:Get|Ajax|Data|Grid|Table|Export)[a-zA-Z0-9_\-\./]*)['\"]", txt2, re.IGNORECASE)
        print("Calls in PedagangBesarDaerah:", set(calls))
        with open("f:/AgriX/system/pipeline/bi_pedagang_besar_sample.html", "w", encoding="utf-8") as f:
            f.write(txt2)
except Exception as e:
    print("Error 2:", e)
