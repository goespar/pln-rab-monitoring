// ============================================
// PLN RAB & Monitoring - Configuration
// ============================================

const CONFIG = {
  // Google Apps Script Web App URL
  // Replace this with your deployed Apps Script URL
  API_URL: 'https://script.google.com/macros/s/AKfycbw24s7LeOr2EQnAQljBYPfdwLu62zwC7rz5rHLk1_XdkKv0uqGrV4pHv_Ss7uKgpIATIg/exec',

  // Google Drive Folder IDs
  DRIVE_FOLDER_DB: '1zUi12nHqdI9m3xpsx1jwd7Eb_TgSHrQo', // Database folder
  DRIVE_FOLDER_IMAGES: '1psP2eazM9liISpl9roLxsf-Jv0FKKO81', // Images folder

  // App Info
  APP_NAME: 'PLN RAB & Monitoring',
  APP_VERSION: '1.0.0',

  // Roles
  ROLES: {
    ADMIN: 'admin',
    PERENCANAAN: 'tim_perencanaan',
    PENGAWASAN: 'tim_pengawasan',
    ATASAN: 'atasan'
  },

  // Role Labels
  ROLE_LABELS: {
    'admin': 'Administrator',
    'tim_perencanaan': 'Tim Perencanaan',
    'tim_pengawasan': 'Tim Pengawasan',
    'atasan': 'Atasan'
  },

  // Menu Access Control
  MENU_ACCESS: {
    'dashboard': ['admin', 'tim_perencanaan', 'tim_pengawasan', 'atasan'],
    'rab': ['admin', 'tim_perencanaan'],
    'kontrak': ['admin', 'tim_perencanaan'],
    'realisasi': ['admin', 'tim_pengawasan'],
    'material': ['admin', 'tim_perencanaan'],
    'penyedia': ['admin', 'tim_perencanaan'],
    'laporan': ['admin', 'tim_perencanaan', 'tim_pengawasan', 'atasan'],
    'pengaturan': ['admin'],
    'detail-pekerjaan': ['admin', 'tim_perencanaan', 'tim_pengawasan', 'atasan']
  },

  // Status Options
  STATUS_PEKERJAAN: [
    { value: 'belum_mulai', label: 'Belum Mulai', class: 'belum-mulai' },
    { value: 'on_progress', label: 'On Progress', class: 'on-progress' },
    { value: 'selesai', label: 'Selesai', class: 'selesai' },
    { value: 'tunda', label: 'Tunda', class: 'tunda' },
    { value: 'batal', label: 'Batal', class: 'batal' }
  ],

  STATUS_RAB: [
    { value: 'draft', label: 'Draft', class: 'draft' },
    { value: 'review', label: 'Review', class: 'review' },
    { value: 'approved', label: 'Approved', class: 'selesai' },
    { value: 'rejected', label: 'Rejected', class: 'batal' }
  ],

  // Jenis Pekerjaan
  JENIS_PEKERJAAN: [
    'Rehab JTM',
    'Rekonduktor',
    'Ganti Komponen',
    'Perluasan JTM',
    'Gardu Kubikel',
    'Catu Daya',
    'SUTM',
    'SKUTM',
    'SKTM',
    'Lainnya'
  ],

  // Satuan
  SATUAN: ['km', 'kms', 'unit', 'set', 'buah', 'btg', 'lonjor', 'meter', 'ls', 'paket'],

  // ULP Options
  ULP_OPTIONS: ['ULP Tabanan', 'ULP Singaraja', 'ULP Negara', 'ULP Bangli', 'ULP Amlapura'],

  // UP3 Options  
  UP3_OPTIONS: ['Bali Utara', 'Bali Selatan', 'Bali Timur'],

  // PPN Rate
  PPN_RATE: 0.12,
  DPP_MULTIPLIER: 11 / 12,

  // Pagination
  PAGE_SIZE: 20,

  // Date format
  DATE_FORMAT: 'id-ID',
  CURRENCY_FORMAT: 'id-ID'
};

// Freeze config to prevent accidental modification
Object.freeze(CONFIG);
Object.freeze(CONFIG.ROLES);
Object.freeze(CONFIG.MENU_ACCESS);
