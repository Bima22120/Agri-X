with open("f:/AgriX/system/pipeline/bi_pedagang_besar_sample.html", "r", encoding="utf-8") as f:
    html = f.read()

import re
matches = re.findall(r"function\s+OnBeforeSend\b[\s\S]{1,600}", html)
for m in matches:
    print(m)
