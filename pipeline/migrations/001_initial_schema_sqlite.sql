-- Unified Schema Migration for SQLite
-- Task: price-data-collect-normalize

CREATE TABLE IF NOT EXISTS raw_fetch (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id TEXT NOT NULL,
    fetch_url TEXT NOT NULL,
    request_params_json TEXT NOT NULL,
    http_status INTEGER NOT NULL,
    content_type TEXT,
    content_hash TEXT NOT NULL,
    payload_ref_or_blob TEXT NOT NULL,
    fetched_at_utc TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_raw_fetch_source_hash ON raw_fetch(source_id, content_hash);
CREATE INDEX IF NOT EXISTS idx_raw_fetch_fetched_at ON raw_fetch(fetched_at_utc);

CREATE TABLE IF NOT EXISTS commodity (
    commodity_id TEXT PRIMARY KEY,
    canonical_name_id TEXT NOT NULL,
    category TEXT NOT NULL,
    is_priority INTEGER NOT NULL DEFAULT 0,
    canonical_unit TEXT NOT NULL DEFAULT 'kg'
);

CREATE TABLE IF NOT EXISTS commodity_crosswalk (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id TEXT NOT NULL,
    source_commodity_name TEXT NOT NULL,
    commodity_id TEXT NOT NULL,
    unit_conversion_factor REAL NOT NULL DEFAULT 1.0,
    notes TEXT,
    UNIQUE(source_id, source_commodity_name),
    FOREIGN KEY(commodity_id) REFERENCES commodity(commodity_id)
);

CREATE TABLE IF NOT EXISTS region (
    region_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    level TEXT NOT NULL, -- 'national', 'province', 'regency_city'
    parent_region_id TEXT,
    FOREIGN KEY(parent_region_id) REFERENCES region(region_id)
);

CREATE TABLE IF NOT EXISTS market (
    market_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region_id TEXT NOT NULL,
    FOREIGN KEY(region_id) REFERENCES region(region_id)
);

CREATE TABLE IF NOT EXISTS region_market_crosswalk (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id TEXT NOT NULL,
    source_name TEXT NOT NULL,
    region_id TEXT NOT NULL,
    market_id TEXT,
    UNIQUE(source_id, source_name),
    FOREIGN KEY(region_id) REFERENCES region(region_id),
    FOREIGN KEY(market_id) REFERENCES market(market_id)
);

CREATE TABLE IF NOT EXISTS price_observation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id TEXT NOT NULL,
    price_level TEXT NOT NULL,
    commodity_id TEXT NOT NULL,
    region_id TEXT NOT NULL,
    market_id_nullable TEXT,
    observed_date TEXT NOT NULL,
    source_timestamp_nullable TEXT,
    price_idr INTEGER,
    unit TEXT NOT NULL,
    quality_flags_json TEXT,
    raw_fetch_id INTEGER NOT NULL,
    ingested_at_utc TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    UNIQUE(source_id, price_level, commodity_id, region_id, market_id_nullable, observed_date, source_timestamp_nullable, version),
    FOREIGN KEY(commodity_id) REFERENCES commodity(commodity_id),
    FOREIGN KEY(region_id) REFERENCES region(region_id),
    FOREIGN KEY(market_id_nullable) REFERENCES market(market_id),
    FOREIGN KEY(raw_fetch_id) REFERENCES raw_fetch(id)
);

CREATE INDEX IF NOT EXISTS idx_price_obs_comm_date ON price_observation(commodity_id, observed_date);
CREATE INDEX IF NOT EXISTS idx_price_obs_source_date ON price_observation(source_id, observed_date);

CREATE TABLE IF NOT EXISTS quarantine (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raw_fetch_id INTEGER,
    reason TEXT NOT NULL,
    raw_row_json TEXT NOT NULL,
    created_at_utc TEXT NOT NULL,
    FOREIGN KEY(raw_fetch_id) REFERENCES raw_fetch(id)
);

CREATE TABLE IF NOT EXISTS run_log (
    run_id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    status TEXT NOT NULL,
    counts_json TEXT,
    errors_json TEXT
);
