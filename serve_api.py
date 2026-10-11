"""
AgriX API Server Entry Point
Run: python serve_api.py [--port 8000]
"""
import sys
import argparse

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from pipeline.db import init_db
from pipeline.seed_data import seed_database

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Start AgriX API Server")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--host", type=str, default="127.0.0.1")
    parser.add_argument("--reload", action="store_true", default=False)
    args = parser.parse_args()

    # Ensure DB is initialized
    print("[*] Initializing database...")
    init_db()
    seed_database()
    print("[*] Database ready.")

    import uvicorn
    print(f"[*] Starting AgriX API at http://{args.host}:{args.port}")
    uvicorn.run(
        "pipeline.api:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="info"
    )
