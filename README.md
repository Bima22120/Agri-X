# AgriX Jatim — Platform Transparansi Harga PIHPS & Marketplace B2B Agrikultur

Aplikasi web modern yang dibangun berdasarkan spesifikasi penuh [`project_spec.json`](./project_spec.json). Mengintegrasikan transparansi data harga pangan grosir resmi PIHPS Bank Indonesia dan ekosistem B2B marketplace agrikultur terkelola (koperasi petani ke sektor Horeka) di wilayah Jawa Timur (Pilot: Surabaya).

---

## 🚀 Fitur Utama Berdasarkan Spesifikasi

### 1. Pilar 1: Dashboard Transparansi Harga Grosir (UI Trading-Terminal Style)
- **Running Ticker Bar**: Pita pergerakan harga harian dengan indikator pergerakan (*up/down/flat*).
- **Grafik Tren Interaktif**: Pilihan tampilan **Candlestick (OHLC)** dan **Line Chart**, rentang waktu harian (7 Hari, 30 Hari, 1 Tahun), tooltip metrik, dan rentang harga tertinggi/terendah.
- **Papan Ticker Komoditas (Wholesale Board)**: Tabel berdensitas tinggi dilengkapi filter pencarian, kategori (Sayuran & Beras), pinning ke *Watchlist*, dan tombol aksi langsung ke pasokan B2B.
- **Matriks Perbandingan Wilayah**: Menampilkan disparitas harga antara kota konsumsi utama (Surabaya Pilot) dan kota sentra produksi (Malang, Kediri, Probolinggo, Banyuwangi, Jember) vs Rata-rata Nasional.
- **Bandingkan Komoditas**: Alat komparasi berdampingan antar komoditas pangan.
- **Ekspor CSV**: Unduh langsung data historis harga referensi PIHPS.
- **Indikator Kualitas Data**: Cap waktu pembaruan harian (07:30 WIB), status validitas *pipeline ingestion*, dan verifikasi data.
- **Price Alert Ambang Batas**: Form simulasi peringatan via WhatsApp Business API & Email.

### 2. Pilar 2: Marketplace B2B Agrikultur Jawa Timur
- **Katalog Berbasis Standar Mutu SNI**:
  - Pilihan **Grade A** (Super Premium), **Grade B** (Standar Horeka), dan **Grade C** (Industri Olahan).
  - Tampilan **Delta Selisih Harga vs Acuan PIHPS** (contoh: `-4.7% vs PIHPS Grosir`).
- **Mitra Koperasi Terverifikasi**: Profil Koperasi Tani Makmur (Malang), Gapoktan Sumber Rejeki (Kediri), Koperasi Beras Sri Rejeki (Banyuwangi), dan Koperasi Bawang Merah Dringu (Probolinggo).
- **Alur Transaksi & Rekening Penampungan Escrow (Berlisensi PJP)**:
  - Pembayaran di muka (*prepaid*) via Virtual Account (BCA, Mandiri, BRI) & QRIS Dinamis.
  - Dana dikunci aman di rekening penampungan berlisensi PJP.
  - Simulasi biaya komisi platform 2.5% dan ongkos kirim 3PL cold-chain.
  - **Jendela Waktu Inspeksi (Claim Window)**: Batas waktu komplain mutu (6 jam untuk sayuran segar, 48 jam untuk beras).
  - Pelepasan dana otomatis ke saldo koperasi setelah barang diterima dan masa inspeksi usai.

### 3. Modul Quality Control (QC) & Anti-Dispute
- Sampling berbasis risiko (*risk-based sampling*) untuk komoditas hortikultura mudah rusak.
- Formulir audit mutu lapangan: Pengujian tingkat kesegaran (%), toleransi cacat fisik (%), kadar air moisture meter (%), dan penentuan grade akhir terverifikasi.
- Modul pengajuan klaim/sengketa pembeli dengan bukti foto fisik.

### 4. Admin Panel & Regulasi
- Pemantauan GMV kumulatif, saldo tertahan di rekening escrow, dan akumulasi komisi platform.
- Mediasi sengketa sengketa (*Dispute Resolution*): opsi pengembalian dana (*refund buyer*) atau pencairan ke penjual (*release seller*).
- Manajemen slot iklan komersial dengan label wajib `"Iklan / Promosi Komersial"`.
- Log audit mutasi data tak terhapus (*Append-Only Log*).

### 5. Multi-Role Testing
Dropdown pergantian peran di navbar atas memungkinkan pengujian langsung sebagai:
- **Publik** (Tanpa Login)
- **Pembeli / Horeka** (Resto & Hotel)
- **Penjual / Koperasi Tani**
- **Petugas QC Lapangan**
- **Administrator Sistem**

---

## 🛠️ Menjalankan Aplikasi Secara Lokal

```bash
# Pastikan dependensi sudah terpasang
npm install

# Jalankan server pengembangan lokal (Vite)
npm run dev

# Buka peramban di http://localhost:5173/
```

Untuk memvalidasi *bundle* produksi:
```bash
npm run build
npm run preview
```
