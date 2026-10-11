"""
AgriX Backfill Script
Mengisi data historis dari dua sumber (PIHPS dan SISKAPERBAPO) untuk rentang tanggal tertentu.

Usage:
    python backfill.py --days 30
    python backfill.py --start 2026-09-01 --end 2026-10-09
    python backfill.py --source pihps --days 14
"""
import sys
import argparse
from datetime import datetime, timedelta

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from pipeline.db import init_db
from pipeline.seed_data import seed_database
from pipeline.runner import run_backfill

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AgriX Historical Data Backfill")
    parser.add_argument("--source", type=str, default="all",
                        choices=["all", "pihps", "siskaperbapo"],
                        help="Data source to backfill (default: all)")
    parser.add_argument("--days", type=int, default=30,
                        help="Number of days back from today to backfill (default: 30)")
    parser.add_argument("--start", type=str,
                        help="Start date YYYY-MM-DD (overrides --days)")
    parser.add_argument("--end", type=str,
                        help="End date YYYY-MM-DD (default: today)")
    args = parser.parse_args()

    # Resolve dates
    end_dt = datetime.strptime(args.end, "%Y-%m-%d") if args.end else datetime.now()
    if args.start:
        start_dt = datetime.strptime(args.start, "%Y-%m-%d")
    else:
        start_dt = end_dt - timedelta(days=args.days - 1)

    start_str = start_dt.strftime("%Y-%m-%d")
    end_str = end_dt.strftime("%Y-%m-%d")

    print("=" * 60)
    print(f"AgriX Backfill")
    print(f"  Source  : {args.source}")
    print(f"  Range   : {start_str} -> {end_str}")
    print(f"  Days    : {(end_dt - start_dt).days + 1}")
    print("=" * 60)

    # Ensure DB ready
    init_db()
    seed_database()

    sources = ["pihps", "siskaperbapo"] if args.source == "all" else [args.source]

    for source in sources:
        print(f"\n>>> Backfilling source: {source.upper()}")
        run_backfill(source, start_str, end_str)

    print("\n[DONE] Backfill complete.")
