# Panduan Setup & Deploy PLN RAB & Monitoring

Aplikasi ini menggunakan HTML/JS murni di frontend dan Google Sheets sebagai database via Google Apps Script. 

Berikut adalah panduan lengkap dari setup database hingga deploy ke Vercel.

## 1. Setup Database (Google Sheets)

Karena keterbatasan akses, Anda perlu membuat struktur Google Sheet ini secara mandiri di akun Google Drive Anda.

1. Buka folder Google Drive yang Anda berikan: [https://drive.google.com/drive/folders/1zUi12nHqdI9m3xpsx1jwd7Eb_TgSHrQo](https://drive.google.com/drive/folders/1zUi12nHqdI9m3xpsx1jwd7Eb_TgSHrQo)
2. Buat **Google Sheets baru** dengan nama "Database PLN RAB".
3. Buat 9 tab (sheet) dengan nama dan header berikut (baris pertama harus persis seperti ini):

**Sheet 1: `Users`**
- `id` | `username` | `password_hash` | `nama` | `role` | `unit` | `created_at`
- *Isi baris 2 dengan data admin: `1` | `admin` | `admin123` | `Administrator` | `admin` | `UP3 Bali Utara` | (kosong)*

**Sheet 2: `Pekerjaan`**
- `id` | `nama_pekerjaan` | `jenis_pekerjaan` | `pengadaan` | `lokasi` | `up3` | `ulp` | `tahun_anggaran` | `volume_paket` | `sumber_anggaran` | `status` | `created_by` | `created_at`

**Sheet 3: `Kegiatan`**
- `id` | `pengadaan` | `komponen_pekerjaan` | `satuan`

**Sheet 4: `HSMaterial`**
- `id` | `kode` | `uraian` | `satuan` | `harga_material` | `harga_jasa` | `kategori` | `updated_at`

**Sheet 5: `Penyedia`**
- `id` | `nama_perusahaan` | `alamat` | `npwp` | `kontak` | `email` | `kategori` | `status`

**Sheet 6: `RAB`**
- `id` | `pekerjaan_id` | `no_urut` | `uraian` | `volume` | `satuan` | `harga_satuan_material` | `harga_satuan_jasa` | `harga_bagian_material` | `harga_bagian_jasa` | `total_harga` | `created_by` | `created_at`

**Sheet 7: `Kontrak`**
- `id` | `pekerjaan_id` | `penyedia_id` | `nomor_kontrak` | `tanggal_kontrak` | `nilai_kontrak` | `masa_pelaksanaan` | `tanggal_mulai` | `tanggal_selesai` | `status`

**Sheet 8: `Realisasi`**
- `id` | `kontrak_id` | `pekerjaan_id` | `tanggal` | `nilai_realisasi` | `persentase_fisik` | `keterangan` | `foto_urls` | `lokasi_lat` | `lokasi_lng` | `catatan_progres` | `created_by` | `created_at`

**Sheet 9: `Laporan`**
- `id` | `pekerjaan_id` | `periode` | `jenis_laporan` | `data_json` | `created_at`

**Sheet 10: `Settings`**
- `key` | `value`

---

## 2. Deploy Google Apps Script (Backend API)

1. Di Google Sheets yang baru Anda buat, klik menu **Ekstensi > Apps Script**.
2. Hapus semua kode default.
3. Buka file `google-apps-script/Code.gs` dari folder project ini (di Github/lokal Anda), lalu **copy semua isinya** dan paste ke editor Apps Script.
4. Klik icon **Simpan** (Save).
5. Klik tombol biru **Terapkan (Deploy) > Deployment baru**.
6. Pilih jenis: **Aplikasi Web** (Web App).
7. Konfigurasi:
   - Deskripsi: `API PLN RAB v1`
   - Jalankan sebagai: **Saya** (akun email Anda)
   - Siapa yang memiliki akses: **Siapa saja** (Anyone)
8. Klik **Terapkan** (Deploy).
9. Anda mungkin akan diminta **Memberikan Otorisasi** (Authorize Access). 
   - Klik "Authorize Access".
   - Pilih akun Google Anda.
   - Jika muncul peringatan keamanan, klik "Lanjutan" (Advanced) lalu "Buka proyek (tidak aman)".
   - Klik "Izinkan".
10. Setelah berhasil, Anda akan mendapatkan **URL Aplikasi Web** (URL Web App). **Copy URL ini**.

---

## 3. Konfigurasi Frontend

1. Buka file `js/config.js` di dalam folder project frontend.
2. Cari variabel `API_URL` (baris 8).
3. Ganti `'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'` dengan URL Aplikasi Web yang Anda copy dari langkah 2.
   ```javascript
   API_URL: 'https://script.google.com/macros/s/xxxxxxxxx/exec',
   ```
4. Pastikan `DRIVE_FOLDER_IMAGES` sudah diatur ke `1bqNDBJkAjfU1w30XZE_qua8GXC2h9LGd` (sudah saya set).

---

## 4. Deploy ke Github & Vercel

### Upload ke Github
1. Buka akun Github Anda (buat jika belum punya).
2. Buat repository baru (misal: `pln-rab-monitoring`).
3. Upload semua file yang ada di folder `f:\RAB DAN MONITORING PLN` (kecuali folder google-apps-script jika tidak ingin dipublish) ke repository tersebut.

### Deploy ke Vercel
1. Buka [vercel.com](https://vercel.com) dan login menggunakan akun Github Anda.
2. Klik tombol **Add New...** > **Project**.
3. Cari repository `pln-rab-monitoring` Anda dan klik **Import**.
4. Biarkan pengaturan default (Framework Preset: Other).
5. Klik **Deploy**.
6. Tunggu beberapa detik, aplikasi Anda kini sudah online!

### Catatan Penting
Saat ini frontend dilengkapi dengan **Data Demo (Mock Data)**. Jika API Apps Script belum diatur (URL masih `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE`), aplikasi akan otomatis menggunakan data demo sehingga tetap terlihat keren dan fungsional seperti gambar contoh!
