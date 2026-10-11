import sqlite3
import json
from datetime import datetime, timezone
from pathlib import Path
from pipeline.config import SQLITE_DB_PATH

MIGRATION_FILE = Path(__file__).resolve().parent / "migrations" / "001_initial_schema_sqlite.sql"

def get_connection():
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_connection()
    with open(MIGRATION_FILE, "r", encoding="utf-8") as f:
        sql = f.read()
    conn.executescript(sql)
    conn.commit()
    conn.close()

def insert_raw_fetch(source_id: str, fetch_url: str, request_params: dict, http_status: int, 
                     content_type: str, content_hash: str, payload_ref_or_blob: str) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    fetched_at = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        INSERT INTO raw_fetch (source_id, fetch_url, request_params_json, http_status, content_type, content_hash, payload_ref_or_blob, fetched_at_utc)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        source_id,
        fetch_url,
        json.dumps(request_params, sort_keys=True),
        http_status,
        content_type,
        content_hash,
        payload_ref_or_blob,
        fetched_at
    ))
    raw_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return raw_id

def find_raw_fetch_by_hash(source_id: str, content_hash: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM raw_fetch WHERE source_id = ? AND content_hash = ? ORDER BY id DESC LIMIT 1
    """, (source_id, content_hash))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def insert_run_log(run_id: str, source_id: str, started_at: str, finished_at: str, status: str, counts: dict, errors: list):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO run_log (run_id, source_id, started_at, finished_at, status, counts_json, errors_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        run_id,
        source_id,
        started_at,
        finished_at,
        status,
        json.dumps(counts),
        json.dumps(errors)
    ))
    conn.commit()
    conn.close()

def insert_quarantine(raw_fetch_id: int, reason: str, raw_row: dict):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO quarantine (raw_fetch_id, reason, raw_row_json, created_at_utc)
        VALUES (?, ?, ?, ?)
    """, (
        raw_fetch_id,
        reason,
        json.dumps(raw_row, ensure_ascii=False),
        datetime.now(timezone.utc).isoformat()
    ))
    conn.commit()
    conn.close()

def insert_price_observation(source_id: str, price_level: str, commodity_id: str, region_id: str, 
                             market_id: str, observed_date: str, source_timestamp: str, price_idr: int, 
                             unit: str, quality_flags: list, raw_fetch_id: int, version: int = 1) -> bool:
    """
    Strictly idempotent insert into price_observation.
    Returns True if inserted, False if already exists (duplicate key).
    """
    conn = get_connection()
    cursor = conn.cursor()
    ingested_at = datetime.now(timezone.utc).isoformat()
    
    # Check if exact observation key already exists (treating NULL market_id and timestamp consistently)
    cursor.execute("""
        SELECT id FROM price_observation
        WHERE source_id = ? 
          AND price_level = ? 
          AND commodity_id = ? 
          AND region_id = ? 
          AND IFNULL(market_id_nullable, '') = IFNULL(?, '')
          AND observed_date = ? 
          AND version = ?
        LIMIT 1
    """, (
        source_id,
        price_level,
        commodity_id,
        region_id,
        market_id,
        observed_date,
        version
    ))
    if cursor.fetchone():
        conn.close()
        return False

    try:
        cursor.execute("""
            INSERT INTO price_observation (
                source_id, price_level, commodity_id, region_id, market_id_nullable, 
                observed_date, source_timestamp_nullable, price_idr, unit, 
                quality_flags_json, raw_fetch_id, ingested_at_utc, version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            source_id,
            price_level,
            commodity_id,
            region_id,
            market_id,
            observed_date,
            source_timestamp,
            price_idr,
            unit,
            json.dumps(quality_flags) if quality_flags else None,
            raw_fetch_id,
            ingested_at,
            version
        ))
        conn.commit()
        inserted = True
    except sqlite3.IntegrityError:
        inserted = False
    finally:
        conn.close()
    return inserted
