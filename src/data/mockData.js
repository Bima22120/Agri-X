// Data realistis komoditas pangan & harga PIHPS Bank Indonesia untuk Jawa Timur & Nasional
export const COMMODITIES = [
  {
    id: "cabai-rawit-merah",
    name: "Cabai Rawit Merah",
    category: "vegetables",
    unit: "kg",
    currentPrice: 42500,
    prevPrice: 40200,
    changeNominal: 2300,
    changePercent: 5.72,
    trend: "up",
    nationalAvg: 45000,
    jatimAvg: 42500,
    high30d: 48000,
    low30d: 38000,
    updatedAt: "2026-10-11T07:30:00+07:00",
    dataQuality: "valid", // valid, delayed, estimated
    sniReference: "SNI 01-4480-1998 (Cabai Rawit Segar)",
    description: "Komoditas hortikultura utama dengan volatilitas tinggi, sentra produksi Malang & Kediri."
  },
  {
    id: "bawang-merah",
    name: "Bawang Merah Super",
    category: "vegetables",
    unit: "kg",
    currentPrice: 31500,
    prevPrice: 32800,
    changeNominal: -1300,
    changePercent: -3.96,
    trend: "down",
    nationalAvg: 34000,
    jatimAvg: 31500,
    high30d: 36000,
    low30d: 29500,
    updatedAt: "2026-10-11T07:30:00+07:00",
    dataQuality: "valid",
    sniReference: "SNI 01-3159-1992 (Bawang Merah)",
    description: "Sentra pasokan Probolinggo & Nganjuk, ukuran diameter sedang-besar dengan susut rendah."
  },
  {
    id: "beras-medium",
    name: "Beras Medium I",
    category: "rice",
    unit: "kg",
    currentPrice: 13800,
    prevPrice: 13750,
    changeNominal: 50,
    changePercent: 0.36,
    trend: "up",
    nationalAvg: 14200,
    jatimAvg: 13800,
    high30d: 14100,
    low30d: 13600,
    updatedAt: "2026-10-11T07:30:00+07:00",
    dataQuality: "valid",
    sniReference: "SNI 6128:2020 (Beras - Mutu II/Medium)",
    description: "Beras giling standar HET zona 1, kadar air maks 14%, butir patah maks 20%."
  },
  {
    id: "beras-premium",
    name: "Beras Premium",
    category: "rice",
    unit: "kg",
    currentPrice: 15900,
    prevPrice: 15900,
    changeNominal: 0,
    changePercent: 0.00,
    trend: "flat",
    nationalAvg: 16400,
    jatimAvg: 15900,
    high30d: 16200,
    low30d: 15700,
    updatedAt: "2026-10-11T07:30:00+07:00",
    dataQuality: "valid",
    sniReference: "SNI 6128:2020 (Beras - Mutu I/Premium)",
    description: "Derajat sosoh min 95%, kadar air maks 14%, butir patah maks 15% varietas Pandan Wangi & Mentik."
  },
  {
    id: "cabai-merah-keriting",
    name: "Cabai Merah Keriting",
    category: "vegetables",
    unit: "kg",
    currentPrice: 38200,
    prevPrice: 39500,
    changeNominal: -1300,
    changePercent: -3.29,
    trend: "down",
    nationalAvg: 41000,
    jatimAvg: 38200,
    high30d: 44000,
    low30d: 36000,
    updatedAt: "2026-10-11T07:30:00+07:00",
    dataQuality: "valid",
    sniReference: "SNI 01-3385-1994 (Cabai Merah)",
    description: "Kebutuhan utama industri kuliner & horeka, pasokan melimpah dari Blitar dan Kediri."
  },
  {
    id: "tomat-beef",
    name: "Tomat Buah Segar",
    category: "vegetables",
    unit: "kg",
    currentPrice: 12500,
    prevPrice: 11800,
    changeNominal: 700,
    changePercent: 5.93,
    trend: "up",
    nationalAvg: 14000,
    jatimAvg: 12500,
    high30d: 15000,
    low30d: 9500,
    updatedAt: "2026-10-11T07:30:00+07:00",
    dataQuality: "valid",
    sniReference: "SNI 01-3162-1992 (Tomat)",
    description: "Varietas buah tebal dan tahan kirim asal dataran tinggi Batu & Bromo."
  },
  {
    id: "bawang-putih-honan",
    name: "Bawang Putih Honan",
    category: "vegetables",
    unit: "kg",
    currentPrice: 36800,
    prevPrice: 36500,
    changeNominal: 300,
    changePercent: 0.82,
    trend: "up",
    nationalAvg: 39500,
    jatimAvg: 36800,
    high30d: 38500,
    low30d: 35000,
    updatedAt: "2026-10-11T07:30:00+07:00",
    dataQuality: "valid",
    sniReference: "SNI 01-3160-1992 (Bawang Putih)",
    description: "Bawang impor terstandarisasi untuk konsumsi hotel dan restoran."
  },
  {
    id: "kentang-granola",
    name: "Kentang Granola Super",
    category: "vegetables",
    unit: "kg",
    currentPrice: 18500,
    prevPrice: 18500,
    changeNominal: 0,
    changePercent: 0.00,
    trend: "flat",
    nationalAvg: 20200,
    jatimAvg: 18500,
    high30d: 21000,
    low30d: 17500,
    updatedAt: "2026-10-11T07:30:00+07:00",
    dataQuality: "valid",
    sniReference: "SNI 01-3175-1992 (Kentang)",
    description: "Asal lereng Bromo Tosari Pasuruan, bebas busuk basah, ukuran seragam."
  }
];

