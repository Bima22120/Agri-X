import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  FileText, 
  Megaphone, 
  CheckCircle, 
  Lock, 
  RotateCcw,
  Sparkles,
  Layers,
  Database,
  RefreshCw,
  Server
} from 'lucide-react';
import { PROMOTIONAL_BANNERS } from '../data/mockData';
import { fetchPipelineStatus } from '../services/apiService';

export const AdminPanel = ({ 
  orders, 
  partners, 
  onResolveDispute,
  onReleaseFunds 
}) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState('escrow_monitor'); // 'escrow_monitor', 'partners', 'ads', 'audit', 'pipeline'
  const [pipelineRuns, setPipelineRuns] = useState([]);
  const [loadingRuns, setLoadingRuns] = useState(false);

  const loadPipelineRuns = () => {
    setLoadingRuns(true);
    fetchPipelineStatus(25)
      .then(res => {
        if (res?.runs) setPipelineRuns(res.runs);
        setLoadingRuns(false);
      })
      .catch(() => setLoadingRuns(false));
  };

  useEffect(() => {
    loadPipelineRuns();
  }, []);

  // Metric computations
  const totalGMV = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const lockedEscrow = orders.filter(o => o.escrowStatus === 'funds_locked').reduce((acc, o) => acc + o.totalAmount, 0);
  const totalCommission = orders.reduce((acc, o) => acc + o.platformFee, 0);

  return (
    <div className="admin-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} style={{ color: 'var(--amber-primary)' }} />
            Pusat Pengawasan Sistem & Rekening Escrow Terpusat
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Audit log transaksi, mediasi sengketa mutu, dan monitoring kepatuhan lisensi PJP Bank Indonesia.
          </div>
        </div>

        <div className="badge badge-amber" style={{ padding: '8px 12px', fontSize: '12px' }}>
          <Lock size={14} />
          <span>Akses Terbatas: Administrator Resmi</span>
        </div>
      </div>

      {/* Financial & Escrow KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total GMV Transaksi B2B</div>
          <div className="num-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
            Rp {totalGMV.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--emerald-primary)', marginTop: '4px' }}>
            Kumulatif Pilot Jawa Timur
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderColor: 'var(--amber-border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Dana Tertahan di Escrow PJP</div>
          <div className="num-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--amber-primary)' }}>
            Rp {lockedEscrow.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '10px', color: '#6E4E3A', marginTop: '4px' }}>
            Menunggu Konfirmasi / Jendela Klaim
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Pendapatan Komisi Platform (2.5%)</div>
          <div className="num-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--emerald-primary)' }}>
            Rp {totalCommission.toLocaleString('id-ID')}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Menopang Biaya Pemeliharaan Server
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Mitra Koperasi Terverifikasi</div>
          <div className="num-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
            {partners.length} Mitra
          </div>
          <div style={{ fontSize: '10px', color: 'var(--emerald-primary)', marginTop: '4px' }}>
            Malang, Kediri, Banyuwangi, Probolinggo
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-section)', padding: '8px 12px', gap: '8px', overflowX: 'auto', flexWrap: 'wrap' }}>
          <button 
            className={`btn btn-sm ${activeAdminSubTab === 'escrow_monitor' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveAdminSubTab('escrow_monitor')}
          >
            Pengawasan Escrow & Sengketa ({orders.length})
          </button>
          <button 
            className={`btn btn-sm ${activeAdminSubTab === 'partners' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveAdminSubTab('partners')}
          >
            Verifikasi Koperasi ({partners.length})
          </button>
          <button 
            className={`btn btn-sm ${activeAdminSubTab === 'ads' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveAdminSubTab('ads')}
          >
            Manajemen Iklan & Sponsor
          </button>
          <button 
            className={`btn btn-sm ${activeAdminSubTab === 'audit' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveAdminSubTab('audit')}
          >
            Audit Log Sistem
          </button>
          <button 
            id="tab-pipeline-ingestion"
            className={`btn btn-sm ${activeAdminSubTab === 'pipeline' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setActiveAdminSubTab('pipeline'); loadPipelineRuns(); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <Database size={13} />
            <span>Pipeline Ingestion {pipelineRuns.length > 0 ? `(${pipelineRuns.length})` : ''}</span>
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* TAB 1: Escrow & Dispute Resolution */}
          {activeAdminSubTab === 'escrow_monitor' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
                Daftar Mutasi Transaksi Escrow & Penanganan Komplain
              </h3>
              <div className="data-table-wrapper">
                <table className="trading-table">
                  <thead>
                    <tr>
                      <th>ID Pesanan</th>
                      <th>Pembeli & Pemasok</th>
                      <th>Komoditas</th>
                      <th style={{ textAlign: 'right' }}>Nilai Escrow</th>
                      <th>Status Dana</th>
                      <th style={{ textAlign: 'center' }}>Aksi Mediasi Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const isDisputed = order.escrowStatus === 'disputed';
                      const isLocked = order.escrowStatus === 'funds_locked';

                      return (
                        <tr key={order.id}>
                          <td className="num-mono" style={{ fontWeight: 700 }}>{order.id}</td>
                          <td>
                            <div><strong>{order.buyer.name}</strong></div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ke: {order.seller.name}</div>
                          </td>
                          <td>{order.commodityName} ({order.quantityKg} kg)</td>
                          <td style={{ textAlign: 'right' }} className="num-mono">
                            Rp {order.totalAmount.toLocaleString('id-ID')}
                          </td>
                          <td>
                            <span className={`badge ${isDisputed ? 'badge-down' : isLocked ? 'badge-amber' : 'badge-up'}`}>
                              {order.escrowStatus.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {isDisputed ? (
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button 
                                  className="btn btn-outline btn-sm"
                                  style={{ color: 'var(--crimson-primary)', borderColor: 'var(--crimson-border)' }}
                                  onClick={() => onResolveDispute(order.id, 'refund_buyer')}
                                  title="Kembalikan dana escrow ke pembeli"
                                >
                                  <RotateCcw size={12} /> Refund Pembeli
                                </button>
                                <button 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => onResolveDispute(order.id, 'release_seller')}
                                  title="Sahkan transaksi dan cairkan ke penjual"
                                >
                                  Cairkan ke Penjual
                                </button>
                              </div>
                            ) : isLocked ? (
                              <button 
                                className="btn btn-outline btn-sm"
                                onClick={() => onReleaseFunds(order.id)}
                              >
                                Paksa Cairkan Dana
                              </button>
                            ) : (
                              <span style={{ fontSize: '11px', color: 'var(--emerald-primary)', fontWeight: 700 }}>Selesai</span>
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

          {/* TAB 2: Verified Partners */}
          {activeAdminSubTab === 'partners' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
                Koperasi & Kelompok Tani Mitra Agrikultur Jawa Timur
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {partners.map(p => (
                  <div key={p.id} style={{ background: 'var(--bg-section)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="badge badge-up">{p.badge}</span>
                      <span style={{ fontSize: '12px', color: 'var(--earth)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Skor: {p.reputationScore} / 5.0
                      </span>
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{p.name}</h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{p.location}</div>
                    <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>Kapasitas Pasokan: <strong>{p.capacityPerWeek}</strong></div>
                      <div>Tingkat Lolos QC: <strong style={{ color: 'var(--emerald-primary)' }}>{p.qcPassRate}</strong></div>
                      <div>Pesanan Sukses: <strong>{p.totalCompletedOrders} transaksi</strong></div>
                      <div>Kontak Resmi: {p.contactPerson} ({p.phone})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Advertising & Commercial Sponsors */}
          {activeAdminSubTab === 'ads' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Slot Iklan Komersial Terlabel</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Sesuai asas transparansi: Iklan wajib berlabel tegas dan tidak boleh memanipulasi angka harga referensi PIHPS.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {PROMOTIONAL_BANNERS.map(ad => (
                  <div key={ad.id} className="ad-banner">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="ad-label-pill">{ad.label}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Penempatan: {ad.placement.toUpperCase()}</span>
                      </div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{ad.title}</h4>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Sponsor: <strong>{ad.sponsor}</strong> · {ad.disclaimer}
                      </div>
                    </div>
                    <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--amber-border)' }}>
                      {ad.linkText}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Audit Logs */}
          {activeAdminSubTab === 'audit' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
                Log Audit Sistem Tak Terhapus (Append-Only Log)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ padding: '10px 14px', background: 'var(--bg-section)', borderRadius: '6px', borderLeft: '4px solid var(--forest)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  <span className="num-mono" style={{ color: 'var(--text-secondary)' }}>[2026-10-11 07:30:15 WIB]</span> <strong>[INGESTION]</strong> Berhasil memvalidasi feed harian PIHPS: 8 Komoditas, 38 Wilayah, 0 anomali. Hash verifikasi: #99a8b12.
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--bg-section)', borderRadius: '6px', borderLeft: '4px solid var(--earth)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  <span className="num-mono" style={{ color: 'var(--text-secondary)' }}>[2026-10-11 08:14:02 WIB]</span> <strong>[ESCROW_LOCK]</strong> Dana order ORD-20261011-0089 sebesar Rp 3.481.000 sukses dikunci di VA Xendit/Midtrans.
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--bg-section)', borderRadius: '6px', borderLeft: '4px solid var(--forest)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  <span className="num-mono" style={{ color: 'var(--text-secondary)' }}>[2026-10-10 14:20:10 WIB]</span> <strong>[FUND_RELEASE]</strong> Dana order ORD-20261010-0072 sukses dicairkan ke Koperasi Sri Rejeki (Rp 7.410.000). Komisi dipotong: Rp 190.000.
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--bg-section)', borderRadius: '6px', borderLeft: '4px solid var(--forest)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  <span className="num-mono" style={{ color: 'var(--text-secondary)' }}>[2026-10-10 09:00:00 WIB]</span> <strong>[SECURITY]</strong> Pemeriksaan sesi otentikasi role-based access control (RBAC): OK. TLS v1.3 aktif.
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Live Pipeline Ingestion */}
          {activeAdminSubTab === 'pipeline' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Server size={16} style={{ color: 'var(--emerald-primary)' }} />
                    Riwayat Pipeline Ingestion & Normalisasi DB
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Pipa otomatis PIHPS Bank Indonesia & SISKAPERBAPO Jawa Timur dengan verifikasi kualitas V1-V7.
                  </div>
                </div>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={loadPipelineRuns}
                  disabled={loadingRuns}
                >
                  <RefreshCw size={13} className={loadingRuns ? 'spin-slow' : ''} />
                  <span>Segarkan Status</span>
                </button>
              </div>

              {/* Pipeline summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '14px', background: 'var(--bg-section)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Run Ingestion</div>
                  <div className="num-mono" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {pipelineRuns.length} Runs
                  </div>
                </div>
                <div style={{ padding: '14px', background: 'var(--bg-section)', borderRadius: '8px', border: '1px solid var(--emerald-border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tingkat Sukses</div>
                  <div className="num-mono" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--emerald-primary)' }}>
                    {pipelineRuns.length > 0 ? `${Math.round((pipelineRuns.filter(r => r.status === 'SUCCESS').length / pipelineRuns.length) * 100)}%` : '100%'}
                  </div>
                </div>
                <div style={{ padding: '14px', background: 'var(--bg-section)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Sumber Terhubung</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                    PIHPS + SISKAPERBAPO
                  </div>
                </div>
                <div style={{ padding: '14px', background: 'var(--bg-section)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Status Cron Scheduler</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--emerald-primary)' }}>
                    Harian 09:00 WIB
                  </div>
                </div>
              </div>

              {/* Runs Table */}
              <div className="data-table-wrapper">
                <table className="trading-table">
                  <thead>
                    <tr>
                      <th>ID Run Ingestion</th>
                      <th>Sumber Data</th>
                      <th>Waktu Eksekusi</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Normalized</th>
                      <th style={{ textAlign: 'right' }}>Quarantined</th>
                      <th style={{ textAlign: 'right' }}>Flagged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pipelineRuns.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                          {loadingRuns ? 'Memuat log pipeline...' : 'Belum ada log pipeline tersimpan.'}
                        </td>
                      </tr>
                    ) : (
                      pipelineRuns.map(run => {
                        const isSuccess = run.status === 'SUCCESS';
                        const isPihps = run.source_id === 'pihps';
                        return (
                          <tr key={run.run_id}>
                            <td>
                              <span className="num-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {run.run_id}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${isPihps ? 'badge-up' : 'badge-amber'}`} style={{ fontSize: '10px' }}>
                                {isPihps ? 'PIHPS Grosir' : 'SISKAPERBAPO Retail'}
                              </span>
                            </td>
                            <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {run.started_at ? new Date(run.started_at).toLocaleString('id-ID') : '-'}
                            </td>
                            <td>
                              <span className={`badge ${isSuccess ? 'badge-up' : 'badge-down'}`}>
                                {isSuccess ? 'Sukses' : 'Gagal'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>
                              <span className="num-mono" style={{ color: 'var(--emerald-primary)' }}>
                                {run.counts?.normalized ?? 0} baris
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <span className="num-mono" style={{ color: (run.counts?.quarantined ?? 0) > 0 ? 'var(--warn-color)' : 'var(--text-secondary)' }}>
                                {run.counts?.quarantined ?? 0} baris
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <span className="num-mono" style={{ color: (run.counts?.flagged ?? 0) > 0 ? '#f43f5e' : 'var(--emerald-primary)' }}>
                                {run.counts?.flagged ?? 0}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
