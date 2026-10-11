import json
from pathlib import Path
from pipeline.db import get_connection

SEEDS_DIR = Path(__file__).resolve().parent / "seeds"
SEEDS_DIR.mkdir(parents=True, exist_ok=True)

COMMODITIES_DATA = [
    # Rice
    {"commodity_id": "rice_premium", "canonical_name_id": "Beras Premium", "category": "rice", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "rice_medium_1", "canonical_name_id": "Beras Medium I", "category": "rice", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "rice_medium_2", "canonical_name_id": "Beras Medium II", "category": "rice", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "rice_super_1", "canonical_name_id": "Beras Kualitas Super I", "category": "rice", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "rice_super_2", "canonical_name_id": "Beras Kualitas Super II", "category": "rice", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "rice_low_1", "canonical_name_id": "Beras Kualitas Bawah I", "category": "rice", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "rice_low_2", "canonical_name_id": "Beras Kualitas Bawah II", "category": "rice", "is_priority": 1, "canonical_unit": "kg"},

    # Vegetables (Chili, Shallots, Garlic, etc.)
    {"commodity_id": "shallot_medium", "canonical_name_id": "Bawang Merah", "category": "vegetables", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "garlic_honan", "canonical_name_id": "Bawang Putih", "category": "vegetables", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "chili_red_curly", "canonical_name_id": "Cabai Merah Keriting", "category": "vegetables", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "chili_red_large", "canonical_name_id": "Cabai Merah Besar", "category": "vegetables", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "chili_birdseye_red", "canonical_name_id": "Cabai Rawit Merah", "category": "vegetables", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "chili_birdseye_green", "canonical_name_id": "Cabai Rawit Hijau", "category": "vegetables", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "tomato_fresh", "canonical_name_id": "Tomat Segar", "category": "vegetables", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "potato_granola", "canonical_name_id": "Kentang", "category": "vegetables", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "carrot_fresh", "canonical_name_id": "Wortel", "category": "vegetables", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "green_beans", "canonical_name_id": "Buncis", "category": "vegetables", "is_priority": 1, "canonical_unit": "kg"},
    {"commodity_id": "cabbage", "canonical_name_id": "Kubis / Kol", "category": "vegetables", "is_priority": 1, "canonical_unit": "kg"},

    # Other non-priority staple items exposed by sources (collected & mapped, not dropped)
    {"commodity_id": "chicken_meat_broiler", "canonical_name_id": "Daging Ayam Ras", "category": "meat", "is_priority": 0, "canonical_unit": "kg"},
    {"commodity_id": "chicken_meat_kampung", "canonical_name_id": "Daging Ayam Kampung", "category": "meat", "is_priority": 0, "canonical_unit": "ekor"},
    {"commodity_id": "beef_quality_1", "canonical_name_id": "Daging Sapi Kualitas 1", "category": "meat", "is_priority": 0, "canonical_unit": "kg"},
    {"commodity_id": "beef_quality_2", "canonical_name_id": "Daging Sapi Kualitas 2", "category": "meat", "is_priority": 0, "canonical_unit": "kg"},
    {"commodity_id": "chicken_eggs_fresh", "canonical_name_id": "Telur Ayam Ras", "category": "eggs", "is_priority": 0, "canonical_unit": "kg"},
    {"commodity_id": "cooking_oil_bulk", "canonical_name_id": "Minyak Goreng Curah", "category": "cooking_oil", "is_priority": 0, "canonical_unit": "kg"},
    {"commodity_id": "cooking_oil_branded_1", "canonical_name_id": "Minyak Goreng Kemasan Bermerk 1", "category": "cooking_oil", "is_priority": 0, "canonical_unit": "kg"},
    {"commodity_id": "cooking_oil_branded_2", "canonical_name_id": "Minyak Goreng Kemasan Bermerk 2", "category": "cooking_oil", "is_priority": 0, "canonical_unit": "kg"},
    {"commodity_id": "sugar_premium", "canonical_name_id": "Gula Pasir Premium", "category": "sugar", "is_priority": 0, "canonical_unit": "kg"},
    {"commodity_id": "sugar_local", "canonical_name_id": "Gula Pasir Lokal", "category": "sugar", "is_priority": 0, "canonical_unit": "kg"}
]

