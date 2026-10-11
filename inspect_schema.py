import sqlite3
conn = sqlite3.connect('pipeline/data/agrix_prices.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print('Tables:', [r[0] for r in cur.fetchall()])
cur.execute("SELECT * FROM commodity LIMIT 3")
rows = cur.fetchall()
for r in rows:
    print(dict(r))
cur.execute("SELECT * FROM price_observation LIMIT 2")
for r in cur.fetchall():
    print(dict(r))
cur.execute("PRAGMA table_info(commodity_crosswalk)")
print('crosswalk cols:', [r[1] for r in cur.fetchall()])
conn.close()
