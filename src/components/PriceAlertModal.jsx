import React, { useState } from 'react';
import { Bell, CheckCircle2, MessageSquare, Mail, AlertCircle } from 'lucide-react';

export const PriceAlertModal = ({ isOpen, onClose, commodities }) => {
  if (!isOpen) return null;

  const [selectedCommodityId, setSelectedCommodityId] = useState(commodities[0]?.id || '');
  const [alertCondition, setAlertCondition] = useState('above'); // 'above' or 'below'
  const [targetPrice, setTargetPrice] = useState(45000);
  const [channel, setChannel] = useState('whatsapp'); // 'whatsapp' or 'email'
  const [contactTarget, setContactTarget] = useState('0812-3456-7890');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveAlert = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} style={{ color: 'var(--amber-primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Pasang Alert Notifikasi Harga PIHPS</h3>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSaveAlert}>
          <div className="modal-body">
            {isSaved ? (
              <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                <CheckCircle2 size={40} style={{ color: 'var(--emerald-primary)', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>Alert Berhasil Didaftarkan!</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Sistem akan mengirimkan pesan otomatis via {channel === 'whatsapp' ? 'WhatsApp Business API' : 'Email'} begitu harga grosir PIHPS mencapai kriteria.
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Dapatkan notifikasi instan ketika harga acuan grosir pangan di Jawa Timur melewati batas toleransi biaya operasional bisnis Anda.
                </p>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Pilih Komoditas:
                  </label>
                  <select 
                    className="input-search" 
                    style={{ width: '100%' }}
                    value={selectedCommodityId}
                    onChange={(e) => setSelectedCommodityId(e.target.value)}
                    id="select-alert-commodity"
                  >
                    {commodities.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Harga Saat Ini: Rp {c.currentPrice.toLocaleString('id-ID')})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      Kondisi Ambang:
                    </label>
                    <select 
                      className="input-search" 
                      style={{ width: '100%' }}
                      value={alertCondition}
                      onChange={(e) => setAlertCondition(e.target.value)}
                      id="select-alert-condition"
                    >
                      <option value="above">Naik Melewati (≥)</option>
                      <option value="below">Turun Di Bawah (≤)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      Target Harga (Rp/kg):
                    </label>
                    <input 
                      type="number"
                      step={500}
                      className="input-search"
                      style={{ width: '100%' }}
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(Number(e.target.value))}
                      id="input-alert-target-price"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Saluran Notifikasi (Notifikasi Bebas Pulsa):
                  </label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button 
                      type="button"
                      className={`btn ${channel === 'whatsapp' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setChannel('whatsapp')}
                      style={{ flex: 1, fontSize: '12px' }}
                    >
                      <MessageSquare size={14} /> WhatsApp API
                    </button>
                    <button 
                      type="button"
                      className={`btn ${channel === 'email' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setChannel('email')}
                      style={{ flex: 1, fontSize: '12px' }}
                    >
                      <Mail size={14} /> Email
                    </button>
                  </div>

                  <input 
                    type="text"
                    className="input-search"
                    style={{ width: '100%' }}
                    placeholder={channel === 'whatsapp' ? 'Nomor WhatsApp (misal: 081234567890)' : 'Alamat Email Perusahaan'}
                    value={contactTarget}
                    onChange={(e) => setContactTarget(e.target.value)}
                    id="input-alert-contact"
                  />
                </div>
              </>
            )}
          </div>

          {!isSaved && (
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={onClose}>Batal</button>
              <button type="submit" className="btn btn-primary" id="btn-submit-alert">
                Simpan & Aktifkan Alert
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