COMMODITY_CROSSWALK_DATA = [
    # PIHPS Mappings
    {"source_id": "pihps", "source_commodity_name": "Beras Kualitas Bawah I", "commodity_id": "rice_low_1", "factor": 1.0, "notes": "PIHPS com_1"},
    {"source_id": "pihps", "source_commodity_name": "Beras Kualitas Bawah II", "commodity_id": "rice_low_2", "factor": 1.0, "notes": "PIHPS com_2"},
    {"source_id": "pihps", "source_commodity_name": "Beras Kualitas Medium I", "commodity_id": "rice_medium_1", "factor": 1.0, "notes": "PIHPS com_3"},
    {"source_id": "pihps", "source_commodity_name": "Beras Kualitas Medium II", "commodity_id": "rice_medium_2", "factor": 1.0, "notes": "PIHPS com_4"},
    {"source_id": "pihps", "source_commodity_name": "Beras Kualitas Super I", "commodity_id": "rice_super_1", "factor": 1.0, "notes": "PIHPS com_5"},
    {"source_id": "pihps", "source_commodity_name": "Beras Kualitas Super II", "commodity_id": "rice_super_2", "factor": 1.0, "notes": "PIHPS com_6"},
    {"source_id": "pihps", "source_commodity_name": "Bawang Merah Ukuran Sedang", "commodity_id": "shallot_medium", "factor": 1.0, "notes": "PIHPS com_11"},
    {"source_id": "pihps", "source_commodity_name": "Bawang Merah", "commodity_id": "shallot_medium", "factor": 1.0, "notes": "PIHPS cat_5"},
    {"source_id": "pihps", "source_commodity_name": "Bawang Putih Ukuran Sedang", "commodity_id": "garlic_honan", "factor": 1.0, "notes": "PIHPS com_12"},
    {"source_id": "pihps", "source_commodity_name": "Bawang Putih", "commodity_id": "garlic_honan", "factor": 1.0, "notes": "PIHPS cat_6"},
    {"source_id": "pihps", "source_commodity_name": "Cabai Merah Besar", "commodity_id": "chili_red_large", "factor": 1.0, "notes": "PIHPS com_13"},
    {"source_id": "pihps", "source_commodity_name": "Cabai Merah Keriting", "commodity_id": "chili_red_curly", "factor": 1.0, "notes": "PIHPS com_14"},
    {"source_id": "pihps", "source_commodity_name": "Cabai Merah", "commodity_id": "chili_red_curly", "factor": 1.0, "notes": "PIHPS cat_7"},
    {"source_id": "pihps", "source_commodity_name": "Cabai Rawit Hijau", "commodity_id": "chili_birdseye_green", "factor": 1.0, "notes": "PIHPS com_15"},
    {"source_id": "pihps", "source_commodity_name": "Cabai Rawit Merah", "commodity_id": "chili_birdseye_red", "factor": 1.0, "notes": "PIHPS com_16"},
    {"source_id": "pihps", "source_commodity_name": "Cabai Rawit", "commodity_id": "chili_birdseye_red", "factor": 1.0, "notes": "PIHPS cat_8"},
    {"source_id": "pihps", "source_commodity_name": "Daging Ayam Ras Segar", "commodity_id": "chicken_meat_broiler", "factor": 1.0, "notes": "PIHPS com_7"},
    {"source_id": "pihps", "source_commodity_name": "Daging Sapi Kualitas 1", "commodity_id": "beef_quality_1", "factor": 1.0, "notes": "PIHPS com_8"},
    {"source_id": "pihps", "source_commodity_name": "Daging Sapi Kualitas 2", "commodity_id": "beef_quality_2", "factor": 1.0, "notes": "PIHPS com_9"},
    {"source_id": "pihps", "source_commodity_name": "Telur Ayam Ras Segar", "commodity_id": "chicken_eggs_fresh", "factor": 1.0, "notes": "PIHPS com_10"},
    {"source_id": "pihps", "source_commodity_name": "Minyak Goreng Curah", "commodity_id": "cooking_oil_bulk", "factor": 1.0, "notes": "PIHPS com_17"},
    {"source_id": "pihps", "source_commodity_name": "Minyak Goreng Kemasan Bermerk 1", "commodity_id": "cooking_oil_branded_1", "factor": 1.0, "notes": "PIHPS com_18"},
    {"source_id": "pihps", "source_commodity_name": "Minyak Goreng Kemasan Bermerk 2", "commodity_id": "cooking_oil_branded_2", "factor": 1.0, "notes": "PIHPS com_19"},
    {"source_id": "pihps", "source_commodity_name": "Gula Pasir Kualitas Premium", "commodity_id": "sugar_premium", "factor": 1.0, "notes": "PIHPS com_20"},
    {"source_id": "pihps", "source_commodity_name": "Gula Pasir Lokal", "commodity_id": "sugar_local", "factor": 1.0, "notes": "PIHPS com_21"},

    # SISKAPERBAPO Mappings
    {"source_id": "siskaperbapo", "source_commodity_name": "Beras Premium", "commodity_id": "rice_premium", "factor": 1.0, "notes": "SISKAPERBAPO ID 2"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Beras Premium", "commodity_id": "rice_premium", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Beras Medium", "commodity_id": "rice_medium_1", "factor": 1.0, "notes": "SISKAPERBAPO ID 4"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Beras Medium", "commodity_id": "rice_medium_1", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Bawang Merah", "commodity_id": "shallot_medium", "factor": 1.0, "notes": "SISKAPERBAPO ID 39"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Bawang Merah", "commodity_id": "shallot_medium", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Bawang Putih", "commodity_id": "garlic_honan", "factor": 1.0, "notes": "SISKAPERBAPO ID 49"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Bawang Putih", "commodity_id": "garlic_honan", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Cabe Merah Keriting", "commodity_id": "chili_red_curly", "factor": 1.0, "notes": "SISKAPERBAPO ID 37"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Cabe Merah Keriting", "commodity_id": "chili_red_curly", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Cabe Merah Besar", "commodity_id": "chili_red_large", "factor": 1.0, "notes": "SISKAPERBAPO ID 38"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Cabe Merah Besar", "commodity_id": "chili_red_large", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Cabe Rawit Merah", "commodity_id": "chili_birdseye_red", "factor": 1.0, "notes": "SISKAPERBAPO ID 50"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Cabe Rawit Merah", "commodity_id": "chili_birdseye_red", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Tomat", "commodity_id": "tomato_fresh", "factor": 1.0, "notes": "SISKAPERBAPO"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Tomat", "commodity_id": "tomato_fresh", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Kentang", "commodity_id": "potato_granola", "factor": 1.0, "notes": "SISKAPERBAPO"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Kentang", "commodity_id": "potato_granola", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Wortel", "commodity_id": "carrot_fresh", "factor": 1.0, "notes": "SISKAPERBAPO"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Wortel", "commodity_id": "carrot_fresh", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Buncis", "commodity_id": "green_beans", "factor": 1.0, "notes": "SISKAPERBAPO ID 48"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Buncis", "commodity_id": "green_beans", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Kubis", "commodity_id": "cabbage", "factor": 1.0, "notes": "SISKAPERBAPO"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Kubis", "commodity_id": "cabbage", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Daging Ayam Ras", "commodity_id": "chicken_meat_broiler", "factor": 1.0, "notes": "SISKAPERBAPO ID 13"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Daging Ayam Ras", "commodity_id": "chicken_meat_broiler", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Daging Ayam Kampung", "commodity_id": "chicken_meat_kampung", "factor": 1.0, "notes": "SISKAPERBAPO ID 14"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Daging Ayam Kampung", "commodity_id": "chicken_meat_kampung", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Daging Sapi Paha Belakang", "commodity_id": "beef_quality_1", "factor": 1.0, "notes": "SISKAPERBAPO ID 12"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Daging Sapi Paha Belakang", "commodity_id": "beef_quality_1", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Telur Ayam Ras", "commodity_id": "chicken_eggs_fresh", "factor": 1.0, "notes": "SISKAPERBAPO"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Telur Ayam Ras", "commodity_id": "chicken_eggs_fresh", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"},
    {"source_id": "siskaperbapo", "source_commodity_name": "Gula Kristal Putih", "commodity_id": "sugar_local", "factor": 1.0, "notes": "SISKAPERBAPO"},
    {"source_id": "siskaperbapo", "source_commodity_name": "- Gula Kristal Putih", "commodity_id": "sugar_local", "factor": 1.0, "notes": "SISKAPERBAPO tabel item"}
]