// Data Timeseries Candlestick (OHLC) harian selama 30 hari untuk komoditas terpilih
export const generateTimeseries = (basePrice, volatility = 0.03, days = 30) => {
  const data = [];
  let currentClose = basePrice * 0.92;
  const now = new Date("2026-10-11T07:30:00+07:00");

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const open = Math.round(currentClose);
    const delta = (Math.random() - 0.48) * volatility * open;
    const close = Math.round(open + delta);
    const high = Math.round(Math.max(open, close) + Math.random() * volatility * 0.6 * open);
    const low = Math.round(Math.min(open, close) - Math.random() * volatility * 0.6 * open);
    const volume = Math.round(15000 + Math.random() * 25000); // Volume grosir dalam kg

    data.push({
      date: dateStr,
      open,
      high,
      low,
      close,
      volume,
      pihpsRef: Math.round(close * (0.99 + Math.random() * 0.02))
    });

    currentClose = close;
  }
  return data;
};

// Matriks Perbandingan Harga Wilayah Jawa Timur vs Nasional (PIHPS)
export const REGIONAL_PRICES = [
  { city: "Surabaya (Pilot)", province: "Jawa Timur", cabaiRawit: 42500, bawangMerah: 31500, berasMedium: 13800, berasPremium: 15900, status: "Pusat Konsumsi" },
  { city: "Malang", province: "Jawa Timur", cabaiRawit: 39000, bawangMerah: 30000, berasMedium: 13600, berasPremium: 15700, status: "Sentra Produksi" },
  { city: "Kediri", province: "Jawa Timur", cabaiRawit: 38500, bawangMerah: 29800, berasMedium: 13500, berasPremium: 15600, status: "Sentra Produksi" },
  { city: "Probolinggo", province: "Jawa Timur", cabaiRawit: 41000, bawangMerah: 28500, berasMedium: 13700, berasPremium: 15800, status: "Sentra Bawang" },
  { city: "Jember", province: "Jawa Timur", cabaiRawit: 40500, bawangMerah: 31000, berasMedium: 13650, berasPremium: 15750, status: "Sentra Padi" },
  { city: "Banyuwangi", province: "Jawa Timur", cabaiRawit: 39500, bawangMerah: 32000, berasMedium: 13500, berasPremium: 15600, status: "Lumbung Padi" },
  { city: "Madiun", province: "Jawa Timur", cabaiRawit: 43000, bawangMerah: 32500, berasMedium: 13750, berasPremium: 15850, status: "Konsumsi & Dagang" },
  { city: "Rata-rata Nasional", province: "Seluruh Indonesia", cabaiRawit: 45000, bawangMerah: 34000, berasMedium: 14200, berasPremium: 16400, status: "Benchmark PIHPS" }
];

