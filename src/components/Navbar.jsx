import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  Bell, 
  UserCheck, 
  Layers
} from 'lucide-react';

export const Navbar = ({ 
  currentTab, 
  setCurrentTab, 
  currentRole, 
  setCurrentRole, 
  orderCount, 
  watchlistCount, 
  onOpenAlertModal,
  onOpenMethodology
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Harga', icon: TrendingUp },
    { id: 'marketplace', label: 'Marketplace B2B', icon: ShoppingBag },
    { id: 'orders', label: 'Pesanan & Escrow', icon: Package, badge: orderCount },
    { id: 'qc', label: 'Inspeksi QC', icon: CheckCircle2 },
    { id: 'admin', label: 'Admin & Audit', icon: ShieldCheck },
    { id: 'methodology', label: 'Metodologi Data', icon: BookOpen },
  ];

  return (
    <>
      {/* ── 1. DESKTOP SIDEBAR (Tampak di Layar Desktop >= 1024px) ── */}
      <aside className="desktop-sidebar" aria-label="Menu navigasi desktop">
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Layers size={24} />
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-title">
              <span>Agri-X</span>
              <span className="brand-tag">PIHPS v1.0</span>
            </div>
            <div className="sidebar-brand-sub">
              Pusat Data Harga & B2B Jawa Timur
            </div>
          </div>
        </div>

        {/* Vertical Menu Navigation — All 6 Items Clear & Visible */}
        <div className="sidebar-nav-section">
          <div className="sidebar-nav-label">MENU UTAMA</div>
          <nav className="sidebar-menu">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setCurrentTab(item.id)}
                >
                  <div className="sidebar-btn-icon">
                    <Icon size={18} />
                  </div>
                  <span className="sidebar-btn-label">{item.label}</span>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="sidebar-badge">{item.badge}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer: User Role & Alerts */}
        <div className="sidebar-footer">
          <div className="sidebar-section-divider" />

          <div className="sidebar-role-box">
            <div className="sidebar-role-label">
              <UserCheck size={14} style={{ color: 'var(--sage-light)' }} />
              <span>Peran Pengguna:</span>
            </div>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="sidebar-role-select"
              id="sidebar-user-role"
              title="Ganti Peran Pengguna untuk Menguji Sistem"
            >
              <option value="public">Publik (Katalog)</option>
              <option value="buyer">Pembeli (Resto)</option>
              <option value="seller">Penjual (Petani)</option>
              <option value="qc">Petugas QC Lapangan</option>
              <option value="admin">Admin Sistem</option>
            </select>
          </div>

          <button
            className="sidebar-alert-btn"
            onClick={onOpenAlertModal}
            id="sidebar-btn-alert"
          >
            <Bell size={15} />
            <span>Notifikasi Ambang Harga</span>
          </button>

          <div className="sidebar-credits">
            PIHPS BI & SISKAPERBAPO Jatim
          </div>
        </div>
      </aside>

      {/* ── 2. MOBILE TOP NAVBAR (Tampak di Layar < 1024px) ── */}
      <header className="navbar mobile-navbar">
        <div className="navbar-brand">
          <div className="brand-icon">
            <Layers size={22} />
          </div>
          <div className="brand-info">
            <h1>
              AgriX Jatim
              <span className="brand-tag">PIHPS</span>
            </h1>
          </div>
        </div>

        <div className="navbar-actions">
          <button 
            className="btn btn-outline-white btn-sm" 
            onClick={onOpenAlertModal} 
            title="Atur Alert Ambang Batas Harga"
            id="btn-price-alert"
          >
            <Bell size={14} />
            <span>Alert</span>
          </button>

          <div className="role-badge-box">
            <UserCheck size={14} style={{ color: 'var(--emerald-primary)' }} />
            <select 
              value={currentRole} 
              onChange={(e) => setCurrentRole(e.target.value)}
              id="select-user-role"
              title="Ganti Peran Pengguna untuk Menguji Sistem"
            >
              <option value="public">Publik</option>
              <option value="buyer">Pembeli (Resto)</option>
              <option value="seller">Penjual (Petani)</option>
              <option value="qc">Petugas QC</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
