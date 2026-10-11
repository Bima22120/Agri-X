with open("f:/AgriX/system/pipeline/bi_pedagang_besar_sample.html", "r", encoding="utf-8") as f:
    html = f.read()

import re
match = re.search(r"function\s+OnBeforeSend\b[\s\S]*?\}", html)
if match:
    print(match.group(0))
