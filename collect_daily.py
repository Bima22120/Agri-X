"""
AgriX Daily Collection Scheduler
Dijalankan otomatis setiap hari pukul 09:00 WIB melalui Windows Task Scheduler.
Mengumpulkan data harga pangan untuk hari ini dari semua sumber.
"""
import sys
import logging
from datetime import datetime
from pathlib import Path

# UTF-8 safety for Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Setup file logging (so Task Scheduler can capture output)
LOG_DIR = Path(__file__).resolve().parent / "pipeline" / "data" / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
log_file = LOG_DIR / f"daily_collect_{datetime.now().strftime('%Y%m%d')}.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(str(log_file), encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("agrix_scheduler")


def main():
    logger.info("=" * 60)
    logger.info("AgriX Daily Data Collection - Started")
    logger.info(f"Timestamp: {datetime.now().isoformat()}")
    logger.info("=" * 60)

    try:
        from pipeline.db import init_db
        from pipeline.seed_data import seed_database
        from pipeline.runner import run_pipeline

        logger.info("[1/4] Initializing database...")
        init_db()
        seed_database()
        logger.info("[1/4] Database ready.")

        today = datetime.now().strftime("%Y-%m-%d")

        logger.info(f"[2/4] Collecting PIHPS data for {today}...")
        result_pihps = run_pipeline("pihps", today)
        logger.info(f"[2/4] PIHPS: {result_pihps['status']} | counts={result_pihps['counts']}")

        logger.info(f"[3/4] Collecting SISKAPERBAPO data for {today}...")
        result_siskap = run_pipeline("siskaperbapo", today)
        logger.info(f"[3/4] SISKAPERBAPO: {result_siskap['status']} | counts={result_siskap['counts']}")

        logger.info("[4/4] All collections done.")

        # Summary
        errors = result_pihps.get("errors", []) + result_siskap.get("errors", [])
        if errors:
            logger.warning(f"Errors encountered: {errors}")
        else:
            logger.info("No errors. All data collected successfully.")

    except Exception as e:
        logger.exception(f"Fatal error in daily collection: {e}")
        sys.exit(1)

    logger.info("=" * 60)
    logger.info("AgriX Daily Data Collection - Finished")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