// Standar Kriteria Grade Pangan Jawa Timur (Kerjasama Food Agri Expert & SNI)
export const GRADE_CRITERIA = {
  vegetables: {
    A: "Tingkat kesegaran >95%, tingkat cacat/rusak fisik <3%, ukuran seragam (diameter/panjang standar Horeka premium), dipanen maks 18 jam sebelum pengiriman.",
    B: "Tingkat kesegaran 85-94%, tingkat cacat/rusak fisik 3-7%, variasi ukuran toleransi 15%, cocok untuk pengolahan masakan dapur umum/katering.",
    C: "Tingkat kesegaran 75-84%, tingkat cacat fisik 8-12% (tidak busuk), ukuran tidak seragam, diserap industri sambal olahan atau bahan baku olahan."
  },
  rice: {
    A: "Standar SNI Mutu I: Derajat sosoh min 95%, kadar air maks 14.0%, butir patah maks 15.0%, butir menir maks 0.5%, bebas butir gabah dan hama gudang.",
    B: "Standar SNI Mutu II: Derajat sosoh min 90%, kadar air maks 14.0%, butir patah maks 20.0%, butir menir maks 1.0%, bebas bau apek.",
    C: "Standar SNI Mutu III: Derajat sosoh min 85%, kadar air maks 14.5%, butir patah maks 25.0%, butir menir maks 2.0%."
  }
};

// Mitra Koperasi & Kelompok Tani Terverifikasi (Pemasok Marketplace B2B)
export const VERIFIED_PARTNERS = [
  {
    id: "partner-1",
    name: "Koperasi Tani Makmur Sejahtera",
    entityType: "Koperasi Produsen",
    location: "Kepanjen, Kab. Malang",
    verifiedSince: "2025-08-12",
    commodities: ["Cabai Rawit Merah", "Tomat Buah Segar", "Kentang Granola"],
    capacityPerWeek: "12 Ton",
    reputationScore: 4.9,
    totalCompletedOrders: 142,
    qcPassRate: "98.5%",
    contactPerson: "Drs. Budi Santoso (Ketua Koperasi)",
    phone: "0812-3456-7890 (Hanya untuk keperluan pengiriman)",
    badge: "Mitra Utama Koperasi"
  },
  {
    id: "partner-2",
    name: "Gapoktan Sumber Rejeki Pare",
    entityType: "Kelompok Tani Gabungan",
    location: "Pare, Kab. Kediri",
    verifiedSince: "2025-09-01",
    commodities: ["Cabai Merah Keriting", "Cabai Rawit Merah"],
    capacityPerWeek: "8 Ton",
    reputationScore: 4.8,
    totalCompletedOrders: 98,
    qcPassRate: "97.0%",
    contactPerson: "H. Mustofa",
    phone: "0813-9876-5432",
    badge: "Sentra Cabai Terverifikasi"
  },
  {
    id: "partner-3",
    name: "Koperasi Beras Sri Rejeki Rogojampi",
    entityType: "Koperasi Produsen Padi",
    location: "Rogojampi, Kab. Banyuwangi",
    verifiedSince: "2025-07-20",
    commodities: ["Beras Premium Pandan Wangi", "Beras Medium I"],
    capacityPerWeek: "35 Ton",
    reputationScore: 4.95,
    totalCompletedOrders: 230,
    qcPassRate: "99.2%",
    contactPerson: "Ir. Hendro Wibowo",
    phone: "0811-2233-4455",
    badge: "Lumbung Beras Berlisensi"
  },
  {
    id: "partner-4",
    name: "Koperasi Tani Bawang Merah Dringu",
    entityType: "Koperasi Agrikultur",
    location: "Dringu, Kab. Probolinggo",
    verifiedSince: "2025-10-05",
    commodities: ["Bawang Merah Super"],
    capacityPerWeek: "15 Ton",
    reputationScore: 4.75,
    totalCompletedOrders: 76,
    qcPassRate: "96.4%",
    contactPerson: "Slamet Riyadi",
    phone: "0819-8765-4321",
    badge: "Spesialis Bawang Probolinggo"
  }
];

