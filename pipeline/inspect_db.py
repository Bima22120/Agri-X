from pipeline.db import get_connection

conn = get_connection()
cur = conn.cursor()

print("=== DATABASE SUMMARY ===")
for table in ['raw_fetch', 'commodity', 'commodity_crosswalk', 'region', 'price_observation', 'quarantine', 'run_log']:
    cur.execute(f"SELECT COUNT(*) as c FROM {table}")
    print(f"Table '{table}': {cur.fetchone()['c']} rows")

print("\n=== SAMPLE PRICE OBSERVATIONS (SEPARATE SERIES, NEVER MERGED) ===")
cur.execute("""
    SELECT source_id, price_level, commodity_id, region_id, observed_date, price_idr, unit 
    FROM price_observation 
    ORDER BY observed_date DESC, commodity_id ASC
    LIMIT 12
""")
for r in cur.fetchall():
    print(" ", dict(r))

print("\n=== SAMPLE QUARANTINED ROWS (AUDIT LOG FOR UNMAPPED/IRRELEVANT ITEMS) ===")
cur.execute("SELECT id, reason, raw_row_json FROM quarantine LIMIT 5")
for r in cur.fetchall():
    print(" ", dict(r))

print("\n=== RUN LOG ENTRIES ===")
cur.execute("SELECT run_id, source_id, status, counts_json FROM run_log")
for r in cur.fetchall():
    print(" ", dict(r))

conn.close()
