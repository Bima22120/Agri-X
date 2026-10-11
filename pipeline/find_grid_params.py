import re

with open("f:/AgriX/system/pipeline/bi_pedagang_besar_sample.html", "r", encoding="utf-8") as f:
    html = f.read()

# Search for GetGridDataDaerah call
matches = re.findall(r"GetGridDataDaerah[\s\S]{1,500}", html)
for m in matches[:3]:
    print("MATCH:")
    print(m)
    print("-" * 50)