// Listing Produk Katalog Marketplace B2B
export const MARKETPLACE_LISTINGS = [
  {
    id: "list-1",
    commodityId: "cabai-rawit-merah",
    title: "Cabai Rawit Merah Segar Petik Pagi Grade A",
    partnerId: "partner-1",
    grade: "A",
    category: "vegetables",
    originCity: "Malang",
    pricePerKg: 40500, // Harga marketplace
    pihpsReferencePrice: 42500, // Harga referensi PIHPS Surabaya
    priceDeltaPercent: -4.7, // 4.7% lebih murah dari referensi PIHPS
    minOrderKg: 50,
    availableStockKg: 2400,
    harvestSchedule: "Panen H-1 sebelum kirim (05.00 WIB)",
    shippingWindow: "Pengiriman pagi (06.00 - 10.00 WIB) armada berpendingin 3PL",
    claimWindowHours: 6, // 6 jam untuk sayur segar
    verified: true,
    featured: true,
    photos: [
      "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590494165264-1ebe3602eb80?auto=format&fit=crop&w=800&q=80"
    ],
    qcChecklistSnippet: "Kadar busuk 0%, batang hijau segar, tangkai utuh, kepedasan maksimal."
  },
  {
    id: "list-2",
    commodityId: "cabai-rawit-merah",
    title: "Cabai Rawit Merah Grade B Pasokan Industri Katering",
    partnerId: "partner-2",
    grade: "B",
    category: "vegetables",
    originCity: "Kediri",
    pricePerKg: 37500,
    pihpsReferencePrice: 42500,
    priceDeltaPercent: -11.76,
    minOrderKg: 100,
    availableStockKg: 4200,
    harvestSchedule: "Panen Harian Terjadwal",
    shippingWindow: "Pengiriman sore/malam langsung ke Surabaya",
    claimWindowHours: 6,
    verified: true,
    featured: false,
    photos: [
      "https://images.unsplash.com/photo-1590494165264-1ebe3602eb80?auto=format&fit=crop&w=800&q=80"
    ],
    qcChecklistSnippet: "Toleransi variasi ukuran 15%, kesegaran 90%, cocok untuk bahan dasar sambal masak."
  },
  {
    id: "list-3",
    commodityId: "bawang-merah",
    title: "Bawang Merah Super Dringu Probolinggo Grade A",
    partnerId: "partner-4",
    grade: "A",
    category: "vegetables",
    originCity: "Probolinggo",
    pricePerKg: 29800,
    pihpsReferencePrice: 31500,
    priceDeltaPercent: -5.4,
    minOrderKg: 100,
    availableStockKg: 5000,
    harvestSchedule: "Stok kering panen terkontrol (susut <2%)",
    shippingWindow: "Pengiriman H+1 dari pesanan",
    claimWindowHours: 12,
    verified: true,
    featured: true,
    photos: [
      "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80"
    ],
    qcChecklistSnippet: "Bonggol padat, kering merata, diameter >2.5 cm, aroma tajam khas Dringu."
  },
  {
    id: "list-4",
    commodityId: "beras-premium",
    title: "Beras Premium Pandan Wangi Banyuwangi Grade A SNI",
    partnerId: "partner-3",
    grade: "A",
    category: "rice",
    originCity: "Banyuwangi",
    pricePerKg: 15200,
    pihpsReferencePrice: 15900,
    priceDeltaPercent: -4.4,
    minOrderKg: 250,
    availableStockKg: 18000,
    harvestSchedule: "Giling baru mingguan, kemasan karung laminasi 25kg/50kg",
    shippingWindow: "Armada truk 3PL box tertutup",
    claimWindowHours: 48, // 48 jam untuk beras
    verified: true,
    featured: true,
    photos: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"
    ],
    qcChecklistSnippet: "Kadar air 13.4% (uji moisture meter), butir patah 11.2%, tanpa pemutih & pewangi kimia."
  },
  {
    id: "list-5",
    commodityId: "beras-medium",
    title: "Beras Medium I Gilingan Subur Rogojampi Grade B",
    partnerId: "partner-3",
    grade: "B",
    category: "rice",
    originCity: "Banyuwangi",
    pricePerKg: 13300,
    pihpsReferencePrice: 13800,
    priceDeltaPercent: -3.6,
    minOrderKg: 500,
    availableStockKg: 25000,
    harvestSchedule: "Siap kirim dari lumbung Banyuwangi",
    shippingWindow: "Pengiriman kontainer / truk tertutup",
    claimWindowHours: 48,
    verified: true,
    featured: false,
    photos: [
      "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=800&q=80"
    ],
    qcChecklistSnippet: "Kadar air maks 14%, butir patah 18%, bersih dari batu dan sekam."
  },
  {
    id: "list-6",
    commodityId: "tomat-beef",
    title: "Tomat Buah Batu Malang Grade A Kulit Mulus",
    partnerId: "partner-1",
    grade: "A",
    category: "vegetables",
    originCity: "Malang",
    pricePerKg: 11800,
    pihpsReferencePrice: 12500,
    priceDeltaPercent: -5.6,
    minOrderKg: 60,
    availableStockKg: 1800,
    harvestSchedule: "Petik subuh dari perkebunan Batu",
    shippingWindow: "Pengiriman pagi dalam keranjang peti kayu berventilasi",
    claimWindowHours: 6,
    verified: true,
    featured: false,
    photos: [
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80"
    ],
    qcChecklistSnippet: "Tekstur padat renyah, warna merah merata 85-90%, tidak ada luka gores."
  }
];

