import json
from datetime import datetime

# 1. Generate source_profile_pihps.json
pihps_profile = {
    "source_id": "pihps",
    "source_name": "Pusat Informasi Harga Pangan Strategis (PIHPS) Nasional",
    "owner": "Bank Indonesia",
    "base_url": "https://www.bi.go.id/hargapangan",
    "discovered_at": datetime.now().isoformat(),
    "access_method": {
        "type": "xhr_json",
        "description": "Direct JSON endpoints via HTTPS GET/POST",
        "primary_data_endpoint": "https://www.bi.go.id/hargapangan/WebSite/TabelHarga/GetGridDataDaerah",
        "metadata_endpoints": {
            "provinces": "https://www.bi.go.id/hargapangan/WebSite/TabelHarga/GetRefProvince",
            "regencies": "https://www.bi.go.id/hargapangan/WebSite/TabelHarga/GetRefRegency",
            "markets": "https://www.bi.go.id/hargapangan/WebSite/TabelHarga/GetRefMarket",
            "commodities": "https://www.bi.go.id/hargapangan/WebSite/TabelHarga/GetRefCommodityAndCategory",
            "price_types": "https://www.bi.go.id/hargapangan/WebSite/TabelHarga/GetRefPriceType"
        }
    },
    "request_parameters": {
        "price_type_id": "integer string (1: Pasar Tradisional, 2: Pasar Modern, 3: Pedagang Besar/Wholesale, 4: Produsen)",
        "comcat_id": "comma-separated commodity keys (e.g. 'cat_1,com_1,com_2,...')",
        "province_id": "string (e.g. '16' for Jawa Timur, or empty for all provinces/national)",
        "regency_id": "string (optional specific regency)",
        "market_id": "string (optional specific market)",
        "tipe_laporan": "integer string (1: Laporan Harian)",
        "start_date": "string date in YYYY-MM-DD",
        "end_date": "string date in YYYY-MM-DD"
    },
    "price_levels_supported": [
        {"id": 3, "code": "wholesale", "name": "Pedagang Besar", "is_primary_target": True},
        {"id": 1, "code": "traditional_retail", "name": "Pasar Tradisional", "is_primary_target": False},
        {"id": 2, "code": "modern_retail", "name": "Pasar Modern", "is_primary_target": False},
        {"id": 4, "code": "producer", "name": "Produsen", "is_primary_target": False}
    ],
    "geographic_scope": {
        "coverage": "National (34 provinces listed), regency/city, and market level",
        "jawa_timur_province_id": 16
    },
    "update_frequency": "daily (business days, typically updated morning 07:00-09:00 WIB)",
    "exposed_commodities": [
        {"id": "com_1", "name": "Beras Kualitas Bawah I", "category": "Beras", "unit": "kg", "is_priority": True},
        {"id": "com_2", "name": "Beras Kualitas Bawah II", "category": "Beras", "unit": "kg", "is_priority": True},
        {"id": "com_3", "name": "Beras Kualitas Medium I", "category": "Beras", "unit": "kg", "is_priority": True},
        {"id": "com_4", "name": "Beras Kualitas Medium II", "category": "Beras", "unit": "kg", "is_priority": True},
        {"id": "com_5", "name": "Beras Kualitas Super I", "category": "Beras", "unit": "kg", "is_priority": True},
        {"id": "com_6", "name": "Beras Kualitas Super II", "category": "Beras", "unit": "kg", "is_priority": True},
        {"id": "com_7", "name": "Daging Ayam Ras Segar", "category": "Daging Ayam", "unit": "kg", "is_priority": False},
        {"id": "com_8", "name": "Daging Sapi Kualitas 1", "category": "Daging Sapi", "unit": "kg", "is_priority": False},
        {"id": "com_9", "name": "Daging Sapi Kualitas 2", "category": "Daging Sapi", "unit": "kg", "is_priority": False},
        {"id": "com_10", "name": "Telur Ayam Ras Segar", "category": "Telur Ayam", "unit": "kg", "is_priority": False},
        {"id": "com_11", "name": "Bawang Merah Ukuran Sedang", "category": "Bawang Merah", "unit": "kg", "is_priority": True},
        {"id": "com_12", "name": "Bawang Putih Ukuran Sedang", "category": "Bawang Putih", "unit": "kg", "is_priority": True},
        {"id": "com_13", "name": "Cabai Merah Besar", "category": "Cabai Merah", "unit": "kg", "is_priority": True},
        {"id": "com_14", "name": "Cabai Merah Keriting", "category": "Cabai Merah", "unit": "kg", "is_priority": True},
        {"id": "com_15", "name": "Cabai Rawit Hijau", "category": "Cabai Rawit", "unit": "kg", "is_priority": True},
        {"id": "com_16", "name": "Cabai Rawit Merah", "category": "Cabai Rawit", "unit": "kg", "is_priority": True},
        {"id": "com_17", "name": "Minyak Goreng Curah", "category": "Minyak Goreng", "unit": "kg", "is_priority": False},
        {"id": "com_18", "name": "Minyak Goreng Kemasan Bermerk 1", "category": "Minyak Goreng", "unit": "kg", "is_priority": False},
        {"id": "com_19", "name": "Minyak Goreng Kemasan Bermerk 2", "category": "Minyak Goreng", "unit": "kg", "is_priority": False},
        {"id": "com_20", "name": "Gula Pasir Kualitas Premium", "category": "Gula Pasir", "unit": "kg", "is_priority": False},
        {"id": "com_21", "name": "Gula Pasir Lokal", "category": "Gula Pasir", "unit": "kg", "is_priority": False}
    ],
    "sample_raw_row": {
        "no": 1,
        "name": "Beras Kualitas Medium I",
        "level": 2,
        "01/10/2026": "14,950",
        "02/10/2026": "14,950",
        "05/10/2026": "14,950",
        "06/10/2026": "14,950"
    },
    "robots_txt_findings": {
        "url": "https://www.bi.go.id/robots.txt",
        "status": "connection_reset",
        "policy": "No public robots.txt found; pipeline will enforce strict 1 request per 2 seconds with jitter."
    }
}

