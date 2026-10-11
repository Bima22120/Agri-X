import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
RAW_STORAGE_DIR = DATA_DIR / "raw"
REPORTS_DIR = DATA_DIR / "reports"
LOGS_DIR = DATA_DIR / "logs"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
RAW_STORAGE_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Database
SQLITE_DB_PATH = os.getenv("AGRIX_DB_PATH", str(DATA_DIR / "agrix_prices.db"))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{SQLITE_DB_PATH}")

# Rate Limiting & Network
REQUEST_TIMEOUT_SECONDS = 25
MIN_REQUEST_INTERVAL_SECONDS = 2.0
JITTER_MAX_SECONDS = 1.0
MAX_RETRIES = 3
BACKOFF_FACTOR = 2.0

USER_AGENT = os.getenv(
    "AGRIX_USER_AGENT",
    "AgriX-DataCollector/1.0 (+https://github.com/agrix-jatim; data-engineering@agrix.local)"
)

# Sources Config
PIHPS_BASE_URL = "https://www.bi.go.id"
PIHPS_GRID_ENDPOINT = f"{PIHPS_BASE_URL}/hargapangan/WebSite/TabelHarga/GetGridDataDaerah"

SISKAPERBAPO_BASE_URL = "https://siskaperbapo.jatimprov.go.id"
SISKAPERBAPO_TABLE_ENDPOINT = f"{SISKAPERBAPO_BASE_URL}/harga/tabel.nodesign"
SISKAPERBAPO_MARKET_ENDPOINT = f"{SISKAPERBAPO_BASE_URL}/harga/pasar.json"

# Target Price Levels
PIHPS_PRIMARY_PRICE_LEVEL = "wholesale" # Pedagang Besar (price_type_id=3)
SISKAPERBAPO_PRICE_LEVEL = "traditional_retail" # Pasar Tradisional / Konsumen

# Validation Thresholds
# Plausibility range in IDR per kg
PLAUSIBILITY_THRESHOLDS_IDR = {
    "default": {"min": 1000, "max": 250000},
    "rice": {"min": 7000, "max": 40000},
    "vegetables": {"min": 1000, "max": 180000},
    "chili": {"min": 10000, "max": 180000},
    "shallot_garlic": {"min": 8000, "max": 90000}
}

# Max allowed Day-over-Day percentage change before flagging as suspect
DAY_OVER_DAY_MAX_PCT_CHANGE = 35.0

# Cross-source check relative difference threshold percentage
CROSS_SOURCE_DIFF_FLAG_PCT = 50.0
