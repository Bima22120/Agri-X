with open("f:/AgriX/system/pipeline/bi_pedagang_besar_sample.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "GetGridDataDaerah" in line:
        start = max(0, idx - 40)
        end = min(len(lines), idx + 20)
        print(f"Found on line {idx + 1}:")
        for i in range(start, end):
            print(f"{i+1}: {lines[i]}", end="")
        break
