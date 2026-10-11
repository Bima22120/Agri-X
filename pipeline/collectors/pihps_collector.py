import urllib.parse
from typing import Optional, List
from pipeline.collectors.base import BaseCollector, FetchResult
from pipeline.config import PIHPS_GRID_ENDPOINT, PIHPS_PRIMARY_PRICE_LEVEL

class PihpsCollector(BaseCollector):
    def __init__(self):
        super().__init__(source_id="pihps")

    def collect(self, start_date: str, end_date: str, province_id: str = "16", 
                price_type_id: str = "3", comcat_ids: Optional[List[str]] = None) -> FetchResult:
        """
        Collects PIHPS prices from Bank Indonesia API for date range and province.
        province_id '16' = Jawa Timur. Empty province_id = National.
        price_type_id '3' = Pedagang Besar (Wholesale).
        """
        if not comcat_ids:
            # Default all key categories: Beras, Bawang Merah, Bawang Putih, Cabai Merah, Cabai Rawit, dll.
            comcat_ids = [
                "cat_1", "com_1", "com_2", "com_3", "com_4", "com_5", "com_6",
                "cat_5", "com_11",
                "cat_6", "com_12",
                "cat_7", "com_13", "com_14",
                "cat_8", "com_15", "com_16",
                "cat_2", "com_7",
                "cat_3", "com_8", "com_9",
                "cat_4", "com_10",
                "cat_9", "com_17", "com_18", "com_19",
                "cat_10", "com_20", "com_21"
            ]

        params = {
            "price_type_id": str(price_type_id),
            "comcat_id": ",".join(comcat_ids),
            "province_id": str(province_id) if province_id else "",
            "regency_id": "",
            "market_id": "",
            "tipe_laporan": "1",
            "start_date": start_date,
            "end_date": end_date
        }

        query_string = urllib.parse.urlencode(params)
        full_url = f"{PIHPS_GRID_ENDPOINT}?{query_string}"

        headers = {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": "https://www.bi.go.id/hargapangan/TabelHarga/PedagangBesarDaerah"
        }

        return self.fetch_url(
            url=full_url,
            method="GET",
            headers=headers,
            params=params,
            file_ext="json"
        )
