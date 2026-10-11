import time
import random
import hashlib
import json
import ssl
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path
from dataclasses import dataclass
from typing import Optional, Dict, Any

from pipeline.config import (
    RAW_STORAGE_DIR,
    REQUEST_TIMEOUT_SECONDS,
    MIN_REQUEST_INTERVAL_SECONDS,
    JITTER_MAX_SECONDS,
    MAX_RETRIES,
    BACKOFF_FACTOR,
    USER_AGENT
)
from pipeline.db import insert_raw_fetch, find_raw_fetch_by_hash

@dataclass
class FetchResult:
    raw_fetch_id: int
    source_id: str
    fetch_url: str
    request_params: Dict[str, Any]
    http_status: int
    content_hash: str
    payload_text: str
    payload_path: str
    is_new: bool

class BaseCollector:
    def __init__(self, source_id: str):
        self.source_id = source_id
        self._last_request_time = 0.0
        self.ssl_context = ssl.create_default_context()
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE

    def _wait_rate_limit(self):
        """Enforces at most 1 request per 2 seconds with random jitter."""
        elapsed = time.time() - self._last_request_time
        min_wait = MIN_REQUEST_INTERVAL_SECONDS + random.uniform(0.1, JITTER_MAX_SECONDS)
        if elapsed < min_wait:
            time.sleep(min_wait - elapsed)
        self._last_request_time = time.time()

    def fetch_url(self, url: str, method: str = "GET", headers: Optional[Dict[str, str]] = None, 
                  data: Optional[bytes] = None, params: Optional[Dict[str, Any]] = None, 
                  file_ext: str = "json") -> FetchResult:
        """
        Executes HTTP request with rate limit, retry, hashing, and raw storage.
        """
        req_headers = {
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/json,*/*;q=0.9"
        }
        if headers:
            req_headers.update(headers)

        params_to_record = params or {}
        attempts = 0
        response_text = ""
        http_status = 0
        content_type = ""

        while attempts < MAX_RETRIES:
            attempts += 1
            self._wait_rate_limit()

            try:
                req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
                with urllib.request.urlopen(req, context=self.ssl_context, timeout=REQUEST_TIMEOUT_SECONDS) as resp:
                    http_status = resp.status
                    content_type = resp.headers.get("Content-Type", "")
                    raw_bytes = resp.read()
                    response_text = raw_bytes.decode("utf-8", errors="replace")
                    break
            except urllib.error.HTTPError as he:
                http_status = he.code
                retry_after = he.headers.get("Retry-After")
                if retry_after and retry_after.isdigit():
                    time.sleep(float(retry_after))
                else:
                    time.sleep(BACKOFF_FACTOR ** attempts + random.uniform(0.5, 1.5))
                if attempts >= MAX_RETRIES:
                    raise RuntimeError(f"HTTPError {he.code} fetching {url} after {attempts} attempts")
            except Exception as e:
                time.sleep(BACKOFF_FACTOR ** attempts + random.uniform(0.5, 1.5))
                if attempts >= MAX_RETRIES:
                    raise RuntimeError(f"Network error fetching {url} after {attempts} attempts: {e}")

        # Compute SHA-256 hash
        content_hash = hashlib.sha256(response_text.encode("utf-8")).hexdigest()

        # Check if already fetched with same hash for idempotency
        existing = find_raw_fetch_by_hash(self.source_id, content_hash)
        
        # Save raw payload to disk
        now_dt = datetime.now(timezone.utc)
        date_folder = now_dt.strftime("%Y-%m-%d")
        storage_dir = RAW_STORAGE_DIR / self.source_id / date_folder
        storage_dir.mkdir(parents=True, exist_ok=True)
        file_path = storage_dir / f"{content_hash[:16]}.{file_ext}"

        if not file_path.exists():
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(response_text)

        if existing:
            raw_id = existing["id"]
            is_new = False
        else:
            # Record in raw_fetch table
            raw_id = insert_raw_fetch(
                source_id=self.source_id,
                fetch_url=url,
                request_params=params_to_record,
                http_status=http_status,
                content_type=content_type,
                content_hash=content_hash,
                payload_ref_or_blob=str(file_path),
            )
            is_new = True

        return FetchResult(
            raw_fetch_id=raw_id,
            source_id=self.source_id,
            fetch_url=url,
            request_params=params_to_record,
            http_status=http_status,
            content_hash=content_hash,
            payload_text=response_text,
            payload_path=str(file_path),
            is_new=is_new
        )
