import re
import json
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
from bs4 import BeautifulSoup

from pipeline.db import (
    get_connection,
    insert_price_observation,
    insert_quarantine
)

class Normalizer:
    def __init__(self):
        self._load_crosswalks()

    def _load_crosswalks(self):
        conn = get_connection()
        cur = conn.cursor()

        # Load commodity crosswalk
        cur.execute("SELECT source_id, source_commodity_name, commodity_id, unit_conversion_factor FROM commodity_crosswalk")
        self.commodity_crosswalk = {}
        for row in cur.fetchall():
            key = (row["source_id"], row["source_commodity_name"].strip().lower())
            self.commodity_crosswalk[key] = (row["commodity_id"], row["unit_conversion_factor"])

        # Load region market crosswalk
        cur.execute("SELECT source_id, source_name, region_id, market_id FROM region_market_crosswalk")
        self.region_crosswalk = {}
        for row in cur.fetchall():
            key = (row["source_id"], row["source_name"].strip().lower())
            self.region_crosswalk[key] = (row["region_id"], row["market_id"])

        # Load valid units
        self.valid_units = {"kg", "liter", "ltr", "butir", "ekor", "btg", "sak", "gram"}

        conn.close()

    def parse_price(self, raw_val: Any) -> Optional[int]:
        """
        Parses raw price string to integer IDR.
        Strips currency symbols, thousand dots or commas, whitespace.
        Treats '-', 'n/a', '', None as None (never zero).
        """
        if raw_val is None:
            return None
        val_str = str(raw_val).strip()
        if not val_str or val_str in ["-", "n/a", "N/A", "null", "None"]:
            return None
        # Remove currency prefix/suffix
        val_str = re.sub(r"[^\d,\.]", "", val_str)
        if not val_str:
            return None

        # Clean thousand separators
        # Case 1: PIHPS format '14,950' or '14,950.00'
        # Case 2: SISKAPERBAPO format '16.333'
        if "," in val_str and "." in val_str:
            # e.g. 14,950.00 -> comma is thousand, dot is decimal
            val_str = val_str.split(".")[0].replace(",", "")
        elif "," in val_str:
            # either 14,950 (thousand) or 14,5 (decimal)
            parts = val_str.split(",")
            if len(parts[-1]) == 3: # 14,950
                val_str = val_str.replace(",", "")
            else:
                val_str = parts[0]
        elif "." in val_str:
            # e.g. 16.333 or 16.333.00
            parts = val_str.split(".")
            if len(parts) > 1 and len(parts[-1]) == 3: # 16.333
                val_str = val_str.replace(".", "")
            else:
                val_str = parts[0]

        try:
            val_int = int(val_str)
            return val_int if val_int > 0 else None
        except ValueError:
            return None

    def normalize_pihps(self, raw_fetch_id: int, payload_json_str: str, request_params: dict) -> Tuple[int, int]:
        """
        Normalizes PIHPS JSON data into unified price_observation.
        Returns (normalized_count, quarantined_count).
        """
        try:
            data_obj = json.loads(payload_json_str)
        except Exception as e:
            insert_quarantine(raw_fetch_id, f"INVALID_JSON: {e}", {"raw": payload_json_str[:500]})
            return 0, 1

        rows = data_obj.get("data", [])
        if not rows:
            insert_quarantine(raw_fetch_id, "EMPTY_DATA_ARRAY", {"params": request_params})
            return 0, 1

        # Determine price level
        price_type_id = request_params.get("price_type_id", "3")
        price_level = "wholesale" if price_type_id == "3" else "traditional_retail" if price_type_id == "1" else "producer"

        # Determine region
        prov_id = request_params.get("province_id", "16")
        region_id = "ID_35" if prov_id == "16" else "ID_NAT"

        normalized_count = 0
        quarantined_count = 0

        # Regex for date columns e.g. '01/10/2026' or '05/10/2026'
        date_col_regex = re.compile(r"^(\d{2})/(\d{2})/(\d{4})$")

        for item in rows:
            source_commodity_name = item.get("name", "").strip()
            if not source_commodity_name:
                continue

            # Check crosswalk
            cw_entry = self.commodity_crosswalk.get(("pihps", source_commodity_name.lower()))
            if not cw_entry:
                insert_quarantine(raw_fetch_id, f"UNMAPPED_COMMODITY: '{source_commodity_name}'", item)
                quarantined_count += 1
                continue

            commodity_id, conversion_factor = cw_entry

            # Iterate over date fields
            for key, val in item.items():
                date_match = date_col_regex.match(key)
                if not date_match:
                    continue

                day, month, year = date_match.groups()
                observed_date = f"{year}-{month}-{day}"

                price_idr = self.parse_price(val)
                if price_idr is not None and conversion_factor != 1.0:
                    price_idr = int(round(price_idr * conversion_factor))

                # Insert observation
                inserted = insert_price_observation(
                    source_id="pihps",
                    price_level=price_level,
                    commodity_id=commodity_id,
                    region_id=region_id,
                    market_id=None,
                    observed_date=observed_date,
                    source_timestamp=None,
                    price_idr=price_idr,
                    unit="kg",
                    quality_flags=[],
                    raw_fetch_id=raw_fetch_id,
                    version=1
                )
                if inserted:
                    normalized_count += 1

        return normalized_count, quarantined_count

    def normalize_siskaperbapo(self, raw_fetch_id: int, html_str: str, request_params: dict) -> Tuple[int, int]:
        """
        Normalizes SISKAPERBAPO HTML table into unified price_observation.
        Returns (normalized_count, quarantined_count).
        """
        soup = BeautifulSoup(html_str, "html.parser")
        table = soup.find("table")
        if not table:
            insert_quarantine(raw_fetch_id, "NO_TABLE_FOUND_IN_HTML", {"params": request_params})
            return 0, 1

        observed_date = request_params.get("tanggal", datetime.now().strftime("%Y-%m-%d"))
        kabkota = request_params.get("kabkota", "")
        pasar = request_params.get("pasar", "")

        # Crosswalk region and market
        reg_entry = self.region_crosswalk.get(("siskaperbapo", kabkota.lower()))
        region_id = reg_entry[0] if reg_entry else "ID_35" # Default East Java province
        market_id = reg_entry[1] if reg_entry and reg_entry[1] else (f"MKT_{pasar}" if pasar else None)

        normalized_count = 0
        quarantined_count = 0

        rows = table.find_all("tr")
        for row in rows:
            cells = [td.text.strip() for td in row.find_all(["td", "th"])]
            if len(cells) < 5:
                continue

            # Header / category divider check e.g. ['01', 'BERAS', '', '0', '0']
            commodity_raw = cells[1].strip()
            unit_raw = cells[2].strip().lower()
            price_raw = cells[4].strip() # Current day price

            if not unit_raw and not price_raw:
                # Category banner row, skip without quarantine
                continue

            # Strip leading bullet/dash e.g. '- Beras Premium' -> 'Beras Premium'
            clean_name = re.sub(r"^[-–•\s]+", "", commodity_raw)

            # Check crosswalk
            cw_entry = self.commodity_crosswalk.get(("siskaperbapo", clean_name.lower())) or \
                       self.commodity_crosswalk.get(("siskaperbapo", commodity_raw.lower()))

            if not cw_entry:
                # Only quarantine if it has unit or price
                if unit_raw or (price_raw and price_raw != "0"):
                    insert_quarantine(raw_fetch_id, f"UNMAPPED_COMMODITY: '{clean_name}'", {"row": cells})
                    quarantined_count += 1
                continue

            commodity_id, conversion_factor = cw_entry

            # Validate unit
            if unit_raw and unit_raw not in self.valid_units:
                insert_quarantine(raw_fetch_id, f"UNKNOWN_UNIT: '{unit_raw}'", {"row": cells})
                quarantined_count += 1
                continue

            price_idr = self.parse_price(price_raw)
            if price_idr is not None and conversion_factor != 1.0:
                price_idr = int(round(price_idr * conversion_factor))

            inserted = insert_price_observation(
                source_id="siskaperbapo",
                price_level="consumer_retail",
                commodity_id=commodity_id,
                region_id=region_id,
                market_id=market_id,
                observed_date=observed_date,
                source_timestamp=None,
                price_idr=price_idr,
                unit=unit_raw if unit_raw else "kg",
                quality_flags=[],
                raw_fetch_id=raw_fetch_id,
                version=1
            )
            if inserted:
                normalized_count += 1

        return normalized_count, quarantined_count
