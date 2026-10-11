from bs4 import BeautifulSoup
import json
import re

with open("f:/AgriX/system/pipeline/siskaperbapo_sample.html", "r", encoding="utf-8") as f:
    html = f.read()

# Let's inspect without bs4 if bs4 not installed, or try importing
try:
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")
    
    # 1. Find form and filters
    form = soup.find("form")
    if form:
        print("Form action:", form.get("action"))
        print("Form method:", form.get("method"))
        inputs = form.find_all(["input", "select", "button"])
        print("Form fields:")
        for inp in inputs:
            name = inp.get("name")
            inp_type = inp.name if inp.name == "select" else inp.get("type", "text")
            val = inp.get("value", "")
            print(f"  - {name} ({inp_type}): {val}")
            
    # 2. Extract commodity options
    komoditas_select = soup.find("select", {"name": "komoditas"})
    if komoditas_select:
        options = komoditas_select.find_all("option")
        print(f"\nKomoditas options count: {len(options)}")
        sample_options = [(opt.get("value"), opt.text.strip()) for opt in options]
        for val, txt in sample_options[:15]:
            print(f"  ID {val}: {txt}")
        with open("f:/AgriX/system/pipeline/siskaperbapo_commodities.json", "w", encoding="utf-8") as out_f:
            json.dump([{"id": v, "name": t} for v, t in sample_options], out_f, indent=2, ensure_ascii=False)
            
    # 3. Extract table rows & columns
    table = soup.find("table")
    if table:
        headers = [th.text.strip() for th in table.find_all("th")]
        print(f"\nTable Headers ({len(headers)}):", headers)
        
        rows = table.find_all("tr")
        print(f"Table Rows count: {len(rows)}")
        sample_rows = []
        for r in rows[1:6]:
            cols = [td.text.strip() for td in r.find_all(["td", "th"])]
            sample_rows.append(cols)
            print("  Row:", cols)
            
    # 4. Check page scripts for AJAX / DataTables
    scripts = soup.find_all("script")
    print("\nInline JS snippets mentioning url/ajax/tabel:")
    for s in scripts:
        if s.string and any(k in s.string for k in ["ajax", "harga", "dataTable", "DataTable"]):
            print("--- JS Snippet ---")
            lines = s.string.strip().split("\n")
            for line in lines[:30]:
                print(line)

except ImportError:
    print("BeautifulSoup not installed, using regex...")
