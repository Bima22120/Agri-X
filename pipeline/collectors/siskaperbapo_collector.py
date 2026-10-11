import urllib.parse
from typing import Optional, Dict, Any, List
from pipeline.collectors.base import BaseCollector, FetchResult
from pipeline.config import SISKAPERBAPO_TABLE_ENDPOINT, SISKAPERBAPO_MARKET_ENDPOINT

class SiskaperbapoCollector(BaseCollector):
    def __init__(self):
        super().__init__(source_id="siskaperbapo")

    def collect(self, tanggal: str, kabkota: str = "", pasar: str = "") -> FetchResult:
        """
        Collects consumer prices from SISKAPERBAPO East Java.
        kabkota: e.g. 'surabayakota' or '' (entire Jatim average).
        pasar: market ID or '' (all markets average).
        """
        form_dict = {
            "tanggal": tanggal,
            "kabkota": kabkota,
            "pasar": pasar
        }
        form_data = urllib.parse.urlencode(form_dict).encode("utf-8")

        headers = {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": "https://siskaperbapo.jatimprov.go.id/harga/tabel"
        }

        return self.fetch_url(
            url=SISKAPERBAPO_TABLE_ENDPOINT,
            method="POST",
            headers=headers,
            data=form_data,
            params=form_dict,
            file_ext="html"
        )

    def fetch_markets(self, kabkota_keycode: str) -> FetchResult:
        """Fetches market list for a specific regency/city."""
        url = f"{SISKAPERBAPO_MARKET_ENDPOINT}/{kabkota_keycode}"
        headers = {
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest"
        }
        return self.fetch_url(
            url=url,
            method="GET",
            headers=headers,
            params={"kabkota": kabkota_keycode},
            file_ext="json"
        )