// Data Pesanan Simulasi & Alur Escrow Berlisensi PJP (Midtrans/Xendit)
export const INITIAL_ORDERS = [
  {
    id: "ORD-20261011-0089",
    buyer: {
      name: "Resto & Katering Bu Rudy Surabaya",
      contact: "Ibu Maya (Head Kitchen)",
      deliveryAddress: "Jl. Dharmahusada No. 140, Gubeng, Surabaya"
    },
    seller: {
      partnerId: "partner-1",
      name: "Koperasi Tani Makmur Sejahtera (Malang)"
    },
    listingId: "list-1",
    commodityName: "Cabai Rawit Merah Segar Grade A",
    quantityKg: 80,
    pricePerKg: 40500,
    subtotal: 3240000,
    shippingFee: 160000,
    platformFee: 81000, // 2.5% komisi
    totalAmount: 3481000,
    paymentMethod: "BCA Virtual Account (Xendit/Midtrans PJP Escrow)",
    paymentRef: "VA-882910481920",
    escrowStatus: "funds_locked", // funds_locked, released, disputed, refunded
    orderStatus: "in_transit", // pending_payment, preparing, in_transit, in_inspection, completed, disputed
    logistics: {
      provider: "AgriExpress 3PL Cold-Chain Surabaya",
      trackingNumber: "AGX-SUB-99412",
      pickupAt: "2026-10-11T05:30:00+07:00",
      estimatedDelivery: "2026-10-11T09:45:00+07:00",
      status: "Kurir dalam perjalanan menuju lokasi penerima (Jl. Dharmahusada)"
    },
    claimWindowExpiry: "2026-10-11T15:45:00+07:00", // 6 jam setelah estimasi sampai
    qcResult: {
      inspected: true,
      inspector: "Ahmad Fauzi (QC Reg. Jatim #04)",
      passRate: "98.8%",
      notes: "Sesuai kriteria Grade A, tangkai hijau, tingkat kebusukan 0% saat sortir awal."
    }
  },
  {
    id: "ORD-20261010-0072",
    buyer: {
      name: "Hotel Majapahit Surabaya",
      contact: "Pak Bagus (Purchasing Mgr)",
      deliveryAddress: "Jl. Tunjungan No. 65, Surabaya"
    },
    seller: {
      partnerId: "partner-3",
      name: "Koperasi Beras Sri Rejeki (Banyuwangi)"
    },
    listingId: "list-4",
    commodityName: "Beras Premium Pandan Wangi Grade A SNI",
    quantityKg: 500,
    pricePerKg: 15200,
    subtotal: 7600000,
    shippingFee: 350000,
    platformFee: 190000,
    totalAmount: 8140000,
    paymentMethod: "Mandiri Virtual Account",
    paymentRef: "VA-984719028472",
    escrowStatus: "released",
    orderStatus: "completed",
    logistics: {
      provider: "Logistik Nusantara Cargo",
      trackingNumber: "LNC-BWI-77218",
      deliveredAt: "2026-10-10T14:20:00+07:00",
      proofPhoto: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80"
    },
    claimWindowExpiry: "2026-10-12T14:20:00+07:00",
    qcResult: {
      inspected: true,
      inspector: "Siti Rahmawati (QC Reg. Jatim #01)",
      passRate: "100%",
      notes: "Uji kadar air lab 13.2%, bebas kutu, derajat sosoh 96%."
    }
  }
];