with open("f:/AgriX/system/pipeline/source_profile_pihps.json", "w", encoding="utf-8") as f:
    json.dump(pihps_profile, f, indent=2, ensure_ascii=False)

# 2. Generate source_profile_siskaperbapo.json
siskaperbapo_profile = {
    "source_id": "siskaperbapo",
    "source_name": "Sistem Informasi Ketersediaan dan Perkembangan Harga Bahan Pokok (SISKAPERBAPO)",
    "owner": "Dinas Perindustrian dan Perdagangan (Disperindag) Pemprov Jawa Timur",
    "base_url": "https://siskaperbapo.jatimprov.go.id",
    "discovered_at": datetime.now().isoformat(),
    "access_method": {
        "type": "xhr_post_html_and_json",
        "description": "POST endpoint returning HTML table fragment for daily commodity prices, plus JSON endpoint for market references",
        "primary_data_endpoint": "https://siskaperbapo.jatimprov.go.id/harga/tabel.nodesign",
        "market_reference_endpoint": "https://siskaperbapo.jatimprov.go.id/harga/pasar.json/{kabkota_keycode}",
        "multi_date_endpoint": "https://siskaperbapo.jatimprov.go.id/harga-komoditas"
    },
    "request_parameters": {
        "tanggal": "string date in YYYY-MM-DD",
        "kabkota": "string keycode (e.g. 'surabayakota', 'malangkab', or empty for entire Provinsi Jawa Timur)",
        "pasar": "integer string market ID (or empty for all markets / regency average)"
    },
    "price_levels_supported": [
        {"code": "consumer_retail", "name": "Tabel Harga Konsumen (Pasar Tradisional / Eceran)", "is_primary_target": True}
    ],
    "geographic_scope": {
        "coverage": "Provinsi Jawa Timur (38 Kabupaten/Kota) and individual traditional markets within each regency/city",
        "regencies_cities_count": 38
    },
    "update_frequency": "daily (can have intraday updates; page reflects observation date)",
    "priority_commodities_mapping_sample": [
        {"source_name": "Beras Premium", "unit": "kg", "category": "rice", "is_priority": True},
        {"source_name": "Beras Medium", "unit": "kg", "category": "rice", "is_priority": True},
        {"source_name": "Cabe Merah Keriting", "unit": "kg", "category": "vegetables", "is_priority": True},
        {"source_name": "Cabe Merah Besar", "unit": "kg", "category": "vegetables", "is_priority": True},
        {"source_name": "Cabe Rawit Merah", "unit": "kg", "category": "vegetables", "is_priority": True},
        {"source_name": "Bawang Merah", "unit": "kg", "category": "vegetables", "is_priority": True},
        {"source_name": "Bawang Putih", "unit": "kg", "category": "vegetables", "is_priority": True},
        {"source_name": "Tomat", "unit": "kg", "category": "vegetables", "is_priority": True},
        {"source_name": "Buncis", "unit": "kg", "category": "vegetables", "is_priority": True},
        {"source_name": "Kentang", "unit": "kg", "category": "vegetables", "is_priority": True},
        {"source_name": "Wortel", "unit": "kg", "category": "vegetables", "is_priority": True}
    ],
    "sample_raw_row": {
        "no": "",
        "name": "- Beras Premium",
        "unit": "kg",
        "harga_kemarin": "16.333",
        "harga_sekarang": "16.333",
        "perubahan_nominal": "0",
        "perubahan_persen": "0,00%"
    },
    "robots_txt_findings": {
        "url": "https://siskaperbapo.jatimprov.go.id/robots.txt",
        "status": 404,
        "policy": "404 Not Found; pipeline will enforce strict 1 request per 2 seconds with jitter."
    }
}

with open("f:/AgriX/system/pipeline/source_profile_siskaperbapo.json", "w", encoding="utf-8") as f:
    json.dump(siskaperbapo_profile, f, indent=2, ensure_ascii=False)

print("Successfully generated source_profile_pihps.json and source_profile_siskaperbapo.json!")
