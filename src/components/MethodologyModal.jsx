import React from 'react';
import { BookOpen, ShieldCheck, Database, Scale, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { METHODOLOGY_INFO } from '../data/mockData';

export const MethodologyModal = ({ isOpen, onClose, isStandalonePage = false }) => {
  if (!isOpen && !isStandalonePage) return null;

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{ background: 'var(--earth-dim)', border: '1px solid var(--earth-border)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--earth)', fontWeight: 800, marginBottom: '6px' }}>
          <AlertOctagon size={18} />
          <span>PERNYATAAN HUKUM & BATASAN INFORMASI</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.6 }}>
          {METHODOLOGY_INFO.disclaimerLegal}
        </p>
      </div>

      {/* 5 Aturan Emas Transparansi */}
      <div className="card" style={{ padding: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} style={{ color: 'var(--emerald-primary)' }} />
          5 Asas Utama Transparansi Data Platform
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {METHODOLOGY_INFO.transparencyRules.map((rule, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px' }}>
              <CheckCircle2 size={14} style={{ color: 'var(--emerald-primary)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ color: 'var(--text-main)', lineHeight: 1.5 }}>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rincian Metodologi Teknis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', fontSize: '12px' }}>
        <div className="card" style={{ padding: '14px' }}>
          <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--earth)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={14} /> Sumber & Akuisisi Data
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Data diakuisisi resmi dari <strong>{METHODOLOGY_INFO.dataSource}</strong> pada tingkat grosir (*wholesale pasar induk*). Ingestion dijalankan melalui *worker cron* terjadwal setiap pagi.
          </p>
        </div>

        <div className="card" style={{ padding: '14px' }}>
          <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--emerald-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Scale size={14} /> Frekuensi & Pelabelan
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Data tidak pernah dilabeli sebagai <em>"real-time"</em> demi integritas metodologi. Seluruh tampilan mencantumkan cap waktu pembaruan harian pkl 07:30 WIB.
          </p>
        </div>

        <div className="card" style={{ padding: '14px' }}>
          <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--forest)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={14} /> Pemisahan Data Transaksi
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Harga transaksi yang terjadi di Marketplace B2B disimpan dalam tabel terpisah. Transaksi komersial tidak dapat dan tidak akan mengubah nilai acuan referensi resmi PIHPS.
          </p>
        </div>
      </div>
    </div>
  );

  if (isStandalonePage) {
    return (
      <div className="methodology-page">
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} style={{ color: 'var(--amber-primary)' }} />
            Metodologi, Sumber Data, & Asas Transparansi PIHPS
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Dokumentasi lengkap tata kelola data referensi harga pangan strategis Bank Indonesia.
          </div>
        </div>
        {content}
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} style={{ color: 'var(--amber-primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Metodologi & Ketentuan Data PIHPS</h3>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {content}
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary btn-sm" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
};
