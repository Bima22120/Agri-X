import sys
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from pipeline.db import init_db, insert_run_log
from pipeline.seed_data import seed_database
from pipeline.collectors.pihps_collector import PihpsCollector
from pipeline.collectors.siskaperbapo_collector import SiskaperbapoCollector
from pipeline.normalizer import Normalizer
from pipeline.validator import Validator

def run_pipeline(source_id: str, date_str: Optional[str] = None) -> Dict[str, Any]:
    """
    Executes collection -> normalization -> validation for a specific source and date.
    Idempotent and resilient.
    """
    if not date_str:
        date_str = datetime.now().strftime("%Y-%m-%d")

    run_id = f"run_{source_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
    started_at = datetime.now(timezone.utc).isoformat()
    errors = []
    counts = {
        "fetched": 0,
        "normalized": 0,
        "quarantined": 0,
        "flagged": 0
    }

    insert_run_log(
        run_id=run_id,
        source_id=source_id,
        started_at=started_at,
        finished_at=None,
        status="RUNNING",
        counts=counts,
        errors=errors
    )

    print(f"\n=======================================================")
    print(f"[PIPELINE RUN] {run_id}")
    print(f"[CONFIG] Source: {source_id} | Date: {date_str}")
    print(f"=======================================================")

    normalizer = Normalizer()
    validator = Validator()

    try:
        if source_id == "pihps":
            collector = PihpsCollector()
            print(f"[*] Collecting PIHPS data from Bank Indonesia (Wholesale Level, Jatim)...")
            # Fetch for the date (start_date=date_str, end_date=date_str)
            fetch_res = collector.collect(
                start_date=date_str,
                end_date=date_str,
                province_id="16", # Jawa Timur
                price_type_id="3" # Pedagang Besar (Wholesale)
            )
            counts["fetched"] = 1
            print(f"    [OK] Raw payload stored. ID: {fetch_res.raw_fetch_id}, Hash: {fetch_res.content_hash[:12]}...")

            print(f"[*] Normalizing PIHPS raw payload into unified schema...")
            norm_cnt, quar_cnt = normalizer.normalize_pihps(
                raw_fetch_id=fetch_res.raw_fetch_id,
                payload_json_str=fetch_res.payload_text,
                request_params=fetch_res.request_params
            )
            counts["normalized"] += norm_cnt
            counts["quarantined"] += quar_cnt
            print(f"    [OK] Normalized: {norm_cnt} rows, Quarantined: {quar_cnt} rows.")

        elif source_id == "siskaperbapo":
            collector = SiskaperbapoCollector()
            print(f"[*] Collecting SISKAPERBAPO data (Provinsi Jawa Timur Average & Surabaya)...")

            # 1. Fetch Province Average (kabkota="")
            res_prov = collector.collect(tanggal=date_str, kabkota="", pasar="")
            counts["fetched"] += 1
            n1, q1 = normalizer.normalize_siskaperbapo(
                raw_fetch_id=res_prov.raw_fetch_id,
                html_str=res_prov.payload_text,
                request_params=res_prov.request_params
            )
            counts["normalized"] += n1
            counts["quarantined"] += q1

            # 2. Fetch Surabaya (kabkota="surabayakota")
            res_sub = collector.collect(tanggal=date_str, kabkota="surabayakota", pasar="")
            counts["fetched"] += 1
            n2, q2 = normalizer.normalize_siskaperbapo(
                raw_fetch_id=res_sub.raw_fetch_id,
                html_str=res_sub.payload_text,
                request_params=res_sub.request_params
            )
            counts["normalized"] += n2
            counts["quarantined"] += q2
            print(f"    [OK] Normalized total: {counts['normalized']} rows, Quarantined: {counts['quarantined']} rows.")

        else:
            raise ValueError(f"Unknown source_id: '{source_id}'")

        # Validation phase
        print(f"[*] Running data quality validation (V1 - V7)...")
        val_report = validator.run_validation(
            run_id=run_id,
            source_id=source_id,
            observed_date=date_str
        )
        counts["flagged"] = val_report["summary"]["flagged_rows"]
        print(f"    [OK] Validation report generated: {val_report['summary']['valid_rows']} valid, {counts['flagged']} flagged.")

        status = "SUCCESS"

    except Exception as e:
        status = "FAILED"
        errors.append(str(e))
        print(f"    [ERROR] Pipeline failed with error: {e}")

    finished_at = datetime.now(timezone.utc).isoformat()
    insert_run_log(
        run_id=run_id,
        source_id=source_id,
        started_at=started_at,
        finished_at=finished_at,
        status=status,
        counts=counts,
        errors=errors
    )

    print(f"[STATUS] Run Completed: {status}")
    print(f"=======================================================\n")

    return {
        "run_id": run_id,
        "status": status,
        "counts": counts,
        "errors": errors
    }

def run_backfill(source_id: str, start_date_str: str, end_date_str: str):
    """
    Backfills data over a date range with rate limiting and idempotency.
    """
    start_dt = datetime.strptime(start_date_str, "%Y-%m-%d")
    end_dt = datetime.strptime(end_date_str, "%Y-%m-%d")
    cur_dt = start_dt

    print(f"[*] Starting backfill for {source_id} from {start_date_str} to {end_date_str}...")

    total_runs = 0
    success_runs = 0

    while cur_dt <= end_dt:
        date_str = cur_dt.strftime("%Y-%m-%d")
        res = run_pipeline(source_id=source_id, date_str=date_str)
        total_runs += 1
        if res["status"] == "SUCCESS":
            success_runs += 1
        cur_dt += timedelta(days=1)

    print(f"\n[DONE] Backfill complete: {success_runs}/{total_runs} successful runs.")

if __name__ == "__main__":
    init_db()
    seed_database()

    # Default: run both sources for today or given date
    target_date = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime("%Y-%m-%d")

    print(f"Running automated data collection and normalization for date: {target_date}")
    run_pipeline("pihps", target_date)
    run_pipeline("siskaperbapo", target_date)
