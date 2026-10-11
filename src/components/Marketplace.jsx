import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Filter, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Truck, 
  Clock, 
  TrendingDown, 
  AlertCircle, 
  Star, 
  CreditCard, 
  HelpCircle,
  Plus,
  ArrowRight,
  Eye,
  Info,
  Search,
  Sparkles,
  Award,
  RefreshCw,
  PackageCheck,
  Layers,
  Flame,
  Wheat,
  CircleDot,
  Boxes,
  Package
} from 'lucide-react';
import { GRADE_CRITERIA, VERIFIED_PARTNERS } from '../data/mockData';

export const Marketplace = ({ 
  listings, 
  commodities, 
  partners, 
  currentRole, 
  onCreateOrder, 
  onViewOrders,
  filterCommodityId,
  setFilterCommodityId
}) => {
  const [selectedGrade, setSelectedGrade] = useState('all'); // 'all', 'A', 'B', 'C'
  const [selectedCity, setSelectedCity] = useState('all');
  const [priceSort, setPriceSort] = useState('default');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeModalListing, setActiveModalListing] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(100);
  const [deliveryDate, setDeliveryDate] = useState('2026-10-12');
  const [deliveryNotes, setDeliveryNotes] = useState('Pengiriman jam 07.00 - 09.00 pagi sebelum operasional restoran.');
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState('bca_va');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // Quick category circles with professional icons (no emojis)
  const CATEGORY_CIRCLES = [
    { id: '', label: 'Semua', icon: <Layers size={22} style={{ color: 'var(--forest)' }} /> },
    { id: 'cabai-rawit-merah', label: 'Cabai Rawit', icon: <Flame size={22} style={{ color: '#c0392b' }} /> },
    { id: 'bawang-merah', label: 'Bawang Merah', icon: <Sparkles size={22} style={{ color: 'var(--earth)' }} /> },
    { id: 'beras-premium', label: 'Beras Premium', icon: <Wheat size={22} style={{ color: 'var(--forest)' }} /> },
    { id: 'tomat-beef', label: 'Tomat Segar', icon: <CircleDot size={22} style={{ color: '#c0392b' }} /> },
    { id: 'kentang-granola', label: 'Kentang Super', icon: <Boxes size={22} style={{ color: 'var(--earth)' }} /> },
  ];

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      const matchCommodity = !filterCommodityId || item.commodityId === filterCommodityId;
      const matchGrade = selectedGrade === 'all' || item.grade === selectedGrade;
      const matchCity = selectedCity === 'all' || item.originCity === selectedCity;
      const matchSearch = !searchKeyword || 
        item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.originCity.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchCommodity && matchGrade && matchCity && matchSearch;
    }).sort((a, b) => {
      if (priceSort === 'lowest') return a.pricePerKg - b.pricePerKg;
      if (priceSort === 'highest') return b.pricePerKg - a.pricePerKg;
      if (priceSort === 'delta') return a.priceDeltaPercent - b.priceDeltaPercent;
      return 0;
    });
  }, [listings, filterCommodityId, selectedGrade, selectedCity, priceSort, searchKeyword]);

  // Open Checkout Modal
  const handleOpenCheckout = (listing) => {
    setActiveModalListing(listing);
    setOrderQuantity(listing.minOrderKg);
    setPaymentSuccessData(null);
  };

  // Process Escrow Payment
  const handleConfirmEscrowPayment = () => {
    if (!activeModalListing) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      const partner = partners.find(p => p.id === activeModalListing.partnerId);
      const subtotal = orderQuantity * activeModalListing.pricePerKg;
      const shippingFee = Math.round(orderQuantity * 1800); // Rp 1.800 per kg 3PL cold-chain
      const platformFee = Math.round(subtotal * 0.025); // 2.5% komisi platform
      const totalAmount = subtotal + shippingFee + platformFee;

      const newOrder = {
        id: `ORD-${Date.now().toString().slice(-8)}`,
        buyer: {
          name: currentRole === 'buyer' ? "Resto & Bistro Surabaya" : "Mitra Pembeli Horeka",
          contact: "Purchasing Manager (0812-9988-7766)",
          deliveryAddress: "Jl. Mayjen Sungkono No. 88, Dukuh Pakis, Surabaya"
        },
        seller: {
          partnerId: activeModalListing.partnerId,
          name: partner ? partner.name : "Koperasi Mitra Tani"
        },
        listingId: activeModalListing.id,
        commodityName: activeModalListing.title,
        quantityKg: Number(orderQuantity),
        pricePerKg: activeModalListing.pricePerKg,
        subtotal,
        shippingFee,
        platformFee,
        totalAmount,
        paymentMethod: selectedPaymentProvider.toUpperCase() + " (Lisensi PJP Escrow)",
        paymentRef: `ESCROW-${Math.floor(10000000 + Math.random() * 90000000)}`,
        escrowStatus: "funds_locked",
        orderStatus: "preparing",
        logistics: {
          provider: "AgriExpress Cold Logistics Jatim",
          trackingNumber: `AGX-SUB-${Math.floor(10000 + Math.random() * 90000)}`,
          pickupAt: "Terjadwal besok pagi (05:30 WIB)",
          estimatedDelivery: `${deliveryDate} 08:30 WIB`,
          status: "Koperasi sedang menyiapkan panen & grading sesuai pesanan."
        },
        claimWindowExpiry: new Date(Date.now() + activeModalListing.claimWindowHours * 3600 * 1000).toISOString(),
        claimWindowHours: activeModalListing.claimWindowHours,
        qcResult: {
          inspected: false,
          notes: "Menunggu penugasan sampling QC lapangan"
        }
      };

      onCreateOrder(newOrder);
      setIsProcessingPayment(false);
      setPaymentSuccessData(newOrder);
    }, 1200);
  };

  return (
    <div className="marketplace-wrapper">
      {/* ── HERO BANNER (Inspired by preview.jpg VIVA style) ── */}
      <div className="marketplace-hero">
        <div style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          <div className="mp-hero-eyebrow">
            <Sparkles size={14} />
            <span>Pasar Hasil Tani Jawa Timur</span>
          </div>
          <h1 className="mp-hero-title">
            Pasokan Segar <span>Langsung dari Petani</span> & Koperasi
          </h1>
          <p className="mp-hero-subtitle">
            Harga langsung dari kelompok tani Jawa Timur. Transaksi aman dengan jaminan mutu dan pembayaran terlindungi.
          </p>

          {/* Quick Search & Category Bar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="input-search"
                placeholder="Cari komoditas, sentra, atau varietas..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px', background: '#ffffff', boxShadow: 'var(--shadow-xs)' }}
                id="marketplace-search-input"
              />
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => {}}
              style={{ padding: '10px 22px' }}
            >
              <span>Cari Pasokan</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Trust Badges Strip (preview.jpg) */}
          <div className="mp-trust-badges">
            <div className="mp-trust-badge-item">
              <ShieldCheck size={15} style={{ color: 'var(--forest)' }} />
              <span>Bayar Aman (Escrow)</span>
            </div>
            <div className="mp-trust-badge-item">
              <Truck size={15} style={{ color: 'var(--forest)' }} />
              <span>Pengiriman Terjadwal</span>
            </div>
            <div className="mp-trust-badge-item">
              <Award size={15} style={{ color: 'var(--forest)' }} />
              <span>Mutu Terjamin SNI</span>
            </div>
            <div className="mp-trust-badge-item">
              <Clock size={15} style={{ color: 'var(--forest)' }} />
              <span>Garansi Mutu</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CIRCULAR CATEGORIES ROW (preview.jpg style) ── */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--forest)', fontFamily: 'var(--font-heading)', margin: 0 }}>
            Kategori Komoditas Pilihan
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-subtext)' }}>
            Menampilkan {filteredListings.length} pasokan aktif
          </span>
        </div>

        <div className="circle-categories-bar">
          {CATEGORY_CIRCLES.map(cat => {
            const isActive = filterCommodityId === cat.id;
            return (
              <button
                key={cat.id || 'all'}
                className={`cat-circle-item ${isActive ? 'active' : ''}`}
                onClick={() => setFilterCommodityId(cat.id)}
              >
                <div className="cat-circle-icon">{cat.icon}</div>
                <span className="cat-circle-label">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3-COLUMN PROMO SPOTLIGHT BANNERS (preview.jpg style) ── */}
      <div className="promo-spotlight-grid">
        <div className="promo-card" onClick={() => setSelectedCity('Malang')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="promo-card-tag">Sentra Malang</div>
            <div className="promo-card-title">Sayur & Hortikultura</div>
            <div className="promo-card-link">
              <span>Lihat Petik Pagi</span>
              <ArrowRight size={13} />
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--forest-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', border: '1px solid var(--sage-border)' }}>
            <Truck size={24} />
          </div>
        </div>

        <div className="promo-card" onClick={() => setSelectedCity('Kediri')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="promo-card-tag">Sentra Kediri</div>
            <div className="promo-card-title">Cabai Merah & Rawit</div>
            <div className="promo-card-link">
              <span>Pasokan Industri & Resto</span>
              <ArrowRight size={13} />
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(192, 57, 43, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b', border: '1px solid rgba(192, 57, 43, 0.2)' }}>
            <Flame size={24} />
          </div>
        </div>

        <div className="promo-card" onClick={() => setSelectedCity('Banyuwangi')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="promo-card-tag">Lumbung Banyuwangi</div>
            <div className="promo-card-title">Beras Premium SNI</div>
            <div className="promo-card-link">
              <span>Sosoh 95% Wangi</span>
              <ArrowRight size={13} />
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--earth-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--earth)', border: '1px solid var(--earth-border)' }}>
            <Wheat size={24} />
          </div>
        </div>
      </div>

      {/* ── STANDAR MUTU PANGAN SNI (Clean Light Card) ── */}
      <div className="card" style={{ marginBottom: '22px', padding: '18px 22px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} style={{ color: 'var(--forest)' }} />
            <strong style={{ fontSize: '14px', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
              Standar Mutu Pangan (SNI)
            </strong>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-subtext)' }}>
            Pengecekan kualitas saat serah terima
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', fontSize: '12px' }}>
          <div style={{ padding: '12px 14px', background: 'var(--forest-dim)', borderRadius: 'var(--radius-md)', border: '1px solid var(--sage-border)' }}>
            <span className="badge badge-grade-A" style={{ marginBottom: '6px', display: 'inline-flex' }}>Grade A (Super)</span>
            <div style={{ color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5, fontFamily: 'var(--font-subtext)' }}>
              {GRADE_CRITERIA.vegetables.A}
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <span className="badge badge-grade-B" style={{ marginBottom: '6px', display: 'inline-flex' }}>Grade B (Resto/Pasar)</span>
            <div style={{ color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5, fontFamily: 'var(--font-subtext)' }}>
              {GRADE_CRITERIA.vegetables.B}
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--earth-dim)', borderRadius: 'var(--radius-md)', border: '1px solid var(--earth-border)' }}>
            <span className="badge badge-grade-C" style={{ marginBottom: '6px', display: 'inline-flex' }}>Grade C (Olahan)</span>
            <div style={{ color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5, fontFamily: 'var(--font-subtext)' }}>
              {GRADE_CRITERIA.vegetables.C}
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER TOOLBAR ── */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: '24px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest)', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-subtext)' }}>
              <Filter size={14} /> Filter:
            </span>

            {/* Filter Commodity */}
            <select 
              className="input-search"
              value={filterCommodityId}
              onChange={(e) => setFilterCommodityId(e.target.value)}
              id="filter-commodity-select"
            >
              <option value="">Semua Komoditas</option>
              {commodities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Filter Grade */}
            <select 
              className="input-search"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              id="filter-grade-select"
            >
              <option value="all">Semua Grade</option>
              <option value="A">Grade A (Super)</option>
              <option value="B">Grade B (Resto)</option>
              <option value="C">Grade C (Olahan)</option>
            </select>

            {/* Filter Asal Kota */}
            <select 
              className="input-search"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              id="filter-city-select"
            >
              <option value="all">Semua Wilayah</option>
              <option value="Malang">Malang</option>
              <option value="Kediri">Kediri</option>
              <option value="Probolinggo">Probolinggo</option>
              <option value="Banyuwangi">Banyuwangi</option>
            </select>

            {(selectedGrade !== 'all' || selectedCity !== 'all' || filterCommodityId || searchKeyword) && (
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSelectedGrade('all');
                  setSelectedCity('all');
                  setFilterCommodityId('');
                  setSearchKeyword('');
                }}
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Sort By Price / Delta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-subtext)' }}>Urutkan:</span>
            <select 
              className="input-search"
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
              id="sort-price-select"
            >
              <option value="default">Paling Populer & Relevan</option>
              <option value="lowest">Harga Terendah /kg</option>
              <option value="delta">Diskon Terbesar vs PIHPS</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── PRODUCT GRID (preview.jpg style) ── */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest)', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
          Katalog Pasokan Pilihan ({filteredListings.length})
        </h2>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-subtext)', marginBottom: '18px' }}>
          Diverifikasi dengan harga acuan PIHPS Bank Indonesia dan sistem rekening penampungan terlisensi
        </div>
      </div>

      <div className="products-grid">
        {filteredListings.map(item => {
          const partner = partners.find(p => p.id === item.partnerId);
          const isBetterThanMarket = item.priceDeltaPercent < 0;

          return (
            <div key={item.id} className="card product-card">
              <div className="product-img-box">
                <img src={item.photos[0]} alt={item.title} className="product-img" />
                <div className="product-badges-overlay">
                  {/* Delta indicator vs PIHPS Reference Price */}
                  <span className={`delta-pill ${isBetterThanMarket ? '' : 'negative'}`}>
                    {item.priceDeltaPercent > 0 ? `+${item.priceDeltaPercent}%` : `${item.priceDeltaPercent}%`} vs PIHPS
                  </span>

                  <span className={`badge badge-grade badge-grade-${item.grade}`}>
                    GRADE {item.grade}
                  </span>
                </div>
              </div>

              <div className="product-body">
                {/* Partner Header */}
                <div className="partner-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircle2 size={13} style={{ color: 'var(--forest)' }} />
                    <span className="partner-name">{partner?.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                    <MapPin size={11} />
                    <span>{item.originCity}</span>
                  </div>
                </div>

                <h3 className="product-title" style={{ minHeight: '44px' }}>{item.title}</h3>

                {/* Rating display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-subtext)' }}>
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={11} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{partner?.reputationScore || '4.9'}</span>
                  <span>({partner?.totalCompletedOrders || 120} pesanan sukses)</span>
                </div>

                {/* Price Display with Delta */}
                <div className="product-pricing">
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-subtext)' }}>Harga B2B Marketplace:</div>
                    <div className="num-mono" style={{ fontSize: '19px', fontWeight: 800, color: 'var(--forest)' }}>
                      Rp {item.pricePerKg.toLocaleString('id-ID')}
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>/kg</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-subtext)' }}>Acuan PIHPS:</div>
                    <div className="num-mono" style={{ fontSize: '12px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                      Rp {item.pihpsReferencePrice.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* Clean Specs Pill (preview.jpg minimal style) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-secondary)', background: 'var(--bg-section)', padding: '7px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span>Min. {item.minOrderKg} kg</span>
                  <span>•</span>
                  <span>Stok: {item.availableStockKg.toLocaleString('id-ID')} kg</span>
                  <span>•</span>
                  <span>Klaim {item.claimWindowHours}j</span>
                </div>

                {/* Order Action Button */}
                <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                  <button 
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={() => handleOpenCheckout(item)}
                    id={`btn-order-${item.id}`}
                  >
                    <CreditCard size={15} />
                    <span>Pesan B2B (Escrow Aman)</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BOTTOM TRUST STRIP (preview.jpg style) ── */}
      <div className="bottom-trust-strip">
        <div className="trust-feature-item">
          <div className="trust-feature-icon">
            <Truck size={20} />
          </div>
          <div>
            <div className="trust-feature-title">Armada Dingin 3PL</div>
            <div className="trust-feature-desc">Pengiriman terjadwal armada cold-chain se-Jatim</div>
          </div>
        </div>

        <div className="trust-feature-item">
          <div className="trust-feature-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="trust-feature-title">Rekening Escrow BI</div>
            <div className="trust-feature-desc">Dana tertahan aman hingga pesanan lolos inspeksi</div>
          </div>
        </div>

        <div className="trust-feature-item">
          <div className="trust-feature-icon">
            <RefreshCw size={20} />
          </div>
          <div>
            <div className="trust-feature-title">Jendela Klaim 6–48 Jam</div>
            <div className="trust-feature-desc">Garansi retur dan resolusi sengketa objektif</div>
          </div>
        </div>

        <div className="trust-feature-item">
          <div className="trust-feature-icon">
            <PackageCheck size={20} />
          </div>
          <div>
            <div className="trust-feature-title">Standar Mutu SNI</div>
            <div className="trust-feature-desc">Pemeriksaan sampling QC lapangan terakreditasi</div>
          </div>
        </div>
      </div>

      {/* ── CHECKOUT / ESCROW PAYMENT MODAL (Clean Light Theme) ── */}
      {activeModalListing && (
        <div className="modal-overlay" onClick={() => !isProcessingPayment && setActiveModalListing(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} style={{ color: 'var(--forest)' }} />
                <div>
                  <h3 className="modal-title" style={{ fontSize: '17px', margin: 0 }}>Pemesanan B2B & Rekening Escrow</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-subtext)' }}>
                    {activeModalListing.title} (Grade {activeModalListing.grade})
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-outline btn-sm" 
                onClick={() => setActiveModalListing(null)}
                disabled={isProcessingPayment}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {paymentSuccessData ? (
                <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--forest-dim)', border: '2px solid var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle2 size={34} style={{ color: 'var(--forest)' }} />
                  </div>
                  <h4 style={{ fontSize: '19px', fontWeight: 800, marginBottom: '6px', color: 'var(--forest)', fontFamily: 'var(--font-heading)' }}>
                    Pembayaran Escrow Berhasil Dikunci!
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5, fontFamily: 'var(--font-subtext)' }}>
                    Dana Anda senilai <strong>Rp {paymentSuccessData.totalAmount.toLocaleString('id-ID')}</strong> telah aman tertahan di rekening escrow berlisensi PJP. Koperasi mitra telah menerima notifikasi persiapan pesanan.
                  </p>

                  <div style={{ background: 'var(--bg-section)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'left', marginBottom: '20px', fontSize: '12px' }}>
                    <div style={{ marginBottom: '6px' }}><strong>No. Pesanan:</strong> <span className="num-mono">{paymentSuccessData.id}</span></div>
                    <div style={{ marginBottom: '6px' }}><strong>Kode Referensi Escrow:</strong> <span className="num-mono">{paymentSuccessData.paymentRef}</span></div>
                    <div style={{ marginBottom: '6px' }}><strong>Status Dana:</strong> <span style={{ color: 'var(--forest)', fontWeight: 800 }}>DANA TERKUNCI (FUNDS LOCKED)</span></div>
                    <div><strong>Batas Waktu Inspeksi Mutu:</strong> {paymentSuccessData.claimWindowHours} Jam setelah pengiriman tiba</div>
                  </div>

                  <button 
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setActiveModalListing(null);
                      onViewOrders();
                    }}
                  >
                    <span>Buka Pelacakan Pesanan & Status Escrow</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                <>
                  {/* Form Quantity & Schedule */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)', fontFamily: 'var(--font-subtext)' }}>
                      Jumlah Kuantitas Pesanan (Min: {activeModalListing.minOrderKg} kg):
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="number"
                        min={activeModalListing.minOrderKg}
                        step={10}
                        className="input-search"
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Math.max(activeModalListing.minOrderKg, Number(e.target.value)))}
                        style={{ flex: 1, fontSize: '16px', fontWeight: 700 }}
                        id="input-order-quantity"
                      />
                      <span className="badge badge-flat" style={{ fontSize: '13px', padding: '9px 14px' }}>Kilogram (kg)</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)', fontFamily: 'var(--font-subtext)' }}>
                      Jadwal Pengiriman Terjadwal ke Surabaya:
                    </label>
                    <input 
                      type="date"
                      className="input-search"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      style={{ width: '100%' }}
                      id="input-delivery-date"
                    />
                  </div>

                  {/* Payment Gateway Provider Selector (PJP Escrow) */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-main)', fontFamily: 'var(--font-subtext)' }}>
                      Metode Rekening Penampungan Berlisensi (PJP Kategori 1/3):
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      <button 
                        type="button"
                        className={`btn ${selectedPaymentProvider === 'bca_va' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setSelectedPaymentProvider('bca_va')}
                        style={{ fontSize: '12px', padding: '10px' }}
                      >
                        BCA VA (Auto-Escrow)
                      </button>
                      <button 
                        type="button"
                        className={`btn ${selectedPaymentProvider === 'mandiri_va' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setSelectedPaymentProvider('mandiri_va')}
                        style={{ fontSize: '12px', padding: '10px' }}
                      >
                        Mandiri Virtual Account
                      </button>
                      <button 
                        type="button"
                        className={`btn ${selectedPaymentProvider === 'qris' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setSelectedPaymentProvider('qris')}
                        style={{ fontSize: '12px', padding: '10px' }}
                      >
                        QRIS Dinamis (Instant)
                      </button>
                      <button 
                        type="button"
                        className={`btn ${selectedPaymentProvider === 'bri_va' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setSelectedPaymentProvider('bri_va')}
                        style={{ fontSize: '12px', padding: '10px' }}
                      >
                        BRI Virtual Account
                      </button>
                    </div>
                  </div>

                  {/* Cost Summary Breakdown */}
                  <div style={{ background: 'var(--bg-section)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Subtotal ({orderQuantity} kg @ Rp {activeModalListing.pricePerKg.toLocaleString('id-ID')}):</span>
                      <span className="num-mono" style={{ fontWeight: 700 }}>Rp {(orderQuantity * activeModalListing.pricePerKg).toLocaleString('id-ID')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Ongkir 3PL Cold-Chain ({activeModalListing.originCity} ke Surabaya):</span>
                      <span className="num-mono" style={{ fontWeight: 700 }}>Rp {(orderQuantity * 1800).toLocaleString('id-ID')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Biaya Jaminan Escrow Platform (2.5%):</span>
                      <span className="num-mono" style={{ fontWeight: 700 }}>Rp {Math.round(orderQuantity * activeModalListing.pricePerKg * 0.025).toLocaleString('id-ID')}</span>
                    </div>
                    <div style={{ height: '1.5px', background: 'var(--border-subtle)', margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800 }}>
                      <span style={{ color: 'var(--forest)' }}>Total Pembayaran Escrow:</span>
                      <span className="num-mono" style={{ color: 'var(--forest)' }}>
                        Rp {(orderQuantity * activeModalListing.pricePerKg + orderQuantity * 1800 + Math.round(orderQuantity * activeModalListing.pricePerKg * 0.025)).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Escrow Disclaimer Notice */}
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', background: 'var(--earth-dim)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--earth-border)', lineHeight: 1.5 }}>
                    <ShieldCheck size={16} style={{ color: 'var(--earth)', flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      Dana pembeli disimpan dalam rekening penampungan berlisensi PJP hingga pembeli menerima barang dan batas jendela inspeksi ({activeModalListing.claimWindowHours} jam) selesai tanpa sengketa.
                    </span>
                  </div>
                </>
              )}
            </div>

            {!paymentSuccessData && (
              <div className="modal-footer">
                <button 
                  className="btn btn-outline" 
                  onClick={() => setActiveModalListing(null)}
                  disabled={isProcessingPayment}
                >
                  Batal
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleConfirmEscrowPayment}
                  disabled={isProcessingPayment}
                  id="btn-confirm-escrow-payment"
                >
                  {isProcessingPayment ? "Memproses Kunci Escrow..." : "Konfirmasi & Kunci Dana Escrow"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
