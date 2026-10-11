import urllib.request
import urllib.parse
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Test 1: Fetch markets JSON for Surabaya
print("--- TEST 1: pasar.json/surabayakota ---")
url_pasar = "https://siskaperbapo.jatimprov.go.id/harga/pasar.json/surabayakota"
req1 = urllib.request.Request(url_pasar, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
try:
    with urllib.request.urlopen(req1, context=ctx, timeout=10) as resp:
        data1 = json.loads(resp.read().decode("utf-8"))
        print(f"Markets count: {len(data1)}")
        for m in data1[:5]:
            print(f"  Market: {m}")
except Exception as e:
    print("Error 1:", e)

# Test 2: Fetch tabel.nodesign for Surabaya on 2026-10-11
print("\n--- TEST 2: tabel.nodesign POST ---")
url_tabel = "https://siskaperbapo.jatimprov.go.id/harga/tabel.nodesign"
form_data = urllib.parse.urlencode({
    "tanggal": "2026-10-11",
    "kabkota": "surabayakota",
    "pasar": ""
}).encode("utf-8")

req2 = urllib.request.Request(
    url_tabel, 
    data=form_data, 
    headers={
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest"
    }
)
try:
    with urllib.request.urlopen(req2, context=ctx, timeout=10) as resp:
        html2 = resp.read().decode("utf-8", errors="ignore")
        print(f"Response length: {len(html2)} bytes")
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html2, "html.parser")
        table = soup.find("table")
        if table:
            rows = table.find_all("tr")
            print(f"Rows count in tabel.nodesign: {len(rows)}")
            for r in rows[:6]:
                cols = [td.text.strip() for td in r.find_all(["td", "th"])]
                print("  Row:", cols)
        with open("f:/AgriX/system/pipeline/siskaperbapo_tabel_nodesign.html", "w", encoding="utf-8") as out_f:
            out_f.write(html2)
        print("Saved to f:/AgriX/system/pipeline/siskaperbapo_tabel_nodesign.html")
except Exception as e:
    print("Error 2:", e)
