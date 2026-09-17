// ============================================
// PLN RAB & Monitoring - API Module
// Communication with Google Apps Script
// ============================================

const API = {
  // Base request function
  async request(action, params = {}, method = 'GET') {
    try {
      const url = new URL(CONFIG.API_URL);
      
      if (method === 'GET') {
        url.searchParams.set('action', action);
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, typeof value === 'object' ? JSON.stringify(value) : value);
        });
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          redirect: 'follow'
        });
        return await response.json();
      } else {
        const response = await fetch(CONFIG.API_URL, {
          method: 'POST',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action, ...params })
        });
        return await response.json();
      }
    } catch (error) {
      console.error(`API Error [${action}]:`, error);
      // Return demo data if API is not configured
      if (CONFIG.API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        return this.getDemoData(action, params);
      }
      throw error;
    }
  },

  // ============ Authentication ============
  async login(username, password) {
    return this.request('login', { username, password }, 'POST');
  },

  // ============ CRUD Operations ============
  async getData(sheet, filters = {}) {
    return this.request('getData', { sheet, filters: JSON.stringify(filters) });
  },

  async getById(sheet, id) {
    return this.request('getById', { sheet, id });
  },

  async addData(sheet, data) {
    return this.request('addData', { sheet, data }, 'POST');
  },

  async updateData(sheet, id, data) {
    return this.request('updateData', { sheet, id, data }, 'POST');
  },

  async deleteData(sheet, id) {
    return this.request('deleteData', { sheet, id }, 'POST');
  },

  // ============ File Upload ============
  async uploadFile(base64Data, filename, folderId) {
    return this.request('uploadFile', {
      fileData: base64Data,
      fileName: filename,
      folderId: folderId || CONFIG.DRIVE_FOLDER_IMAGES
    }, 'POST');
  },

  // ============ Dashboard Data ============
  async getDashboardData(filters = {}) {
    return this.request('getDashboardData', { filters: JSON.stringify(filters) });
  },

  // ============ Reports ============
  async getReportData(filters = {}) {
    return this.request('getReportData', { filters: JSON.stringify(filters) });
  },

  // ============ Demo Data (when API not configured) ============
  getDemoData(action, params) {
    const demo = {
      login: {
        success: true,
        user: {
          id: '1',
          username: 'admin',
          nama: 'Administrator',
          role: 'admin',
          unit: 'UP3 Bali Utara'
        }
      },

      getDashboardData: {
        success: true,
        data: {
          totalAnggaran: 25000000000,
          nilaiKontrak: 23400000000,
          realisasi: 12850000000,
          sisaAnggaran: 11150000000,
          paguTahun: 2026,
          persentaseKontrak: 94,
          persentaseRealisasi: 54.9,
          persentaseSisa: 45.1,
          realisasiBulanan: [
            { bulan: 'Jan', rencana: 1500000000, realisasi: 1200000000 },
            { bulan: 'Feb', rencana: 2000000000, realisasi: 1800000000 },
            { bulan: 'Mar', rencana: 2500000000, realisasi: 2400000000 },
            { bulan: 'Apr', rencana: 3000000000, realisasi: 2800000000 },
            { bulan: 'Mei', rencana: 3500000000, realisasi: 3200000000 },
            { bulan: 'Jun', rencana: 4000000000, realisasi: 3600000000 },
            { bulan: 'Jul', rencana: 5000000000, realisasi: 4500000000 },
            { bulan: 'Agu', rencana: 6000000000, realisasi: 5200000000 },
            { bulan: 'Sep', rencana: 7500000000, realisasi: 0 },
            { bulan: 'Okt', rencana: 8500000000, realisasi: 0 },
            { bulan: 'Nov', rencana: 9500000000, realisasi: 0 },
            { bulan: 'Des', rencana: 10000000000, realisasi: 0 }
          ],
          komposisiAnggaran: [
            { jenis: 'Rehab JTM', nilai: 8000000000, persentase: 32 },
            { jenis: 'Rekonduktor', nilai: 6250000000, persentase: 25 },
            { jenis: 'Ganti Komponen', nilai: 4500000000, persentase: 18 },
            { jenis: 'Perluasan JTM', nilai: 3000000000, persentase: 12 },
            { jenis: 'Lainnya', nilai: 3250000000, persentase: 13 }
          ],
          top5Penyedia: [
            { nama: 'PT. Energi Nusantara', nilai: 5200000000, persentase: 22 },
            { nama: 'PT. Bali Konstruksi', nilai: 4100000000, persentase: 17 },
            { nama: 'PT. Cipta Sarana', nilai: 3850000000, persentase: 16 },
            { nama: 'PT. Teknik Mandiri', nilai: 2900000000, persentase: 12 },
            { nama: 'PT. Guna Karya', nilai: 2350000000, persentase: 10 }
          ],
          statusPekerjaan: {
            selesai: 32,
            on_progress: 45,
            belum_mulai: 28,
            tunda: 10,
            batal: 5,
            total: 120
          },
          notifications: [
            { text: 'Pekerjaan Rehab JTM di Penyabng Tabanan belum ada realisasi', type: 'warning', time: '2 jam lalu' },
            { text: 'Kontrak dengan PT. Bali Konstruksi segera berakhir', type: 'info', time: '1 hari lalu' },
            { text: 'Terdapat sisa anggaran berpotensi dikembalikan', type: 'danger', time: '1 hari lalu' }
          ]
        }
      },

      getData: this.getDemoListData(params)
    };

    return demo[action] || { success: true, data: [] };
  },

  getDemoListData(params) {
    const sheet = params?.sheet;
    const demoData = {
      Pekerjaan: {
        success: true,
        data: [
          { id: '1', nama_pekerjaan: 'Rehab JTM Penyabng Tabanan', jenis_pekerjaan: 'Rehab JTM', lokasi: 'Tabanan', up3: 'Bali Utara', ulp: 'ULP Tabanan', tahun_anggaran: '2026', volume_paket: '5', sumber_anggaran: 'RUPTL/RKAP', status: 'on_progress', created_by: 'admin' },
          { id: '2', nama_pekerjaan: 'Rekonduktor JTM Peny Jodhi', jenis_pekerjaan: 'Rekonduktor', lokasi: 'Singaraja', up3: 'Bali Utara', ulp: 'ULP Singaraja', tahun_anggaran: '2026', volume_paket: '3', sumber_anggaran: 'RUPTL/RKAP', status: 'on_progress', created_by: 'admin' },
          { id: '3', nama_pekerjaan: 'Ganti Komponen TR', jenis_pekerjaan: 'Ganti Komponen', lokasi: 'Negara', up3: 'Bali Utara', ulp: 'ULP Negara', tahun_anggaran: '2026', volume_paket: '2', sumber_anggaran: 'RUPTL/RKAP', status: 'selesai', created_by: 'admin' },
          { id: '4', nama_pekerjaan: 'Perluasan Jaringan', jenis_pekerjaan: 'Perluasan JTM', lokasi: 'Bangli', up3: 'Bali Utara', ulp: 'ULP Bangli', tahun_anggaran: '2026', volume_paket: '1', sumber_anggaran: 'RUPTL/RKAP', status: 'belum_mulai', created_by: 'admin' },
          { id: '5', nama_pekerjaan: 'Pemasangan APP', jenis_pekerjaan: 'Lainnya', lokasi: 'Tabanan', up3: 'Bali Utara', ulp: 'ULP Tabanan', tahun_anggaran: '2026', volume_paket: '4', sumber_anggaran: 'RUPTL/RKAP', status: 'on_progress', created_by: 'admin' }
        ]
      },
      HSMaterial: {
        success: true,
        data: [
          { id: '1', kode: 'MAT-001', uraian: 'Kabel AAACS 240 mm²', satuan: 'km', harga_material: 120000000, harga_jasa: 45000000, kategori: 'Kabel' },
          { id: '2', kode: 'MAT-002', uraian: 'Tiang Beton 12 m', satuan: 'btg', harga_material: 3500000, harga_jasa: 1500000, kategori: 'Tiang' },
          { id: '3', kode: 'MAT-003', uraian: 'Trafo 100 kVA', satuan: 'unit', harga_material: 35000000, harga_jasa: 8000000, kategori: 'Trafo' },
          { id: '4', kode: 'MAT-004', uraian: 'Cross Arm', satuan: 'set', harga_material: 450000, harga_jasa: 150000, kategori: 'Accessories' },
          { id: '5', kode: 'MAT-005', uraian: 'Isolator', satuan: 'buah', harga_material: 250000, harga_jasa: 75000, kategori: 'Accessories' }
        ]
      },
      Penyedia: {
        success: true,
        data: [
          { id: '1', nama_perusahaan: 'PT. Energi Nusantara', alamat: 'Jl. Raya Denpasar No. 45', npwp: '01.234.567.8-901.000', kontak: '0361-123456', email: 'info@energinusantara.co.id', kategori: 'Besar', status: 'active' },
          { id: '2', nama_perusahaan: 'PT. Bali Konstruksi', alamat: 'Jl. Bypass Ngurah Rai No. 88', npwp: '02.345.678.9-012.000', kontak: '0361-234567', email: 'info@balikonstruksi.co.id', kategori: 'Besar', status: 'active' },
          { id: '3', nama_perusahaan: 'PT. Cipta Sarana', alamat: 'Jl. Gatot Subroto No. 12', npwp: '03.456.789.0-123.000', kontak: '0361-345678', email: 'info@ciptasarana.co.id', kategori: 'Menengah', status: 'active' },
          { id: '4', nama_perusahaan: 'PT. Teknik Mandiri', alamat: 'Jl. Diponegoro No. 33', npwp: '04.567.890.1-234.000', kontak: '0361-456789', email: 'info@teknikmandiri.co.id', kategori: 'Menengah', status: 'active' },
          { id: '5', nama_perusahaan: 'PT. Guna Karya', alamat: 'Jl. Imam Bonjol No. 56', npwp: '05.678.901.2-345.000', kontak: '0361-567890', email: 'info@gunakarya.co.id', kategori: 'Kecil', status: 'active' }
        ]
      },
      RAB: {
        success: true,
        data: [
          { id: '1', pekerjaan_id: '1', no_urut: 1, uraian: 'Pasang JTM AAACS 240 mm²', volume: 5.00, satuan: 'km', harga_satuan_material: 120000000, harga_satuan_jasa: 40000000, harga_bagian_material: 600000000, harga_bagian_jasa: 200000000, total_harga: 800000000 },
          { id: '2', pekerjaan_id: '1', no_urut: 2, uraian: 'Pasang Tiang Beton 12 m', volume: 30, satuan: 'btg', harga_satuan_material: 3500000, harga_satuan_jasa: 1500000, harga_bagian_material: 105000000, harga_bagian_jasa: 45000000, total_harga: 150000000 },
          { id: '3', pekerjaan_id: '1', no_urut: 3, uraian: 'Pasang Traverza', volume: 50, satuan: 'set', harga_satuan_material: 1200000, harga_satuan_jasa: 400000, harga_bagian_material: 60000000, harga_bagian_jasa: 20000000, total_harga: 80000000 },
          { id: '4', pekerjaan_id: '1', no_urut: 4, uraian: 'Pasang Isolator', volume: 150, satuan: 'buah', harga_satuan_material: 250000, harga_satuan_jasa: 100000, harga_bagian_material: 37500000, harga_bagian_jasa: 15000000, total_harga: 52500000 },
          { id: '5', pekerjaan_id: '1', no_urut: 5, uraian: 'Pasang Jaringan TR', volume: 3, satuan: 'km', harga_satuan_material: 75000000, harga_satuan_jasa: 25000000, harga_bagian_material: 225000000, harga_bagian_jasa: 75000000, total_harga: 300000000 }
        ]
      },
      Kontrak: {
        success: true,
        data: [
          { id: '1', pekerjaan_id: '1', penyedia_id: '1', nomor_kontrak: 'KTR/001/PLN-BU/2026', tanggal_kontrak: '2026-01-15', nilai_kontrak: 1460000000, masa_pelaksanaan: '180 hari', tanggal_mulai: '2026-02-01', tanggal_selesai: '2026-07-31', status: 'on_progress' },
          { id: '2', pekerjaan_id: '2', penyedia_id: '2', nomor_kontrak: 'KTR/002/PLN-BU/2026', tanggal_kontrak: '2026-02-10', nilai_kontrak: 2100000000, masa_pelaksanaan: '150 hari', tanggal_mulai: '2026-03-01', tanggal_selesai: '2026-07-31', status: 'on_progress' },
          { id: '3', pekerjaan_id: '3', penyedia_id: '3', nomor_kontrak: 'KTR/003/PLN-BU/2026', tanggal_kontrak: '2026-01-20', nilai_kontrak: 350000000, masa_pelaksanaan: '90 hari', tanggal_mulai: '2026-02-01', tanggal_selesai: '2026-05-01', status: 'selesai' }
        ]
      },
      Realisasi: {
        success: true,
        data: [
          { id: '1', kontrak_id: '1', pekerjaan_id: '1', tanggal: '2026-03-15', nilai_realisasi: 350000000, persentase_fisik: 25, keterangan: 'Pemasangan tiang dan kabel selesai 25%', foto_urls: '', lokasi_lat: '-8.4095', lokasi_lng: '115.1889', catatan_progres: 'Cuaca mendukung, progres sesuai jadwal' },
          { id: '2', kontrak_id: '1', pekerjaan_id: '1', tanggal: '2026-05-20', nilai_realisasi: 580000000, persentase_fisik: 60, keterangan: 'Progres pemasangan mencapai 60%', foto_urls: '', lokasi_lat: '-8.4095', lokasi_lng: '115.1889', catatan_progres: 'Pekerjaan berjalan sesuai rencana. Kendala cuaca pada minggu ke-3.' },
          { id: '3', kontrak_id: '2', pekerjaan_id: '2', tanggal: '2026-04-10', nilai_realisasi: 420000000, persentase_fisik: 40, keterangan: 'Rekonduktor JTM 40% selesai', foto_urls: '', lokasi_lat: '-8.1170', lokasi_lng: '115.0889', catatan_progres: 'Material lengkap, pekerja cukup' }
        ]
      },
      Users: {
        success: true,
        data: [
          { id: '1', username: 'admin', nama: 'Administrator', role: 'admin', unit: 'UP3 Bali Utara' },
          { id: '2', username: 'perencanaan1', nama: 'Budi Santoso', role: 'tim_perencanaan', unit: 'UP3 Bali Utara' },
          { id: '3', username: 'pengawas1', nama: 'Made Wirawan', role: 'tim_pengawasan', unit: 'UP3 Bali Utara' },
          { id: '4', username: 'atasan1', nama: 'Ir. Nyoman Surya', role: 'atasan', unit: 'UP3 Bali Utara' }
        ]
      }
    };

    return demoData[sheet] || { success: true, data: [] };
  }
};
