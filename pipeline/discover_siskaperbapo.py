import urllib.request
import ssl
import re
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://siskaperbapo.jatimprov.go.id/harga-komoditas"
req = urllib.request.Request(
    url,
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
        print(f"HTTP Status: {resp.status}")
        print(f"Total HTML length: {len(html)} bytes")
        
        # Check title
        title_match = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
        if title_match:
            print("Title:", title_match.group(1).strip())
            
        # Check script sources and inline data
        scripts = re.findall(r"<script[^>]*src=[\"'](.*?)[\"']", html, re.IGNORECASE)
        print("\nScripts found:", len(scripts))
        for s in scripts[:10]:
            print(" -", s)
            
        # Check for XHR / API / fetch endpoints in JS
        endpoints = re.findall(r"['\"](/[a-zA-Z0-9_\-\./]*(?:api|ajax|json|data|harga|komoditas|get)[a-zA-Z0-9_\-\./]*)['\"]", html, re.IGNORECASE)
        print("\nPotential API / Ajax endpoints in page:")
        for ep in sorted(set(endpoints))[:15]:
            print(" -", ep)
            
        # Check for forms, inputs, selects (filters: tanggal, pasar, komoditas, kab/kota)
        forms = re.findall(r"<select[^>]*name=[\"'](.*?)[\"'][^>]*>", html, re.IGNORECASE)
        print("\nFilter selects found:", forms)
        
        # Check tables
        tables = re.findall(r"<table[^>]*>", html, re.IGNORECASE)
        print("\nTables found:", len(tables))
        
        # Sample table header
        th_list = re.findall(r"<th[^>]*>(.*?)</th>", html, re.IGNORECASE | re.DOTALL)
        print("\nTable headers (TH):")
        for th in [re.sub(r"<[^>]+>", "", x).strip() for x in th_list][:15]:
            if th:
                print(" -", th)
                
        # Look for CSRF token or date parameters
        csrf = re.findall(r"name=[\"']csrf[_\-]?token[\"'][^>]*value=[\"'](.*?)[\"']", html, re.IGNORECASE)
        if csrf:
            print("\nCSRF Token found:", csrf[0])
            
        with open("f:/AgriX/system/pipeline/siskaperbapo_sample.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("\nSaved sample HTML to f:/AgriX/system/pipeline/siskaperbapo_sample.html")
except Exception as e:
    print("Error fetching siskaperbapo:", e)
