import json
from datetime import datetime, timezone
from typing import Dict, Any, List
from pipeline.db import get_connection
from pipeline.config import (
    PLAUSIBILITY_THRESHOLDS_IDR,
    DAY_OVER_DAY_MAX_PCT_CHANGE,
    CROSS_SOURCE_DIFF_FLAG_PCT,
    REPORTS_DIR
)

class Validator:
    def __init__(self):
        pass

    def run_validation(self, run_id: str, source_id: str, observed_date: str) -> Dict[str, Any]:
        """
        Runs validation checks V1 - V7 and writes validation_report_<run_id>.json.
        Appends quality flags to price_observation rows where applicable.
        """
        conn = get_connection()
        cur = conn.cursor()

        report = {
            "run_id": run_id,
            "source_id": source_id,
            "observed_date": observed_date,
            "validated_at_utc": datetime.now(timezone.utc).isoformat(),
            "checks": {},
            "summary": {
                "total_rows": 0,
                "valid_rows": 0,
                "flagged_rows": 0,
                "null_price_rows": 0
            }
        }

        # Fetch observations for this run's date and source
        cur.execute("""
            SELECT id, commodity_id, region_id, market_id_nullable, price_idr, observed_date, quality_flags_json
            FROM price_observation
            WHERE source_id = ? AND observed_date = ?
        """, (source_id, observed_date))
        rows = cur.fetchall()
        report["summary"]["total_rows"] = len(rows)

        # V1: Row count check
        cur.execute("""
            SELECT COUNT(*) as prev_count FROM price_observation
            WHERE source_id = ? AND observed_date < ?
            GROUP BY observed_date ORDER BY observed_date DESC LIMIT 1
        """, (source_id, observed_date))
        prev_row = cur.fetchone()
        prev_count = prev_row["prev_count"] if prev_row else len(rows)
        drop_pct = ((prev_count - len(rows)) / prev_count * 100) if prev_count > 0 else 0
        report["checks"]["V1_row_count"] = {
            "current_count": len(rows),
            "prev_count": prev_count,
            "drop_percentage": round(drop_pct, 2),
            "status": "ALERT" if drop_pct > 40 else "OK"
        }

        # V5: Future date check
        today_iso = datetime.now().strftime("%Y-%m-%d")
        future_dates = [r["id"] for r in rows if r["observed_date"] > today_iso]
        report["checks"]["V5_future_dates"] = {
            "future_dates_count": len(future_dates),
            "status": "FAIL" if len(future_dates) > 0 else "PASS"
        }

        # V3 & V4 Checks per row
        null_count = 0
        flagged_count = 0

        for r in rows:
            obs_id = r["id"]
            comm_id = r["commodity_id"]
            price = r["price_idr"]
            flags = []

            if price is None:
                null_count += 1
                flags.append("NULL_PRICE")
            else:
                # V3: Plausibility range check
                thresh = PLAUSIBILITY_THRESHOLDS_IDR.get(comm_id) or PLAUSIBILITY_THRESHOLDS_IDR.get("default")
                if price < thresh["min"] or price > thresh["max"]:
                    flags.append(f"IMPLAUSIBLE_PRICE: {price} not in [{thresh['min']}, {thresh['max']}]")

                # V4: Day-over-Day change check
                cur.execute("""
                    SELECT price_idr FROM price_observation
                    WHERE source_id = ? AND commodity_id = ? AND region_id = ? AND observed_date < ? AND price_idr IS NOT NULL
                    ORDER BY observed_date DESC LIMIT 1
                """, (source_id, comm_id, r["region_id"], observed_date))
                prev_obs = cur.fetchone()
                if prev_obs and prev_obs["price_idr"]:
                    prev_price = prev_obs["price_idr"]
                    pct_change = abs(price - prev_price) / prev_price * 100
                    if pct_change > DAY_OVER_DAY_MAX_PCT_CHANGE:
                        flags.append(f"LARGE_DOD_CHANGE: {round(pct_change, 1)}% vs prev {prev_price}")

            if flags:
                flagged_count += 1
                cur.execute("""
                    UPDATE price_observation SET quality_flags_json = ? WHERE id = ?
                """, (json.dumps(flags), obs_id))

        conn.commit()

        report["summary"]["null_price_rows"] = null_count
        report["summary"]["flagged_rows"] = flagged_count
        report["summary"]["valid_rows"] = len(rows) - flagged_count

        # V6: Cross-source check
        cur.execute("""
            SELECT p.commodity_id, p.price_idr as pihps_price, s.price_idr as sisk_price
            FROM price_observation p
            JOIN price_observation s 
              ON p.commodity_id = s.commodity_id 
             AND p.region_id = s.region_id 
             AND p.observed_date = s.observed_date
            WHERE p.source_id = 'pihps' 
              AND s.source_id = 'siskaperbapo' 
              AND p.observed_date = ?
              AND p.price_idr IS NOT NULL AND s.price_idr IS NOT NULL
        """, (observed_date,))
        cross_rows = cur.fetchall()
        cross_flags = []
        for cr in cross_rows:
            p_price = cr["pihps_price"]
            s_price = cr["sisk_price"]
            diff_pct = abs(s_price - p_price) / p_price * 100
            if diff_pct > CROSS_SOURCE_DIFF_FLAG_PCT:
                cross_flags.append({
                    "commodity_id": cr["commodity_id"],
                    "pihps_wholesale": p_price,
                    "siskaperbapo_retail": s_price,
                    "difference_pct": round(diff_pct, 1)
                })

        report["checks"]["V6_cross_source_check"] = {
            "matched_series_count": len(cross_rows),
            "large_divergence_count": len(cross_flags),
            "flagged_series": cross_flags
        }

        # V7: Null rate report
        cur.execute("""
            SELECT commodity_id, 
                   COUNT(*) as total, 
                   SUM(CASE WHEN price_idr IS NULL THEN 1 ELSE 0 END) as nulls
            FROM price_observation
            WHERE source_id = ? AND observed_date = ?
            GROUP BY commodity_id
        """, (source_id, observed_date))
        null_rates = {}
        for nr in cur.fetchall():
            null_rates[nr["commodity_id"]] = {
                "total": nr["total"],
                "nulls": nr["nulls"],
                "null_rate_pct": round((nr["nulls"] / nr["total"] * 100) if nr["total"] > 0 else 0, 1)
            }
        report["checks"]["V7_null_rate"] = null_rates

        conn.close()

        # Save report JSON
        report_path = REPORTS_DIR / f"validation_report_{source_id}_{run_id}.json"
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        return report
