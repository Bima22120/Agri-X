/**
 * AgriX API Service Layer
 * Connects React frontend to FastAPI backend at localhost:8000.
 * Falls back to mock data if API is unavailable.
 */

const API_BASE = import.meta.env.VITE_API_URL || "";

/** Generic fetch wrapper with timeout and error handling */
async function apiFetch(path, params = {}) {
  const base = API_BASE || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');
  const url = new URL(path, base);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: "application/json" }
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// API calls
// ──────────────────────────────────────────────────────────────────────────────

export async function checkApiHealth() {
  return apiFetch("/health");
}

export async function fetchCommodities() {
  return apiFetch("/api/commodities");
}

export async function fetchLatestPrices(opts = {}) {
  return apiFetch("/api/prices/latest", opts);
}

export async function fetchPriceHistory(commodityId, opts = {}) {
  const dbId = FRONTEND_TO_DB_ID_MAP[commodityId] || commodityId;
  return apiFetch("/api/prices/history", { commodity_id: dbId, ...opts });
}

export async function fetchPriceSummary(opts = {}) {
  return apiFetch("/api/prices/summary", opts);
}

export async function fetchPipelineStatus(limit = 10) {
  return apiFetch("/api/pipeline/status", { limit });
}

export async function fetchTickerPrices() {
  return apiFetch("/api/prices/ticker");
}

// ──────────────────────────────────────────────────────────────────────────────
// Data transformer: API → component format
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Maps DB commodity IDs to frontend mock data IDs.
 * DB uses snake_case technical IDs; frontend uses kebab-case Indonesian IDs.
 */
export const DB_TO_FRONTEND_ID_MAP = {
  "chili_birdseye_red": "cabai-rawit-merah",
  "chili_birdseye_green": "cabai-rawit-hijau",
  "chili_red_curly": "cabai-merah-keriting",
  "chili_red_large": "cabai-merah-besar",
  "shallot_medium": "bawang-merah",
  "garlic_honan": "bawang-putih",
  "rice_premium": "beras-premium",
  "rice_medium_1": "beras-medium",
  "rice_medium_2": "beras-medium-2",
  "rice_low_1": "beras-medium",      // fallback
  "rice_super_1": "beras-premium",   // fallback
  "beef_quality_1": "daging-sapi",
  "beef_quality_2": "daging-sapi-kualitas-2",
  "chicken_meat_broiler": "daging-ayam-ras",
  "chicken_meat_kampung": "daging-ayam-kampung",
  "chicken_eggs_fresh": "telur-ayam",
  "sugar_local": "gula-pasir",
  "sugar_premium": "gula-pasir-premium",
  "cooking_oil_bulk": "minyak-goreng-curah",
  "cooking_oil_branded_1": "minyak-goreng-kemasan",
  "potato_granola": "kentang",
  "tomato_fresh": "tomat",
  "carrot_fresh": "wortel",
  "cabbage": "kubis",
  "green_beans": "buncis",
};

/**
 * Maps frontend IDs to DB commodity IDs.
 */
export const FRONTEND_TO_DB_ID_MAP = Object.fromEntries(
  Object.entries(DB_TO_FRONTEND_ID_MAP).map(([dbId, feId]) => [feId, dbId])
);

/**
 * Merges live API prices and summary data with existing COMMODITIES mock data.
 * Returns an enriched array compatible with existing components.
 */
export function mergeLivePricesWithCommodities(mockCommodities, latestPrices, summaryData = null, historyMap = {}) {
  if (!latestPrices || !latestPrices.length) return mockCommodities;

  // Build price lookup by FRONTEND id → { pihps, siskaperbapo }
  const priceLookup = {};
  for (const p of latestPrices) {
    const frontendId = DB_TO_FRONTEND_ID_MAP[p.commodity_id] || p.commodity_id;
    if (!priceLookup[frontendId]) priceLookup[frontendId] = {};
    priceLookup[frontendId][p.source_id] = p;
  }

  const allChanges = summaryData?.price_movement?.all_changes || {};

  return mockCommodities.map(mock => {
    const live = priceLookup[mock.id];
    if (!live) return mock;

    // Prefer PIHPS (wholesale) as primary price if available, else siskaperbapo
    const primary = live.pihps || live.siskaperbapo;
    if (!primary || !primary.price_idr) return mock;

    const history = historyMap[mock.id] || mock.priceHistory;

    // Real change stats if available
    const dbId = FRONTEND_TO_DB_ID_MAP[mock.id] || mock.id;
    const movement = allChanges[dbId];
    let changePct = mock.changePercent;
    let changeNom = mock.changeNominal;
    let trend = mock.trend;

    if (movement) {
      changePct = movement.pct_change ?? mock.changePercent;
      changeNom = (movement.today_price && movement.prev_price) 
        ? (movement.today_price - movement.prev_price) 
        : mock.changeNominal;
      trend = changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'flat';
    }

    return {
      ...mock,
      currentPrice: primary.price_idr,
      lastUpdated: primary.observed_date,
      priceLevel: primary.price_level,
      source: primary.source_id,
      changePercent: changePct,
      changeNominal: changeNom,
      trend: trend,
      priceLevels: {
        wholesale: live.pihps?.price_idr ?? mock.priceLevels?.wholesale,
        retail: live.siskaperbapo?.price_idr ?? mock.priceLevels?.retail,
        consumer: live.siskaperbapo?.price_idr ?? mock.priceLevels?.consumer,
      },
      priceHistory: history,
      isLiveData: true
    };
  });
}

/**
 * Converts API history series into the chart-ready format used by PriceDashboard.
 * Returns array of { date, price } objects.
 */
export function apiHistoryToChartSeries(apiHistory, sourceId = "pihps") {
  if (!apiHistory?.series) return [];
  const series = apiHistory.series[sourceId] || apiHistory.series.siskaperbapo || [];
  return series.map(p => ({
    date: p.date,
    price: p.price
  }));
}

/**
 * Converts flat price observation series into OHLC format for candlestick chart.
 */
export function convertHistoryToOhlc(series) {
  if (!series || !series.length) return [];
  return series.map((item, idx) => {
    const prev = idx > 0 ? series[idx - 1].price : item.price;
    const open = prev;
    const close = item.price;
    const maxVal = Math.max(open, close);
    const minVal = Math.min(open, close);
    const high = Math.round(maxVal * 1.006);
    const low = Math.round(minVal * 0.994);
    const volume = Math.round(4500 + ((item.price * 7) % 3500));
    return {
      date: item.date,
      open,
      high,
      low,
      close,
      price: close,
      volume
    };
  });
}
