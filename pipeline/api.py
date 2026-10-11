"""
AgriX Data API — FastAPI backend
Serves price observation data from SQLite to the React frontend.
Schema: commodity(commodity_id, canonical_name_id, category, is_priority, canonical_unit)
"""
import sys
import json
from datetime import datetime, timedelta
from typing import Optional, List
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from pipeline.db import get_connection

app = FastAPI(
    title="AgriX Price Data API",
    description="Real-time food commodity price data for East Java (Jawa Timur)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def db_rows_to_list(cursor) -> List[dict]:
    cols = [d[0] for d in cursor.description]
    return [dict(zip(cols, row)) for row in cursor.fetchall()]


def parse_quality_flags(flags_json: Optional[str]) -> List[str]:
    if not flags_json:
        return []
    try:
        return json.loads(flags_json)
    except Exception:
        return []


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.get("/health")
def health_check():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM price_observation")
    count = cur.fetchone()[0]
    cur.execute("SELECT MAX(observed_date) FROM price_observation")
    latest_date = cur.fetchone()[0]
    conn.close()
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "db": {"total_observations": count, "latest_date": latest_date}
    }


@app.get("/api/commodities")
def get_commodities():
    """List all tracked commodities with metadata."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT c.commodity_id as id, c.canonical_name_id as name_id, 
               c.category, c.is_priority, c.canonical_unit as primary_unit,
               MAX(p.observed_date) as last_observed,
               MAX(CASE WHEN p.source_id='pihps' THEN p.price_idr END) as latest_wholesale_price,
               MAX(CASE WHEN p.source_id='siskaperbapo' THEN p.price_idr END) as latest_consumer_price
        FROM commodity c
        LEFT JOIN price_observation p ON p.commodity_id = c.commodity_id
        GROUP BY c.commodity_id
        ORDER BY c.category, c.canonical_name_id
    """)
    rows = db_rows_to_list(cur)
    conn.close()
    return {"commodities": rows, "count": len(rows)}


@app.get("/api/prices/latest")
def get_latest_prices(
    commodity_id: Optional[str] = Query(None),
    region_id: Optional[str] = Query(None),
    source_id: Optional[str] = Query(None),
    limit: int = Query(200, ge=1, le=500)
):
    """Get the most recent price observations, one per commodity per source."""
    conn = get_connection()
    cur = conn.cursor()

    conditions = ["1=1"]
    params = []

    if commodity_id:
        conditions.append("p.commodity_id = ?")
        params.append(commodity_id)
    if region_id:
        conditions.append("p.region_id = ?")
        params.append(region_id)
    if source_id:
        conditions.append("p.source_id = ?")
        params.append(source_id)

    where_clause = " AND ".join(conditions)

    sql = f"""
        SELECT p.id, p.source_id, p.price_level, p.commodity_id,
               c.canonical_name_id as name_id, c.category,
               p.region_id, p.market_id_nullable, p.observed_date, 
               p.price_idr, p.unit, p.quality_flags_json, p.ingested_at_utc
        FROM price_observation p
        JOIN commodity c ON c.commodity_id = p.commodity_id
        WHERE {where_clause}
        ORDER BY p.observed_date DESC, p.id DESC
    """

    cur.execute(sql, params)
    all_rows = db_rows_to_list(cur)
    conn.close()

    # Deduplicate: keep latest per commodity+source
    seen = set()
    rows = []
    for r in all_rows:
        key = (r["commodity_id"], r["source_id"])
        if key not in seen:
            seen.add(key)
            r["quality_flags"] = parse_quality_flags(r.pop("quality_flags_json", None))
            rows.append(r)
        if len(rows) >= limit:
            break

    return {"prices": rows, "count": len(rows)}


@app.get("/api/prices/history")
def get_price_history(
    commodity_id: str = Query(...),
    source_id: Optional[str] = Query(None),
    region_id: Optional[str] = Query("ID_35"),
    days: int = Query(30, ge=1, le=365)
):
    """Time-series price history for a commodity."""
    conn = get_connection()
    cur = conn.cursor()

    start_date = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")

    conditions = ["p.commodity_id = ?", "p.observed_date >= ?"]
    params = [commodity_id, start_date]

    if source_id:
        conditions.append("p.source_id = ?")
        params.append(source_id)
    if region_id:
        conditions.append("p.region_id = ?")
        params.append(region_id)

    sql = f"""
        SELECT p.observed_date, p.source_id, p.price_level, p.price_idr, p.unit,
               p.region_id, p.market_id_nullable, p.quality_flags_json,
               c.canonical_name_id as name_id, c.category
        FROM price_observation p
        JOIN commodity c ON c.commodity_id = p.commodity_id
        WHERE {" AND ".join(conditions)}
        ORDER BY p.observed_date ASC, p.source_id
    """

    cur.execute(sql, params)
    rows = db_rows_to_list(cur)
    conn.close()

    for r in rows:
        r["quality_flags"] = parse_quality_flags(r.pop("quality_flags_json", None))

    pihps_series = [{"date": r["observed_date"], "price": r["price_idr"]} for r in rows if r["source_id"] == "pihps"]
    siskap_series = [{"date": r["observed_date"], "price": r["price_idr"]} for r in rows if r["source_id"] == "siskaperbapo"]

    return {
        "commodity_id": commodity_id,
        "days": days,
        "observations": rows,
        "series": {
            "pihps": pihps_series,
            "siskaperbapo": siskap_series
        }
    }


