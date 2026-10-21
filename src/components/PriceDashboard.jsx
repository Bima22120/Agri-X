import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Download, 
  Star, 
  Search, 
  SlidersHorizontal, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  BarChart2, 
  CandlestickChart, 
  MapPin, 
  Layers, 
  ArrowRight, 
  Info, 
  Calendar, 
  Activity,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Table as TableIcon,
  Sparkles
} from 'lucide-react';
import { generateTimeseries, REGIONAL_PRICES } from '../data/mockData';
import { fetchPriceHistory, convertHistoryToOhlc } from '../services/apiService';

// Real agricultural produce images for botanical utama card visuals
const COMMODITY_IMAGES = {
  'cabai-rawit-merah': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80',
  'bawang-merah': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80',
  'beras-premium': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
  'beras-medium': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
  'cabai-merah-keriting': 'https://jangkausayur.com/cdn/shop/products/cmk_360x.jpg?v=1680442354',
  'tomat-beef': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
  'bawang-putih-honan': 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=400&q=80',
  'kentang-granola': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80'
};

export const PriceDashboard = ({ 
  commodities, 
  selectedCommodityId, 
  setSelectedCommodityId, 
  watchlist, 
  toggleWatchlist, 
  onNavigateToMarketplace,
  onOpenMethodology,
  onOpenAlertModal
}) => {
  const [chartType, setChartType] = useState('line'); // default 'line' is simpler for elderly users
  const [timeframe, setTimeframe] = useState('30d'); // '7d', '30d', '1y'
  const [activeSpotlightTab, setActiveSpotlightTab] = useState('chart'); // 'chart' or 'region'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'vegetables', 'rice'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' (simple friendly) or 'table' (dense full)
  const [compareCommodityId, setCompareCommodityId] = useState('');
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [showRetailCurve, setShowRetailCurve] = useState(true);

  // Live historical data from API
  const [liveHistory, setLiveHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Selected primary commodity
  const selectedCommodity = useMemo(() => {
    return commodities.find(c => c.id === selectedCommodityId) || commodities[0];
  }, [commodities, selectedCommodityId]);

  // Timeseries days count
  const daysCount = timeframe === '7d' ? 7 : timeframe === '1y' ? 90 : 30;

  // Fetch real history when commodity or timeframe changes
  useEffect(() => {
    let isMounted = true;
    setLoadingHistory(true);
    fetchPriceHistory(selectedCommodity.id, { days: daysCount })
      .then(res => {
        if (isMounted) {
          setLiveHistory(res);
          setLoadingHistory(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLiveHistory(null);
          setLoadingHistory(false);
        }
      });
    return () => { isMounted = false; };
  }, [selectedCommodity.id, daysCount]);

  // Chart data: prioritize real PIHPS or SISKAPERBAPO data, fallback to generateTimeseries
  const chartData = useMemo(() => {
    const pihpsSeries = liveHistory?.series?.pihps;
    if (pihpsSeries && pihpsSeries.length >= 2) {
      return convertHistoryToOhlc(pihpsSeries);
    }
    const siskapSeries = liveHistory?.series?.siskaperbapo;
    if (siskapSeries && siskapSeries.length >= 2) {
      return convertHistoryToOhlc(siskapSeries);
    }
    return generateTimeseries(selectedCommodity.currentPrice, 0.035, daysCount);
  }, [selectedCommodity, daysCount, liveHistory]);

  // Dynamic stats calculated from real history
  const dynamicStats = useMemo(() => {
    if (chartData && chartData.length > 0) {
      const closes = chartData.map(d => d.close);
      const high = Math.max(...chartData.map(d => d.high));
      const low = Math.min(...chartData.map(d => d.low));
      const avg = Math.round(closes.reduce((a, b) => a + b, 0) / closes.length);
      return { high, low, avg };
    }
    return {
      high: selectedCommodity.high30d,
      low: selectedCommodity.low30d,
      avg: selectedCommodity.jatimAvg
    };
  }, [chartData, selectedCommodity]);

  // Compare commodity object
  const compareCommodity = useMemo(() => {
    if (!compareCommodityId) return null;
    return commodities.find(c => c.id === compareCommodityId);
  }, [commodities, compareCommodityId]);

  // Filtered commodities list
  const filteredCommodities = useMemo(() => {
    return commodities.filter(item => {
      const matchCategory = categoryFilter === 'all' || 
        (categoryFilter === 'watchlist' ? watchlist.includes(item.id) : item.category === categoryFilter);
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.sniReference.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [commodities, categoryFilter, searchQuery, watchlist]);

  // Top 3 featured spotlight commodities (like Monstera, Cactus, Howea in utama.jpg)
  const topFeaturedCommodities = useMemo(() => {
    return [
      commodities.find(c => c.id === 'cabai-rawit-merah') || commodities[0],
      commodities.find(c => c.id === 'bawang-merah') || commodities[1],
      commodities.find(c => c.id === 'beras-premium') || commodities[2]
    ];
  }, [commodities]);

  // Chart SVG bounds calculation
  const chartBounds = useMemo(() => {
    if (!chartData || chartData.length === 0) return { min: 0, max: 100 };
    const allPrices = chartData.flatMap(d => [d.low, d.high]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const padding = (max - min) * 0.12 || 1000;
    return {
      min: Math.floor((min - padding) / 500) * 500,
      max: Math.ceil((max + padding) / 500) * 500
    };
  }, [chartData]);

  // Export CSV handler
  const handleExportCsv = () => {
    if (!chartData || chartData.length === 0) return;
    const headers = "Tanggal,Open,High,Low,Close,Volume\n";
    const rows = chartData.map(d => `${d.date},${d.open},${d.high},${d.low},${d.close},${d.volume}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PIHPS_${selectedCommodity.id}_${timeframe}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render SVG Candlestick
  const renderCandlestick = () => {
    const width = 800;
    const height = 240;
    const padding = { top: 20, right: 65, bottom: 30, left: 20 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const barWidth = Math.max(4, Math.min(18, (chartW / chartData.length) * 0.65));

    const priceToY = (price) => {
      const range = chartBounds.max - chartBounds.min;
      if (range === 0) return chartH / 2;
      return chartH - ((price - chartBounds.min) / range) * chartH + padding.top;
    };

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(58, 90, 64, 0.08)" />
            <stop offset="100%" stopColor="rgba(58, 90, 64, 0.02)" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = padding.top + chartH * pct;
          const priceVal = Math.round(chartBounds.max - pct * (chartBounds.max - chartBounds.min));
          return (
            <g key={idx}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(58, 90, 64, 0.12)" strokeDasharray="4 4" />
              <text x={width - padding.right + 8} y={y + 4} fill="#4a6350" fontSize="10" fontFamily="var(--font-body)">
                {priceVal.toLocaleString('id-ID')}
              </text>
            </g>
          );
        })}

        {/* Candles */}
        {chartData.map((d, idx) => {
          const x = padding.left + (idx + 0.5) * (chartW / chartData.length);
          const isUp = d.close >= d.open;
          const candleColor = isUp ? '#2d7a3d' : '#c0392b';
          const topBody = Math.min(priceToY(d.open), priceToY(d.close));
          const bodyHeight = Math.max(3, Math.abs(priceToY(d.open) - priceToY(d.close)));

          return (
            <g key={idx}>
              <line x1={x} y1={priceToY(d.high)} x2={x} y2={priceToY(d.low)} stroke={candleColor} strokeWidth="1.5" />
              <rect x={x - barWidth / 2} y={topBody} width={barWidth} height={bodyHeight} fill={candleColor} rx="1.5" />
              {idx % Math.ceil(chartData.length / 6) === 0 && (
                <text x={x} y={height - 8} textAnchor="middle" fill="#667f6b" fontSize="10" fontFamily="var(--font-body)">
                  {d.date.slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  // Render SVG Clean Line
  const renderLineChart = () => {
    const width = 800;
    const height = 240;
    const padding = { top: 20, right: 65, bottom: 30, left: 20 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const priceToY = (price) => {
      const range = chartBounds.max - chartBounds.min;
      if (range === 0) return chartH / 2;
      return chartH - ((price - chartBounds.min) / range) * chartH + padding.top;
    };

    const points = chartData.map((d, idx) => {
      const x = padding.left + (idx / (chartData.length - 1)) * chartW;
      const y = priceToY(d.close);
      return `${x},${y}`;
    }).join(' ');

    const firstX = padding.left;
    const lastX = padding.left + chartW;
    const bottomY = padding.top + chartH;
    const areaPath = `M ${firstX},${bottomY} L ${points.split(' ').join(' L ')} L ${lastX},${bottomY} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGradientSage" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(88, 129, 87, 0.25)" />
            <stop offset="100%" stopColor="rgba(88, 129, 87, 0.01)" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = padding.top + chartH * pct;
          const priceVal = Math.round(chartBounds.max - pct * (chartBounds.max - chartBounds.min));
          return (
            <g key={idx}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(58, 90, 64, 0.12)" strokeDasharray="4 4" />
              <text x={width - padding.right + 8} y={y + 4} fill="#4a6350" fontSize="10" fontFamily="var(--font-body)">
                {priceVal.toLocaleString('id-ID')}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#areaGradientSage)" />
        <polyline points={points} fill="none" stroke="#3A5A40" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {chartData.map((d, idx) => {
          if (idx % Math.ceil(chartData.length / 6) !== 0) return null;
          const x = padding.left + (idx / (chartData.length - 1)) * chartW;
          return (
            <text key={idx} x={x} y={height - 8} textAnchor="middle" fill="#667f6b" fontSize="10" fontFamily="var(--font-body)">
              {d.date.slice(5)}
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="utama-wrapper">

      {/* ── 1. TOP CARDS (Directly inspired by "My plants³" in utama.jpg) ── */}
      <div>
        <div className="utama-header-row">
          <div>
            <h1 className="utama-section-title">
              Harga Komoditas Hari Ini
              <span className="utama-count-badge">3 Utama</span>
            </h1>
            <div className="utama-section-sub">
              Harga acuan Jawa Timur (PIHPS Bank Indonesia & SISKAPERBAPO)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-outline btn-sm" 
              onClick={onOpenMethodology}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              <Info size={13} />
              <span>Sumber Data</span>
            </button>
          </div>
        </div>

        {/* 3 Green Rounded Cards (Monstéra, Cactus, Howea in utama.jpg) */}
        <div className="utama-plants-row">
          {topFeaturedCommodities.map(item => {
            const isSelected = item.id === selectedCommodity.id;
            const isUp = item.trend === 'up';
            const isDown = item.trend === 'down';
            const isWatch = watchlist.includes(item.id);
            const imageSrc = COMMODITY_IMAGES[item.id] || COMMODITY_IMAGES['cabai-rawit-merah'];

            return (
              <div 
                key={item.id} 
                className={`utama-plant-card ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCommodityId(item.id)}
              >
                {/* Top bar: Status & Pin */}
                <div className="utama-card-top-bar">
                  <span className={`utama-status-pill ${isUp ? 'up' : isDown ? 'down' : ''}`}>
                    {isUp ? <TrendingUp size={12} /> : isDown ? <TrendingDown size={12} /> : <Minus size={12} />}
                    {isUp ? `+${item.changePercent}%` : `${item.changePercent}%`}
                  </span>

                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleWatchlist(item.id); }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ffffff' }}
                    title={isWatch ? "Hapus dari Watchlist" : "Simpan ke Watchlist"}
                  >
                    <Star size={16} fill={isWatch ? '#ffd166' : 'none'} color={isWatch ? '#ffd166' : '#ffffff'} />
                  </button>
                </div>

                {/* Center: Produce Photo in Circular Cutout (utama.jpg) */}
                <div className="utama-card-image-box">
                  <img src={imageSrc} alt={item.name} className="utama-card-img" />
                </div>

                {/* Bottom: Name & Big Clear Price */}
                <div className="utama-card-bottom">
                  <div className="utama-card-name">{item.name}</div>
                  <div className="utama-card-price">
                    Rp {item.currentPrice.toLocaleString('id-ID')}
                    <span className="utama-card-unit"> /{item.unit}</span>
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '3px' }}>
                    {item.category === 'vegetables' ? 'Hortikultura' : 'Beras Pangan'} · Jawa Timur
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. SPOTLIGHT DETAIL CARD (Inspired by Calathea screen in utama.jpg) ── */}
      <div className="utama-spotlight-box">
        {/* TOP TIER: Forest Green Lush Hero */}
        <div className="spotlight-green-tier">
          <div className="spotlight-img-frame">
            <img 
              src={COMMODITY_IMAGES[selectedCommodity.id] || COMMODITY_IMAGES['cabai-rawit-merah']} 
              alt={selectedCommodity.name} 
              className="spotlight-img" 
            />
          </div>

          <div className="spotlight-info-center">
            <h2>{selectedCommodity.name}</h2>
            <div className="spotlight-sni">{selectedCommodity.sniReference}</div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
              <div className="spotlight-price-hero">
                Rp {selectedCommodity.currentPrice.toLocaleString('id-ID')}
                <span style={{ fontSize: '16px', opacity: 0.85, fontWeight: 500 }}> /{selectedCommodity.unit}</span>
              </div>

              <div className="spotlight-stats-pills">
                <div className="spotlight-stat-pill">
                  {selectedCommodity.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{selectedCommodity.changePercent > 0 ? `+${selectedCommodity.changePercent}` : selectedCommodity.changePercent}%</span>
                </div>
                <div className="spotlight-stat-pill">
                  <span>Rata-rata Jatim: Rp {dynamicStats.avg.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button 
              className="spotlight-cta-btn"
              onClick={() => onNavigateToMarketplace(selectedCommodity.id)}
              id="btn-spotlight-b2b"
            >
              <span>Beli Pasokan</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* BOTTOM TIER: White Card with 2 Friendly Tabs */}
        <div className="spotlight-white-tier">
          {/* Tabs selector */}
          <div className="spotlight-tabs-bar">
            <button 
              className={`spotlight-tab-btn ${activeSpotlightTab === 'chart' ? 'active' : ''}`}
              onClick={() => setActiveSpotlightTab('chart')}
            >
              <BarChart2 size={16} />
              <span>Grafik Harga</span>
            </button>
            <button 
              className={`spotlight-tab-btn ${activeSpotlightTab === 'region' ? 'active' : ''}`}
              onClick={() => setActiveSpotlightTab('region')}
            >
              <MapPin size={16} />
              <span>Banding Wilayah</span>
            </button>
          </div>

          {/* TAB 1: CHART & METRICS */}
          {activeSpotlightTab === 'chart' && (
            <div>
              {/* Chart Toolbar Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Waktu:</span>
                  <div className="timeframe-group">
                    <button className={`tf-btn ${timeframe === '7d' ? 'active' : ''}`} onClick={() => setTimeframe('7d')}>7 Hari</button>
                    <button className={`tf-btn ${timeframe === '30d' ? 'active' : ''}`} onClick={() => setTimeframe('30d')}>30 Hari</button>
                    <button className={`tf-btn ${timeframe === '1y' ? 'active' : ''}`} onClick={() => setTimeframe('1y')}>90 Hari</button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div className="timeframe-group">
                    <button className={`tf-btn ${chartType === 'line' ? 'active' : ''}`} onClick={() => setChartType('line')}>Garis</button>
                    <button className={`tf-btn ${chartType === 'candlestick' ? 'active' : ''}`} onClick={() => setChartType('candlestick')}>Lilin</button>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={handleExportCsv} title="Unduh CSV">
                    <Download size={13} />
                    <span>Unduh CSV</span>
                  </button>
                </div>
              </div>

              {/* Chart Rendering */}
              <div className="chart-svg-wrapper">
                {chartType === 'candlestick' ? renderCandlestick() : renderLineChart()}
              </div>

              {/* 2 Friendly Big Metric Boxes */}
              <div className="friendly-metrics-row">
                <div className="friendly-metric-box">
                  <div className="friendly-metric-val">Rp {dynamicStats.high.toLocaleString('id-ID')}</div>
                  <div className="friendly-metric-lbl">TERTINGGI ({daysCount} HARI)</div>
                </div>
                <div className="friendly-metric-box">
                  <div className="friendly-metric-val">Rp {dynamicStats.low.toLocaleString('id-ID')}</div>
                  <div className="friendly-metric-lbl">TERENDAH ({daysCount} HARI)</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGIONAL COMPARISON TABLE */}
          {activeSpotlightTab === 'region' && (
            <div>
              <div style={{ marginBottom: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Perbandingan harga antar kota di Jawa Timur:
              </div>
              <div className="data-table-wrapper">
                <table className="trading-table">
                  <thead>
                    <tr>
                      <th>Kota / Kabupaten</th>
                      <th>Status Wilayah</th>
                      <th style={{ textAlign: 'right' }}>Cabai Rawit Merah</th>
                      <th style={{ textAlign: 'right' }}>Bawang Merah</th>
                      <th style={{ textAlign: 'right' }}>Beras Medium</th>
                      <th style={{ textAlign: 'right' }}>Beras Premium</th>
                      <th style={{ textAlign: 'center' }}>Disparitas vs Surabaya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REGIONAL_PRICES.map((reg, idx) => {
                      const diffSurabaya = reg.cabaiRawit - 42500;
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>
                            {reg.city}
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '6px' }}>({reg.province})</span>
                          </td>
                          <td>
                            <span className={`badge ${reg.status.includes('Sentra') ? 'badge-up' : reg.status.includes('Pilot') ? 'badge-amber' : 'badge-flat'}`}>
                              {reg.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }} className="num-mono">Rp {reg.cabaiRawit.toLocaleString('id-ID')}</td>
                          <td style={{ textAlign: 'right' }} className="num-mono">Rp {reg.bawangMerah.toLocaleString('id-ID')}</td>
                          <td style={{ textAlign: 'right' }} className="num-mono">Rp {reg.berasMedium.toLocaleString('id-ID')}</td>
                          <td style={{ textAlign: 'right' }} className="num-mono">Rp {reg.berasPremium.toLocaleString('id-ID')}</td>
                          <td style={{ textAlign: 'center' }}>
                            {diffSurabaya === 0 ? (
                              <span className="badge badge-flat">Acuan (0)</span>
                            ) : diffSurabaya < 0 ? (
                              <span className="badge badge-up num-mono">
                                {diffSurabaya.toLocaleString('id-ID')} (-{Math.abs(Math.round((diffSurabaya/42500)*100))}%)
                              </span>
                            ) : (
                              <span className="badge badge-down num-mono">
                                +{diffSurabaya.toLocaleString('id-ID')} (+{Math.round((diffSurabaya/42500)*100)}%)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. EXPLORE SECTION (Inspired by "Explore" in utama.jpg) ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 className="utama-section-title" style={{ fontSize: '22px', margin: 0 }}>
              Semua Komoditas
            </h2>
            <div className="utama-section-sub">
              Pilih komoditas untuk lihat grafik lengkap
            </div>
          </div>

          {/* Controls: Search, Filter, & View Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="timeframe-group">
              <button 
                className={`tf-btn ${categoryFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('all')}
              >
                Semua
              </button>
              <button 
                className={`tf-btn ${categoryFilter === 'vegetables' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('vegetables')}
              >
                Sayuran
              </button>
              <button 
                className={`tf-btn ${categoryFilter === 'rice' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('rice')}
              >
                Beras
              </button>
              <button 
                className={`tf-btn ${categoryFilter === 'watchlist' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('watchlist')}
              >
                Simpanan
              </button>
            </div>

            {/* Toggle View */}
            <div className="timeframe-group">
              <button 
                className={`tf-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
              >
                <LayoutGrid size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Kartu
              </button>
              <button 
                className={`tf-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <TableIcon size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Tabel
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: CLEAN CARDS (Explore in utama.jpg) */}
        {viewMode === 'cards' && (
          <div className="explore-cards-grid">
            {filteredCommodities.map(item => {
              const isSelected = item.id === selectedCommodity.id;
              const isUp = item.trend === 'up';
              const isDown = item.trend === 'down';
              const isWatch = watchlist.includes(item.id);
              const imageSrc = COMMODITY_IMAGES[item.id] || COMMODITY_IMAGES['cabai-rawit-merah'];

              return (
                <div 
                  key={item.id} 
                  className={`explore-card ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedCommodityId(item.id)}
                >
                  <img src={imageSrc} alt={item.name} className="explore-card-img" />

                  <div className="explore-card-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="explore-card-name">{item.name}</div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleWatchlist(item.id); }}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}
                      >
                        <Star size={14} fill={isWatch ? 'var(--earth)' : 'none'} color={isWatch ? 'var(--earth)' : 'var(--text-muted)'} />
                      </button>
                    </div>

                    <div className="explore-card-price">
                      Rp {item.currentPrice.toLocaleString('id-ID')}
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}> /{item.unit}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span className={`badge num-mono ${isUp ? 'badge-up' : isDown ? 'badge-down' : 'badge-flat'}`} style={{ fontSize: '10px', padding: '2px 7px' }}>
                        {isUp ? `+${item.changePercent}%` : `${item.changePercent}%`}
                      </span>

                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={(e) => { e.stopPropagation(); onNavigateToMarketplace(item.id); }}
                        style={{ fontSize: '10px', padding: '3px 8px' }}
                      >
                        Pasokan →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: FULL TRADING TABLE (Kept intact with all 8 columns) */}
        {viewMode === 'table' && (
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="data-table-wrapper">
              <table className="trading-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>Pin</th>
                    <th>Komoditas & Standar Mutu</th>
                    <th>Kategori</th>
                    <th style={{ textAlign: 'right' }}>Harga Grosir (Jatim)</th>
                    <th style={{ textAlign: 'right' }}>Perubahan Harian</th>
                    <th style={{ textAlign: 'right' }}>Rata-rata Nasional</th>
                    <th style={{ textAlign: 'right' }}>Rentang 30H (Min - Max)</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommodities.map(item => {
                    const isSelected = item.id === selectedCommodity.id;
                    const isUp = item.trend === 'up';
                    const isDown = item.trend === 'down';
                    const isWatch = watchlist.includes(item.id);

                    return (
                      <tr 
                        key={item.id} 
                        className={isSelected ? 'selected' : ''}
                        onClick={() => setSelectedCommodityId(item.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleWatchlist(item.id); }}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isWatch ? 'var(--earth)' : 'var(--text-muted)' }}
                          >
                            <Star size={14} fill={isWatch ? 'var(--earth)' : 'none'} />
                          </button>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.sniReference}</div>
                        </td>
                        <td>
                          <span className="badge" style={{ background: 'var(--forest-dim)', color: 'var(--forest)' }}>
                            {item.category === 'vegetables' ? 'Hortikultura' : 'Beras Pangan'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="num-mono" style={{ fontWeight: 800, fontSize: '14px' }}>
                            Rp {item.currentPrice.toLocaleString('id-ID')}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}> /{item.unit}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`badge num-mono ${isUp ? 'badge-up' : isDown ? 'badge-down' : 'badge-flat'}`}>
                            {isUp ? <TrendingUp size={11} /> : isDown ? <TrendingDown size={11} /> : <Minus size={11} />}
                            {item.changePercent > 0 ? `+${item.changePercent}%` : `${item.changePercent}%`} 
                            <span style={{ opacity: 0.8, marginLeft: '3px' }}>
                              ({item.changeNominal >= 0 ? `+${item.changeNominal}` : item.changeNominal})
                            </span>
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="num-mono" style={{ color: 'var(--text-secondary)' }}>
                            Rp {item.nationalAvg.toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="num-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {item.low30d.toLocaleString('id-ID')} - {item.high30d.toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={(e) => { e.stopPropagation(); onNavigateToMarketplace(item.id); }}
                            title="Buka Penawaran Marketplace"
                          >
                            Pasokan
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
