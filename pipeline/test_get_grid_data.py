import urllib.request
import urllib.parse
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

base = "https://www.bi.go.id"
url = f"{base}/hargapangan/WebSite/TabelHarga/GetGridDataDaerah"

params = {
    "price_type_id": "3", # 3 = Pedagang Besar (Wholesale)
    "comcat_id": "cat_1,com_3,com_4,cat_5,com_11,cat_6,com_12,cat_7,com_13,com_14,cat_8,com_15,com_16",
    "province_id": "16", # 16 = Jawa Timur
    "regency_id": "",
    "market_id": "",
    "tipe_laporan": "1",
    "start_date": "2026-10-01",
    "end_date": "2026-10-11"
}

query_string = urllib.parse.urlencode(params)
full_url = f"{url}?{query_string}"

print("Calling PIHPS GetGridDataDaerah...")
print("URL:", full_url)

req = urllib.request.Request(
    full_url,
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://www.bi.go.id/hargapangan/TabelHarga/PedagangBesarDaerah"
    }
)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=15) as r:
        print("Status:", r.status)
        raw_resp = r.read().decode("utf-8")
        print("Length:", len(raw_resp))
        data = json.loads(raw_resp)
        print("Response Type:", type(data))
        if isinstance(data, dict):
            print("Dict Keys:", list(data.keys()))
            if "data" in data:
                items = data["data"]
                print(f"Data items count: {len(items)}")
                for item in items[:4]:
                    print("Sample Item:", item)
            elif "data_grid" in data:
                items = data["data_grid"]
                print(f"Data grid items count: {len(items)}")
                for item in items[:4]:
                    print("Sample Item:", item)
        with open("f:/AgriX/system/pipeline/bi_grid_sample.json", "w", encoding="utf-8") as f:
            f.write(raw_resp)
        print("Saved raw response to f:/AgriX/system/pipeline/bi_grid_sample.json")
except Exception as e:
    print("Error calling GetGridDataDaerah:", e)