@app.get("/api/prices/summary")
def get_price_summary(
    region_id: Optional[str] = Query("ID_35"),
    date: Optional[str] = Query(None)
):
    conn = get_connection()
    cur = conn.cursor()

    if not date:
        cur.execute("SELECT MAX(observed_date) FROM price_observation")
        row = cur.fetchone()
        date = row[0] if row and row[0] else datetime.utcnow().strftime("%Y-%m-%d")

    cur.execute("SELECT MAX(observed_date) FROM price_observation WHERE observed_date < ?", (date,))
    prow = cur.fetchone()
    prev_date = prow[0] if prow and prow[0] else (datetime.strptime(date, "%Y-%m-%d") - timedelta(days=1)).strftime("%Y-%m-%d")

    cur.execute("""
        SELECT c.category,
               COUNT(DISTINCT p.commodity_id) as commodity_count,
               AVG(p.price_idr) as avg_price_idr,
               COUNT(p.id) as obs_count
        FROM price_observation p
        JOIN commodity c ON c.commodity_id = p.commodity_id
        WHERE p.observed_date = ? AND p.region_id = ?
        GROUP BY c.category
        ORDER BY c.category
    """, (date, region_id))
    by_category = db_rows_to_list(cur)

    cur.execute("""
        SELECT COUNT(DISTINCT commodity_id) as tracked_today,
               COUNT(*) as total_observations,
               AVG(price_idr) as overall_avg_price
        FROM price_observation
        WHERE observed_date = ? AND region_id = ?
    """, (date, region_id))
    row = cur.fetchone()
    overall = dict(zip([d[0] for d in cur.description], row)) if row else {}

    cur.execute("""
        SELECT today.commodity_id,
               today.price_idr as today_price,
               prev.price_idr as prev_price,
               ROUND((CAST(today.price_idr AS REAL) - prev.price_idr) / prev.price_idr * 100, 2) as pct_change
        FROM price_observation today
        LEFT JOIN price_observation prev
            ON prev.commodity_id = today.commodity_id
           AND prev.observed_date = ?
           AND prev.source_id = today.source_id
           AND prev.region_id = today.region_id
        WHERE today.observed_date = ?
          AND today.region_id = ?
          AND today.price_idr IS NOT NULL
          AND prev.price_idr IS NOT NULL
    """, (prev_date, date, region_id))
    changes = db_rows_to_list(cur)

    conn.close()

    rising = [c for c in changes if c["pct_change"] and c["pct_change"] > 0]
    falling = [c for c in changes if c["pct_change"] and c["pct_change"] < 0]

    return {
        "date": date,
        "region_id": region_id,
        "overall": overall,
        "by_category": by_category,
        "price_movement": {
            "rising_count": len(rising),
            "falling_count": len(falling),
            "stable_count": len(changes) - len(rising) - len(falling),
            "top_risers": sorted(rising, key=lambda x: x["pct_change"], reverse=True)[:5],
            "top_fallers": sorted(falling, key=lambda x: x["pct_change"])[:5],
            "all_changes": {c["commodity_id"]: c for c in changes}
        }
    }


@app.get("/api/pipeline/status")
def get_pipeline_status(limit: int = Query(20, ge=1, le=100)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT run_id, source_id, started_at, finished_at, status, counts_json, errors_json
        FROM run_log
        ORDER BY started_at DESC
        LIMIT ?
    """, (limit,))
    rows = db_rows_to_list(cur)
    conn.close()

    for r in rows:
        r["counts"] = json.loads(r.pop("counts_json", "{}") or "{}")
        r["errors"] = json.loads(r.pop("errors_json", "[]") or "[]")

    return {"runs": rows, "count": len(rows)}


@app.get("/api/pipeline/backfill")
def trigger_backfill(
    source_id: str = Query(...),
    start_date: str = Query(...),
    end_date: str = Query(...),
    secret: str = Query(...)
):
    import os
    expected_secret = os.getenv("AGRIX_ADMIN_SECRET", "agrix-admin-2026")
    if secret != expected_secret:
        raise HTTPException(status_code=403, detail="Forbidden")

    from pipeline.runner import run_backfill
    import threading

    def _bg():
        run_backfill(source_id, start_date, end_date)

    threading.Thread(target=_bg, daemon=True).start()
    return {"message": f"Backfill triggered for {source_id} from {start_date} to {end_date}", "status": "started"}


@app.get("/api/prices/ticker")
def get_ticker_prices():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT MAX(observed_date) FROM price_observation")
    latest_date = cur.fetchone()[0]

    if not latest_date:
        conn.close()
        return {"ticker": [], "count": 0}

    cur.execute("""
        SELECT p.commodity_id, c.canonical_name_id as name_id, c.category,
               p.source_id, p.price_idr, p.unit, p.observed_date, p.price_level
        FROM price_observation p
        JOIN commodity c ON c.commodity_id = p.commodity_id
        WHERE p.observed_date = ?
        ORDER BY c.category, c.canonical_name_id
    """, (latest_date,))
    rows = db_rows_to_list(cur)

    prev_date = (datetime.strptime(latest_date, "%Y-%m-%d") - timedelta(days=1)).strftime("%Y-%m-%d")
    cur.execute("""
        SELECT commodity_id, source_id, price_idr
        FROM price_observation
        WHERE observed_date = ?
    """, (prev_date,))
    prev_prices = {(r[0], r[1]): r[2] for r in cur.fetchall()}
    conn.close()

    result = []
    seen = set()
    for r in rows:
        key = (r["commodity_id"], r["source_id"])
        if key in seen:
            continue
        seen.add(key)
        prev = prev_prices.get(key)
        change_pct = None
        if prev and r["price_idr"] and prev > 0:
            change_pct = round((r["price_idr"] - prev) / prev * 100, 2)
        r["change_pct"] = change_pct
        result.append(r)

    return {"ticker": result, "count": len(result)}