REGIONS_DATA = [
    {"region_id": "ID_NAT", "name": "Nasional (Indonesia)", "level": "national", "parent_region_id": None},
    {"region_id": "ID_35", "name": "Jawa Timur", "level": "province", "parent_region_id": "ID_NAT"},
    # Major East Java Cities and Regencies
    {"region_id": "ID_3578", "name": "Kota Surabaya", "level": "regency_city", "parent_region_id": "ID_35"},
    {"region_id": "ID_3573", "name": "Kota Malang", "level": "regency_city", "parent_region_id": "ID_35"},
    {"region_id": "ID_3507", "name": "Kabupaten Malang", "level": "regency_city", "parent_region_id": "ID_35"},
    {"region_id": "ID_3571", "name": "Kota Kediri", "level": "regency_city", "parent_region_id": "ID_35"},
    {"region_id": "ID_3506", "name": "Kabupaten Kediri", "level": "regency_city", "parent_region_id": "ID_35"},
    {"region_id": "ID_3510", "name": "Kabupaten Banyuwangi", "level": "regency_city", "parent_region_id": "ID_35"},
    {"region_id": "ID_3509", "name": "Kabupaten Jember", "level": "regency_city", "parent_region_id": "ID_35"},
    {"region_id": "ID_3574", "name": "Kota Probolinggo", "level": "regency_city", "parent_region_id": "ID_35"},
    {"region_id": "ID_3513", "name": "Kabupaten Probolinggo", "level": "regency_city", "parent_region_id": "ID_35"},
    {"region_id": "ID_3577", "name": "Kota Madiun", "level": "regency_city", "parent_region_id": "ID_35"},
    {"region_id": "ID_3519", "name": "Kabupaten Madiun", "level": "regency_city", "parent_region_id": "ID_35"},
    {"region_id": "ID_3515", "name": "Kabupaten Sidoarjo", "level": "regency_city", "parent_region_id": "ID_35"},
    {"region_id": "ID_3525", "name": "Kabupaten Gresik", "level": "regency_city", "parent_region_id": "ID_35"}
]

