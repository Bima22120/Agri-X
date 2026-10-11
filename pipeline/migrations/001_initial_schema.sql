-- Unified Schema Migration for PostgreSQL
-- Task: price-data-collect-normalize

CREATE TABLE IF NOT EXISTS raw_fetch (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(50) NOT NULL,
    fetch_url TEXT NOT NULL,
    request_params_json TEXT NOT NULL,
    http_status INTEGER NOT NULL,
    content_type VARCHAR(100),
    content_hash VARCHAR(64) NOT NULL,
    payload_ref_or_blob TEXT NOT NULL,
    fetched_at_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_raw_fetch_source_hash ON raw_fetch(source_id, content_hash);
CREATE INDEX IF NOT EXISTS idx_raw_fetch_fetched_at ON raw_fetch(fetched_at_utc);

CREATE TABLE IF NOT EXISTS commodity (
    commodity_id VARCHAR(100) PRIMARY KEY,
    canonical_name_id VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_priority BOOLEAN NOT NULL DEFAULT FALSE,
    canonical_unit VARCHAR(50) NOT NULL DEFAULT 'kg'
);

CREATE TABLE IF NOT EXISTS commodity_crosswalk (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(50) NOT NULL,
    source_commodity_name VARCHAR(255) NOT NULL,
    commodity_id VARCHAR(100) NOT NULL REFERENCES commodity(commodity_id),
    unit_conversion_factor NUMERIC(12, 4) NOT NULL DEFAULT 1.0000,
    notes TEXT,
    CONSTRAINT uq_commodity_crosswalk UNIQUE(source_id, source_commodity_name)
);

CREATE TABLE IF NOT EXISTS region (
    region_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL CHECK (level IN ('national', 'province', 'regency_city')),
    parent_region_id VARCHAR(100) REFERENCES region(region_id)
);

CREATE TABLE IF NOT EXISTS market (
    market_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region_id VARCHAR(100) NOT NULL REFERENCES region(region_id)
);

CREATE TABLE IF NOT EXISTS region_market_crosswalk (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(50) NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    region_id VARCHAR(100) NOT NULL REFERENCES region(region_id),
    market_id VARCHAR(100) REFERENCES market(market_id),
    CONSTRAINT uq_region_market_crosswalk UNIQUE(source_id, source_name)
);

CREATE TABLE IF NOT EXISTS price_observation (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(50) NOT NULL,
    price_level VARCHAR(50) NOT NULL,
    commodity_id VARCHAR(100) NOT NULL REFERENCES commodity(commodity_id),
    region_id VARCHAR(100) NOT NULL REFERENCES region(region_id),
    market_id_nullable VARCHAR(100) REFERENCES market(market_id),
    observed_date DATE NOT NULL,
    source_timestamp_nullable VARCHAR(100),
    price_idr BIGINT,
    unit VARCHAR(50) NOT NULL,
    quality_flags_json TEXT,
    raw_fetch_id INTEGER NOT NULL REFERENCES raw_fetch(id),
    ingested_at_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT uq_price_observation_version UNIQUE(
        source_id, price_level, commodity_id, region_id, market_id_nullable, observed_date, source_timestamp_nullable, version
    )
);

CREATE INDEX IF NOT EXISTS idx_price_obs_comm_date ON price_observation(commodity_id, observed_date);
CREATE INDEX IF NOT EXISTS idx_price_obs_source_date ON price_observation(source_id, observed_date);

CREATE TABLE IF NOT EXISTS quarantine (
    id SERIAL PRIMARY KEY,
    raw_fetch_id INTEGER REFERENCES raw_fetch(id),
    reason TEXT NOT NULL,
    raw_row_json TEXT NOT NULL,
    created_at_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS run_log (
    run_id VARCHAR(100) PRIMARY KEY,
    source_id VARCHAR(50) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL,
    counts_json TEXT,
    errors_json TEXT
);
