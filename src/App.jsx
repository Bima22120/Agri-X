import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, ShoppingBag, Package, CheckCircle2, ShieldCheck, BookOpen, Bell } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { PriceTicker } from './components/PriceTicker';
import { PriceDashboard } from './components/PriceDashboard';
import { Marketplace } from './components/Marketplace';
import { OrdersEscrow } from './components/OrdersEscrow';
import { QCModule } from './components/QCModule';
import { AdminPanel } from './components/AdminPanel';
import { MethodologyModal } from './components/MethodologyModal';
import { PriceAlertModal } from './components/PriceAlertModal';
import { 
  COMMODITIES, 
  MARKETPLACE_LISTINGS, 
  VERIFIED_PARTNERS, 
  INITIAL_ORDERS,
  PROMOTIONAL_BANNERS
} from './data/mockData';
import {
  checkApiHealth,
  fetchLatestPrices,
  fetchPriceHistory,
  fetchPriceSummary,
  fetchTickerPrices,
  mergeLivePricesWithCommodities,
  apiHistoryToChartSeries
} from './services/apiService';

export function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('buyer');
  const [commodities, setCommodities] = useState(COMMODITIES);
  const [selectedCommodityId, setSelectedCommodityId] = useState('cabai-rawit-merah');
  const [watchlist, setWatchlist] = useState(['cabai-rawit-merah', 'beras-premium', 'bawang-merah']);
  const [listings, setListings] = useState(MARKETPLACE_LISTINGS);
  const [partners, setPartners] = useState(VERIFIED_PARTNERS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [filterCommodityId, setFilterCommodityId] = useState('');

  // API status: 'checking' | 'online' | 'offline'
  const [apiStatus, setApiStatus] = useState('checking');
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Modals state
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);

  // Load live data from API on mount and every 5 minutes
  const loadLiveData = useCallback(async () => {
    try {
      await checkApiHealth();
      setApiStatus('online');

      const [latestRes, summaryRes] = await Promise.all([
        fetchLatestPrices({ limit: 200 }),
        fetchPriceSummary().catch(() => null)
      ]);

      if (latestRes?.prices?.length > 0) {
        const merged = mergeLivePricesWithCommodities(COMMODITIES, latestRes.prices, summaryRes);
        setCommodities(merged);
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      }
    } catch (err) {
      setApiStatus('offline');
      // Keep using mock data - no action needed
    }
  }, []);

  useEffect(() => {
    loadLiveData();
    const interval = setInterval(loadLiveData, 5 * 60 * 1000); // every 5 min
    return () => clearInterval(interval);
  }, [loadLiveData]);

  // Watchlist toggle
  const toggleWatchlist = (id) => {
    setWatchlist(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Create Order from Marketplace
  const handleCreateOrder = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  // Release Escrow Funds to Seller (minus 2.5% platform commission)
  const handleReleaseFunds = (orderId) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          escrowStatus: 'released',
          orderStatus: 'completed'
        };
      }
      return o;
    }));
  };

  // File Dispute
  const handleFileDispute = (orderId, disputeData) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          escrowStatus: 'disputed',
          orderStatus: 'disputed',
          dispute: disputeData
        };
      }
      return o;
    }));
  };

  // Resolve Dispute from Admin Panel
  const handleResolveDispute = (orderId, action) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        if (action === 'refund_buyer') {
          return {
            ...o,
            escrowStatus: 'refunded',
            orderStatus: 'refunded'
          };
        } else {
          return {
            ...o,
            escrowStatus: 'released',
            orderStatus: 'completed'
          };
        }
      }
      return o;
    }));
  };

  // Update QC inspection results
  const handleUpdateQC = (orderId, qcResult) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          qcResult
        };
      }
      return o;
    }));
  };

  // Navigate to Marketplace for a specific commodity
  const handleNavigateToMarketplace = (commodityId) => {
    setFilterCommodityId(commodityId);
    setCurrentTab('marketplace');
  };

  return (
    <div className="app-wrapper">
      <div className="ambient-glow" />

      {/* API Connection Status Badge */}
      <div className={`api-status-badge api-status--${apiStatus}`}>
        <span className="api-status-dot" />
        {apiStatus === 'online' ? (
          <span>Live Data{lastSyncTime ? ` · Sync ${lastSyncTime}` : ''}</span>
        ) : apiStatus === 'offline' ? (
          <span>Data Simulasi · <button className="api-retry-btn" onClick={loadLiveData}>Coba Lagi</button></span>
        ) : (
          <span>Menyambung ke server...</span>
        )}
      </div>

      {/* 1. Navigation Sidebar (Desktop) / Header (Mobile) */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        orderCount={orders.length}
        watchlistCount={watchlist.length}
        onOpenAlertModal={() => setIsAlertModalOpen(true)}
        onOpenMethodology={() => setIsMethodologyModalOpen(true)}
      />

      {/* 2. Main Content Area (To the right of sidebar on desktop) */}
      <div className="app-main-content">
        {/* Running Top Ticker Strip (Trading View Style) */}
        <PriceTicker 
          commodities={commodities}
          selectedId={selectedCommodityId}
          onSelectCommodity={(id) => {
            setSelectedCommodityId(id);
            setCurrentTab('dashboard');
          }}
        />

        {/* Main Content Container */}
        <main className="main-container">
          {currentTab === 'dashboard' && (
            <PriceDashboard 
              commodities={commodities}
              selectedCommodityId={selectedCommodityId}
              setSelectedCommodityId={setSelectedCommodityId}
              watchlist={watchlist}
              toggleWatchlist={toggleWatchlist}
              onNavigateToMarketplace={handleNavigateToMarketplace}
              onOpenMethodology={() => setIsMethodologyModalOpen(true)}
              onOpenAlertModal={() => setIsAlertModalOpen(true)}
            />
          )}

          {currentTab === 'marketplace' && (
            <Marketplace 
              listings={listings}
              commodities={commodities}
              partners={partners}
              currentRole={currentRole}
              onCreateOrder={handleCreateOrder}
              onViewOrders={() => setCurrentTab('orders')}
              filterCommodityId={filterCommodityId}
              setFilterCommodityId={setFilterCommodityId}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersEscrow 
              orders={orders}
              onReleaseFunds={handleReleaseFunds}
              onFileDispute={handleFileDispute}
              currentRole={currentRole}
            />
          )}

          {currentTab === 'qc' && (
            <QCModule 
              orders={orders}
              onUpdateQC={handleUpdateQC}
              partners={partners}
            />
          )}

          {currentTab === 'admin' && (
            <AdminPanel 
              orders={orders}
              partners={partners}
              onResolveDispute={handleResolveDispute}
              onReleaseFunds={handleReleaseFunds}
            />
          )}

          {currentTab === 'methodology' && (
            <MethodologyModal 
              isOpen={true}
              onClose={() => setCurrentTab('dashboard')}
              isStandalonePage={true}
            />
          )}
        </main>
      </div>

      {/* 4. Global Modals */}
      <MethodologyModal 
        isOpen={isMethodologyModalOpen}
        onClose={() => setIsMethodologyModalOpen(false)}
      />

      <PriceAlertModal 
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        commodities={commodities}
      />

      {/* 5. Mobile Bottom Navigation (shown only on phones via CSS) */}
      <nav className="mobile-bottom-nav" aria-label="Navigasi mobile">
        <div className="mobile-bottom-nav-inner">
          <button
            className={`mob-nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('dashboard')}
          >
            <TrendingUp size={20} />
            <span>Harga</span>
          </button>
          <button
            className={`mob-nav-btn ${currentTab === 'marketplace' ? 'active' : ''}`}
            onClick={() => setCurrentTab('marketplace')}
          >
            <ShoppingBag size={20} />
            <span>Pasar</span>
          </button>
          <button
            className={`mob-nav-btn ${currentTab === 'orders' ? 'active' : ''}`}
            onClick={() => setCurrentTab('orders')}
          >
            <Package size={20} />
            {orders.length > 0 && <span className="mob-badge">{orders.length}</span>}
            <span>Pesanan</span>
          </button>
          <button
            className={`mob-nav-btn ${currentTab === 'qc' ? 'active' : ''}`}
            onClick={() => setCurrentTab('qc')}
          >
            <CheckCircle2 size={20} />
            <span>QC</span>
          </button>
          <button
            className={`mob-nav-btn ${currentTab === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentTab('admin')}
          >
            <ShieldCheck size={20} />
            <span>Admin</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