REGION_MARKET_CROSSWALK_DATA = [
    # PIHPS Province Mappings
    {"source_id": "pihps", "source_name": "Jawa Timur", "region_id": "ID_35", "market_id": None},
    {"source_id": "pihps", "source_name": "Nasional", "region_id": "ID_NAT", "market_id": None},
    {"source_id": "pihps", "source_name": "Semua Provinsi", "region_id": "ID_NAT", "market_id": None},

    # SISKAPERBAPO Regency/City Mappings
    {"source_id": "siskaperbapo", "source_name": "Propinsi Jawa Timur", "region_id": "ID_35", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "", "region_id": "ID_35", "market_id": None}, # Empty kabkota is Jatim average
    {"source_id": "siskaperbapo", "source_name": "surabayakota", "region_id": "ID_3578", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "Kota Surabaya", "region_id": "ID_3578", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "malangkota", "region_id": "ID_3573", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "Kota Malang", "region_id": "ID_3573", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "malangkab", "region_id": "ID_3507", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "Kabupaten Malang", "region_id": "ID_3507", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "kedirikota", "region_id": "ID_3571", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "Kota Kediri", "region_id": "ID_3571", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "kedirikab", "region_id": "ID_3506", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "Kabupaten Kediri", "region_id": "ID_3506", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "banyuwangikab", "region_id": "ID_3510", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "Kabupaten Banyuwangi", "region_id": "ID_3510", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "jemberkab", "region_id": "ID_3509", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "Kabupaten Jember", "region_id": "ID_3509", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "probolinggokota", "region_id": "ID_3574", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "Kota Probolinggo", "region_id": "ID_3574", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "probolinggokab", "region_id": "ID_3513", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "Kabupaten Probolinggo", "region_id": "ID_3513", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "sidoarjokab", "region_id": "ID_3515", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "Kabupaten Sidoarjo", "region_id": "ID_3515", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "gresikkab", "region_id": "ID_3525", "market_id": None},
    {"source_id": "siskaperbapo", "source_name": "Kabupaten Gresik", "region_id": "ID_3525", "market_id": None}
]

