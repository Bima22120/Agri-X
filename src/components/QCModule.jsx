import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ClipboardCheck, 
  Camera, 
  Award, 
  FileCheck, 
  ShieldAlert, 
  Search,
  Filter
} from 'lucide-react';
import { GRADE_CRITERIA } from '../data/mockData';

export const QCModule = ({ orders, onUpdateQC, partners }) => {
  const [selectedOrderForQC, setSelectedOrderForQC] = useState(orders[0] || null);
  const [freshnessScore, setFreshnessScore] = useState(96);
  const [damageRate, setDamageRate] = useState(2.1);
  const [moistureContent, setMoistureContent] = useState(13.5);
  const [assignedGrade, setAssignedGrade] = useState('A');
  const [inspectorNotes, setInspectorNotes] = useState('Sortasi fisik sampel 10kg acak. Kondisi segar, bebas hama, bobot sesuai toleransi timbangan.');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  const handleSaveQCRecord = () => {
    if (!selectedOrderForQC) return;

    const result = {
      inspected: true,
      inspector: "Siti Rahmawati, S.TP (QC Ahli Pangan Jatim #01)",
      passRate: `${freshnessScore}%`,
      assignedGrade,
      freshnessScore,
      damageRate,
      moistureContent,
      notes: inspectorNotes,
      timestamp: new Date().toISOString()
    };

    onUpdateQC(selectedOrderForQC.id, result);
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2500);
  };

  return (
    <div className="qc-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardCheck size={20} style={{ color: 'var(--emerald-primary)' }} />
            Modul Quality Control (QC) & Standarisasi Mutu SNI
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Inspeksi sampling berbasis risiko (*risk-based sampling*) untuk komoditas hortikultura mudah rusak dan beras lumbung Jawa Timur.
          </div>
        </div>

        <div className="badge badge-up" style={{ padding: '8px 12px', fontSize: '12px' }}>
          <Award size={14} />
          <span>Sistem Akreditasi Penjual & Skor Reputasi</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Left Column: List of Shipments requiring QC */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Antrean Sampling Pengiriman</h3>
            <span className="badge badge-amber">{orders.length} Batch</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {orders.map(order => {
              const isSelected = selectedOrderForQC?.id === order.id;
              const isDone = order.qcResult?.inspected;

              return (
                <div 
                  key={order.id}
                  onClick={() => setSelectedOrderForQC(order)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--forest-dim)' : 'var(--bg-section)',
                    border: `1.5px solid ${isSelected ? 'var(--forest)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="num-mono" style={{ fontWeight: 700 }}>{order.id}</span>
                    <span className={`badge ${isDone ? 'badge-up' : 'badge-amber'}`} style={{ fontSize: '10px' }}>
                      {isDone ? "Terinspeksi" : "Perlu Sampling"}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{order.commodityName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Pemasok: {order.seller.name} · Volume: {order.quantityKg} kg
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive QC Form */}
        {selectedOrderForQC ? (
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <FileCheck size={16} style={{ color: 'var(--emerald-primary)' }} />
                  Formulir Audit Mutu: {selectedOrderForQC.id}
                </h3>
                <div className="card-subtitle">{selectedOrderForQC.commodityName}</div>
              </div>
              <span className="badge badge-flat">Standar SNI Terintegrasi</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Sampling Parameters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Tingkat Kesegaran / Kemurnian (%):
                  </label>
                  <input 
                    type="number"
                    min="50"
                    max="100"
                    className="input-search"
                    style={{ width: '100%' }}
                    value={freshnessScore}
                    onChange={(e) => setFreshnessScore(Number(e.target.value))}
                    id="input-qc-freshness"
                  />
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    SNI Grade A: Minimal 95%
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Toleransi Cacat Fisik / Kerusakan (%):
                  </label>
                  <input 
                    type="number"
                    min="0"
                    max="25"
                    step="0.1"
                    className="input-search"
                    style={{ width: '100%' }}
                    value={damageRate}
                    onChange={(e) => setDamageRate(Number(e.target.value))}
                    id="input-qc-damage"
                  />
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    SNI Grade A: Maksimal 3%
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Kadar Air / Moisture Level (%):
                  </label>
                  <input 
                    type="number"
                    min="10"
                    max="20"
                    step="0.1"
                    className="input-search"
                    style={{ width: '100%' }}
                    value={moistureContent}
                    onChange={(e) => setMoistureContent(Number(e.target.value))}
                    id="input-qc-moisture"
                  />
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Beras SNI: Maksimal 14.0%
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    Penetapan Grade Aktual Terverifikasi:
                  </label>
                  <select 
                    className="input-search"
                    style={{ width: '100%' }}
                    value={assignedGrade}
                    onChange={(e) => setAssignedGrade(e.target.value)}
                    id="select-qc-grade"
                  >
                    <option value="A">Lolos GRADE A (Super Premium)</option>
                    <option value="B">Lolos GRADE B (Standar Horeka)</option>
                    <option value="C">Lolos GRADE C (Industri Olahan)</option>
                    <option value="REJECT">GAGAL / REJECT (Kembalikan ke Petani)</option>
                  </select>
                </div>
              </div>

              {/* Inspector Remarks */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Catatan Observasi Petugas QC:
                </label>
                <textarea 
                  className="input-search"
                  rows={3}
                  style={{ width: '100%', resize: 'vertical' }}
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  id="textarea-qc-notes"
                />
              </div>

              {/* Photo Proof */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Dokumentasi Foto Uji Sampel Fisik:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80" 
                    alt="Sampel Uji"
                    style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-strong)' }}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Foto geolokasi dari titik pos sortir koperasi Jawa Timur. Terverifikasi bebas pestisida berlebih dan kebusukan basah.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                {isSavedSuccess && (
                  <span style={{ color: 'var(--emerald-primary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Berita Acara QC Berhasil Disimpan!
                  </span>
                )}
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveQCRecord}
                  id="btn-save-qc"
                >
                  <CheckCircle2 size={14} />
                  <span>Sahkan Berita Acara QC & Perbarui Reputasi Penjual</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Pilih pengiriman di samping untuk memeriksa</span>
          </div>
        )}
      </div>
    </div>
  );
};
