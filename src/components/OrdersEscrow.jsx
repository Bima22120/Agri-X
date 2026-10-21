import React, { useState } from 'react';
import { 
  Package, 
  ShieldCheck, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  Upload, 
  DollarSign,
  Info
} from 'lucide-react';

export const OrdersEscrow = ({ orders, onReleaseFunds, onFileDispute, currentRole }) => {
  const [selectedDisputeOrder, setSelectedDisputeOrder] = useState(null);
  const [disputeReason, setDisputeReason] = useState('quality_mismatch');
  const [disputeNotes, setDisputeNotes] = useState('');
  const [disputePhotoUrl, setDisputePhotoUrl] = useState('https://images.unsplash.com/photo-1590494165264-1ebe3602eb80?auto=format&fit=crop&w=600&q=80');

  const handleOpenDispute = (order) => {
    setSelectedDisputeOrder(order);
    setDisputeNotes(`Barang pesanan ${order.commodityName} mengalami kerusakan fisik sekitar 15% pada bagian bawah kemasan, tidak sesuai standar Grade A yang dijanjikan.`);
  };

  const handleSubmitDispute = () => {
    if (!selectedDisputeOrder) return;
    onFileDispute(selectedDisputeOrder.id, {
      reason: disputeReason,
      notes: disputeNotes,
      photoUrl: disputePhotoUrl,
      createdAt: new Date().toISOString()
    });
    setSelectedDisputeOrder(null);
  };

  return (
    <div className="orders-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} style={{ color: 'var(--amber-primary)' }} />
            Manajemen Pesanan & Rekening Escrow Berlisensi
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Pelacakan status transaksi terkelola (Managed Escrow Flow) dengan jaminan perlindungan dana dan jendela klaim mutu.
          </div>
        </div>

        <div className="badge badge-amber" style={{ padding: '8px 12px', fontSize: '12px' }}>
          <ShieldCheck size={14} />
          <span>Sistem Pembayaran Prabayar (Prepaid Escrow Terkunci)</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Package size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Belum Ada Pesanan Aktif</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Silakan pilih pasokan komoditas di Marketplace B2B untuk melakukan transaksi dengan jaminan escrow.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => {
            const isReleased = order.escrowStatus === 'released';
            const isDisputed = order.escrowStatus === 'disputed';
            const isFundsLocked = order.escrowStatus === 'funds_locked';

            return (
              <div key={order.id} className="card" style={{ borderColor: isDisputed ? 'var(--crimson-border)' : isReleased ? 'var(--emerald-border)' : 'var(--amber-border)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="num-mono" style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)' }}>{order.id}</span>
                      <span className={`badge ${isReleased ? 'badge-up' : isDisputed ? 'badge-down' : 'badge-amber'}`}>
                        {isReleased ? "DANA BERHASIL DICAIRKAN" : isDisputed ? "DALAM SENGKETA / DISPUTE" : "ESCROW DANA TERKUNCI"}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Pemasok: <strong>{order.seller.name}</strong> · Pembeli: <strong>{order.buyer.name}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Nilai Transaksi Escrow:</div>
                    <div className="num-mono" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--emerald-primary)' }}>
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {order.paymentMethod}
                    </div>
                  </div>
                </div>

                {/* Escrow 3-Step Visual Timeline: Dikemas -> Dikirim -> Selesai */}
                <div className="order-timeline-clean">
                  {/* Step 1: Dikemas */}
                  <div className={`order-timeline-item ${order.orderStatus ? 'completed' : 'active'}`}>
                    <div className="order-timeline-node">
                      <div className="order-timeline-circle">1</div>
                      <div className="order-timeline-line" />
                    </div>
                    <div className="order-timeline-content">
                      <div className="order-timeline-title">Dikemas</div>
                      <div className="order-timeline-time">Hari ini, 06:15 WIB</div>
                      <div className="order-timeline-desc">Koperasi sortir, grading & pengemasan higienis</div>
                    </div>
                  </div>

                  {/* Step 2: Dikirim */}
                  <div className={`order-timeline-item ${order.orderStatus === 'in_transit' || order.orderStatus === 'in_inspection' || isReleased ? 'completed' : order.orderStatus === 'preparing' ? 'active' : ''}`}>
                    <div className="order-timeline-node">
                      <div className="order-timeline-circle">2</div>
                      <div className="order-timeline-line" />
                    </div>
                    <div className="order-timeline-content">
                      <div className="order-timeline-title">Dikirim</div>
                      <div className="order-timeline-time">Hari ini, 07:30 WIB</div>
                      <div className="order-timeline-desc">Armada cold-chain 3PL dalam perjalanan ke lokasi</div>
                    </div>
                  </div>

                  {/* Step 3: Selesai (dengan Jendela Waktu Inspeksi) */}
                  <div className={`order-timeline-item ${isReleased ? 'completed' : (order.orderStatus === 'in_inspection' || order.orderStatus === 'in_transit') ? 'active' : ''}`}>
                    <div className="order-timeline-node">
                      <div className="order-timeline-circle">3</div>
                    </div>
                    <div className="order-timeline-content">
                      <div className="order-timeline-title">Selesai</div>
                      <div className="order-timeline-time">Estimasi tiba: 09:15 WIB</div>
                      <div className="order-timeline-desc">Pesanan sampai & serah terima fisik</div>
                      
                      {/* Jendela Waktu Inspeksi (Claim Window) */}
                      <div className="claim-window-pill">
                        <Clock size={13} style={{ color: 'var(--forest)', flexShrink: 0 }} />
                        <div>
                          <strong>Jendela Waktu Inspeksi:</strong> {isReleased ? "Pemeriksaan Selesai (Diterima)" : "Aktif hingga jam pengiriman + batas klaim"}
                          <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Dana escrow otomatis cair jika tidak ada klaim dalam periode ini.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail Order Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', background: 'var(--bg-section)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '16px', fontSize: '12px' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>Rincian Komoditas:</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{order.commodityName}</div>
                    <div>Volume: <strong>{order.quantityKg} kg</strong></div>
                    <div style={{ marginTop: '4px' }}>Lokasi Antar: <strong>{order.buyer.deliveryAddress}</strong></div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>Logistik & Pelacakan 3PL:</div>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Truck size={13} style={{ color: 'var(--forest)' }} />
                      {order.logistics.provider}
                    </div>
                    <div>Resi: <span className="num-mono">{order.logistics.trackingNumber}</span></div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Status: {order.logistics.status}</div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>Pembayaran Escrow:</div>
                    <div style={{ fontWeight: 700, color: 'var(--forest)' }}>{order.paymentMethod}</div>
                    <div style={{ marginTop: '2px' }}>ID Transaksi: <span className="num-mono">{order.paymentRef}</span></div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Status Escrow: <strong>{isReleased ? "Cair ke Petani" : isDisputed ? "Ditangguhkan (Dispute)" : "Terkunci Aman"}</strong>
                    </div>
                  </div>
                </div>

                {/* QC Inspection Summary if Available */}
                {order.qcResult && (
                  <div style={{ background: 'var(--forest-dim)', border: '1px solid var(--sage-border)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--forest)' }} />
                      <span><strong>Hasil Verifikasi QC Lapangan:</strong> {order.qcResult.notes}</span>
                    </div>
                    {order.qcResult.inspector && (
                      <span className="badge badge-flat" style={{ fontSize: '10px' }}>
                        Oleh: {order.qcResult.inspector}
                      </span>
                    )}
                  </div>
                )}

                {/* Dispute Alert if Active */}
                {isDisputed && (
                  <div style={{ background: 'var(--down-bg)', border: '1px solid var(--down-border)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--down-color)', fontWeight: 700, marginBottom: '4px' }}>
                      <AlertTriangle size={15} />
                      <span>Pesanan Dalam Penanganan Sengketa / Klaim Mutu</span>
                    </div>
                    <p style={{ color: 'var(--text-main)', lineHeight: 1.5 }}>
                      Klaim diajukan oleh pembeli. Tim QC dan Administrator sedang memverifikasi bukti foto fisik dan rekaman grading sebelum keputusan pengembalian dana atau mediasi.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {isFundsLocked && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--crimson-primary)', borderColor: 'var(--crimson-border)' }}
                      onClick={() => handleOpenDispute(order)}
                      id={`btn-dispute-${order.id}`}
                    >
                      <AlertTriangle size={13} />
                      <span>Ajukan Klaim / Sengketa Mutu</span>
                    </button>

                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => onReleaseFunds(order.id)}
                      id={`btn-release-${order.id}`}
                    >
                      <CheckCircle2 size={13} />
                      <span>Konfirmasi Barang Sesuai & Cairkan Dana ke Petani</span>
                    </button>
                  </div>
                )}

                {isReleased && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--emerald-primary)', background: 'rgba(16, 185, 129, 0.08)', padding: '10px 14px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={15} />
                      <span>Dana senilai Rp {(order.subtotal - order.platformFee).toLocaleString('id-ID')} telah sukses dikirim ke rekening Koperasi (Komisi platform 2.5% dipotong otomatis).</span>
                    </div>
                    <span className="num-mono" style={{ fontWeight: 700 }}>SELESAI</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dispute Modal */}
      {selectedDisputeOrder && (
        <div className="modal-overlay" onClick={() => setSelectedDisputeOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={18} style={{ color: 'var(--crimson-primary)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Pengajuan Klaim Sengketa Mutu</h3>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedDisputeOrder(null)}>✕</button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Sesuai klausul perlindungan escrow, dana tidak akan dicairkan ke penjual sampai klaim diselesaikan oleh admin & bukti inspeksi QC.
              </p>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Alasan Ketidaksesuaian:</label>
                <select 
                  className="input-search" 
                  style={{ width: '100%' }}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                >
                  <option value="quality_mismatch">Grade Mutu Tidak Sesuai (Ukuran / Busuk / Cacat Fisik)</option>
                  <option value="volume_shortage">Kekurangan Timbangan Berat (Susut Melebihi Toleransi)</option>
                  <option value="late_delivery">Keterlambatan Pengiriman Melewati Jam Operasional Dapur</option>
                  <option value="wrong_item">Komoditas Yang Dikirimkan Salah</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Uraian Penjelasan Temuan:</label>
                <textarea 
                  className="input-search"
                  rows={3}
                  style={{ width: '100%', resize: 'vertical' }}
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Foto Bukti Fisik Saat Barang Tiba:</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <img src={disputePhotoUrl} alt="Bukti Sengketa" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-strong)' }} />
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Bukti foto kerusakan fisik sayur terlampir otomatis untuk proses verifikasi QC dan Admin.
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedDisputeOrder(null)}>Batal</button>
              <button className="btn btn-primary" style={{ background: 'var(--crimson-primary)' }} onClick={handleSubmitDispute}>
                Kirim Laporan Klaim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