MARKETS_DATA = [
    {"market_id": "MKT_SUR_1", "name": "Pasar Tambahrejo", "region_id": "ID_3578"},
    {"market_id": "MKT_SUR_2", "name": "Pasar Wonokromo", "region_id": "ID_3578"},
    {"market_id": "MKT_SUR_3", "name": "Pasar Genteng", "region_id": "ID_3578"},
    {"market_id": "MKT_SUR_4", "name": "Pasar Pucang Anom", "region_id": "ID_3578"},
    {"market_id": "MKT_SUR_5", "name": "Pasar Keputran", "region_id": "ID_3578"}
]

MARKET_CROSSWALK_DATA = [
    {"source_id": "siskaperbapo", "source_name": "Pasar Tambahrejo", "region_id": "ID_3578", "market_id": "MKT_SUR_1"},
    {"source_id": "siskaperbapo", "source_name": "Pasar Wonokromo", "region_id": "ID_3578", "market_id": "MKT_SUR_2"},
    {"source_id": "siskaperbapo", "source_name": "Pasar Genteng", "region_id": "ID_3578", "market_id": "MKT_SUR_3"},
    {"source_id": "siskaperbapo", "source_name": "Pasar Pucang Anom", "region_id": "ID_3578", "market_id": "MKT_SUR_4"},
    {"source_id": "siskaperbapo", "source_name": "Pasar Keputran", "region_id": "ID_3578", "market_id": "MKT_SUR_5"}
]

def seed_database():
    conn = get_connection()
    cur = conn.cursor()

    # 1. Seed Commodities
    for c in COMMODITIES_DATA:
        cur.execute("""
            INSERT OR REPLACE INTO commodity (commodity_id, canonical_name_id, category, is_priority, canonical_unit)
            VALUES (?, ?, ?, ?, ?)
        """, (c["commodity_id"], c["canonical_name_id"], c["category"], c["is_priority"], c["canonical_unit"]))

    # 2. Seed Commodity Crosswalk
    for cw in COMMODITY_CROSSWALK_DATA:
        cur.execute("""
            INSERT OR REPLACE INTO commodity_crosswalk (source_id, source_commodity_name, commodity_id, unit_conversion_factor, notes)
            VALUES (?, ?, ?, ?, ?)
        """, (cw["source_id"], cw["source_commodity_name"], cw["commodity_id"], cw["factor"], cw["notes"]))

    # 3. Seed Regions
    for r in REGIONS_DATA:
        cur.execute("""
            INSERT OR REPLACE INTO region (region_id, name, level, parent_region_id)
            VALUES (?, ?, ?, ?)
        """, (r["region_id"], r["name"], r["level"], r["parent_region_id"]))

    # 4. Seed Markets
    for m in MARKETS_DATA:
        cur.execute("""
            INSERT OR REPLACE INTO market (market_id, name, region_id)
            VALUES (?, ?, ?)
        """, (m["market_id"], m["name"], m["region_id"]))

    # 5. Seed Region Market Crosswalk
    for rmc in REGION_MARKET_CROSSWALK_DATA + MARKET_CROSSWALK_DATA:
        cur.execute("""
            INSERT OR REPLACE INTO region_market_crosswalk (source_id, source_name, region_id, market_id)
            VALUES (?, ?, ?, ?)
        """, (rmc["source_id"], rmc["source_name"], rmc["region_id"], rmc.get("market_id")))

    conn.commit()
    conn.close()

    # Save JSON files for inspection and human review
    with open(SEEDS_DIR / "commodities.json", "w", encoding="utf-8") as f:
        json.dump(COMMODITIES_DATA, f, indent=2, ensure_ascii=False)
    with open(SEEDS_DIR / "commodity_crosswalk.json", "w", encoding="utf-8") as f:
        json.dump(COMMODITY_CROSSWALK_DATA, f, indent=2, ensure_ascii=False)
    with open(SEEDS_DIR / "regions.json", "w", encoding="utf-8") as f:
        json.dump(REGIONS_DATA, f, indent=2, ensure_ascii=False)
    with open(SEEDS_DIR / "markets.json", "w", encoding="utf-8") as f:
        json.dump(MARKETS_DATA, f, indent=2, ensure_ascii=False)

    print("Seed data successfully inserted into database and saved to pipeline/seeds/!")

if __name__ == "__main__":
    from pipeline.db import init_db
    init_db()
    seed_database()