// Banner Iklan Komersial Resmi (Terlabel Iklan/Promosi Sesuai Spesifikasi)
export const PROMOTIONAL_BANNERS = [
  {
    id: "ad-1",
    title: "Program Kemitraan Koperasi Pupuk Organik Bio-Jatim",
    sponsor: "PT Pupuk Hayati Nusantara",
    placement: "dashboard",
    linkText: "Dapatkan Diskon Grosir Mitra",
    label: "Iklan / Promosi Komersial",
    disclaimer: "Iklan ini bersifat komersial dan tidak mempengaruhi nilai referensi harga PIHPS."
  },
  {
    id: "ad-2",
    title: "Sewa Armada Truk Pendingin Khusus Hortikultura Jatim",
    sponsor: "TransCold Jatim Logistics",
    placement: "marketplace",
    linkText: "Cek Tarif Rute Surabaya - Malang",
    label: "Iklan / Promosi Komersial",
    disclaimer: "Mitra logistik independen pihak ketiga berizin operasional."
  }
];

// Aturan Transparansi & Metodologi Resmi PIHPS Bank Indonesia
export const METHODOLOGY_INFO = {
  dataSource: "Pusat Informasi Harga Pangan Strategis (PIHPS) Nasional / Bank Indonesia",
  updateFrequency: "Diperbarui setiap hari kerja (Senin - Jumat) pkl 07:00 - 08:30 WIB",
  priceLevel: "Harga Grosir / Pasar Induk (Wholesale Level)",
  geographicCoverage: "Nasional mencakup 38 Provinsi dan Kota/Kabupaten utama, dengan fokus analitik Jawa Timur",
  disclaimerLegal: "Data dan dashboard ini disediakan murni sebagai sarana transparansi informasi dan acuan referensi harga. Platform ini BUKAN bursa komoditi berjangka dan tidak menyediakan fasilitas spekulasi finansial.",
  transparencyRules: [
    "Harga referensi PIHPS bersifat publik dan dapat diakses bebas tanpa login.",
    "Harga referensi resmi PIHPS dan harga transaksi di Marketplace B2B disimpan pada entitas database yang sepenuhnya terpisah dan berlabel tegas.",
    "Transaksi jual-beli di marketplace sama sekali tidak mempengaruhi angka referensi harga PIHPS resmi.",
    "Data pribadi petani, koperasi, dan pembeli dirahasiakan; hanya agregat statistik tanpa identitas yang dipublikasikan.",
    "Label data tidak pernah dinyatakan sebagai 'real-time', melainkan 'Diperbarui Harian' lengkap dengan cap waktu (timestamp)."
  ]
};
