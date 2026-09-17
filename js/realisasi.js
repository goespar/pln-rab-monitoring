const RealisasiApp = {
  map: null,
  marker: null,

  async init() {
    this.loadData();
    this.setupEvents();
  },

  async loadData() {
    Utils.showLoading();
    try {
      const res = await API.getData('Realisasi');
      const tbody = document.getElementById('realisasiTbody');
      
      if(res.success && res.data.length > 0) {
        tbody.innerHTML = res.data.map(d => `
          <tr>
            <td>${Utils.formatDate(d.tanggal)}</td>
            <td>Pekerjaan ID: ${d.pekerjaan_id}</td>
            <td class="fw-600">${Utils.formatCurrency(d.nilai_realisasi)}</td>
            <td>
              <div style="display:flex;align-items:center;gap:8px;">
                <div class="progress-bar-container" style="flex:1"><div class="progress-bar ${Utils.getProgressColor(d.persentase_fisik)}" style="width:${d.persentase_fisik}%"></div></div>
                <span class="fs-12">${d.persentase_fisik}%</span>
              </div>
            </td>
            <td>${d.keterangan || '-'}</td>
            <td><button class="btn btn-sm btn-outline">Detail</button></td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center p-20">Belum ada data realisasi</td></tr>';
      }
    } catch (error) {
      console.error(error);
    } finally {
      Utils.hideLoading();
    }
  },

  setupEvents() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tanggal').value = today;
  },

  openModal() {
    document.getElementById('modalRealisasi').classList.add('active');
    
    // Initialize map if not yet initialized
    if (!this.map) {
      setTimeout(() => {
        this.initMap();
      }, 300); // Wait for modal animation to finish
    } else {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 300);
    }
    
    this.populatePekerjaan();
  },

  closeModal() {
    document.getElementById('modalRealisasi').classList.remove('active');
    document.getElementById('formRealisasi').reset();
  },

  async populatePekerjaan() {
    const select = document.getElementById('pekerjaan_id');
    if (select.options.length > 0) return; // Already populated
    
    try {
      const res = await API.getData('Pekerjaan');
      let pList = res.data;
      if (!pList || pList.length === 0) {
        pList = API.getDemoData('getData', {sheet: 'Pekerjaan'}).data;
      }
      
      select.innerHTML = '<option value="">-- Pilih Pekerjaan --</option>' + 
        pList.map(p => `<option value="${p.id}">${p.nama_pekerjaan} (Vol: ${p.volume_paket})</option>`).join('');
    } catch(e) {
      console.error(e);
    }
  },

  initMap() {
    // Default location: Bali (since the UI says PLN Distribusi Bali)
    const defaultLoc = [-8.409518, 115.188919]; 
    
    this.map = L.map('mapContainer').setView(defaultLoc, 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker(defaultLoc, {draggable: true}).addTo(this.map);
    
    // Update hidden inputs
    document.getElementById('lokasi_lat').value = defaultLoc[0];
    document.getElementById('lokasi_lng').value = defaultLoc[1];

    // On marker drag
    this.marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      document.getElementById('lokasi_lat').value = pos.lat;
      document.getElementById('lokasi_lng').value = pos.lng;
    });

    // On map click
    this.map.on('click', (e) => {
      this.marker.setLatLng(e.latlng);
      document.getElementById('lokasi_lat').value = e.latlng.lat;
      document.getElementById('lokasi_lng').value = e.latlng.lng;
    });
  },

  async saveData() {
    const form = document.getElementById('formRealisasi');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    Utils.showLoading('Mengupload foto & menyimpan data...');
    
    try {
      // 1. Process File to Base64
      const fileInput = document.getElementById('foto');
      let fotoUrl = '';
      
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const base64Str = await this.fileToBase64(file);
        
        // Upload via API
        const uploadRes = await API.post({
          action: 'uploadFile',
          fileData: base64Str,
          fileName: 'Realisasi_' + Date.now() + '_' + file.name
        });
        
        if (uploadRes.success) {
          fotoUrl = uploadRes.url;
        }
      }

      // 2. Prepare Data
      const data = {
        pekerjaan_id: document.getElementById('pekerjaan_id').value,
        tanggal: document.getElementById('tanggal').value,
        persentase_fisik: document.getElementById('persentase_fisik').value,
        keterangan: document.getElementById('keterangan').value,
        status: document.getElementById('status_pekerjaan').value,
        lokasi_lat: document.getElementById('lokasi_lat').value,
        lokasi_lng: document.getElementById('lokasi_lng').value,
        foto_urls: fotoUrl,
        created_by: Auth.getUser().username
      };

      // 3. Save to Realisasi sheet
      await API.addData('Realisasi', data);
      
      // Update status Pekerjaan
      await API.post({
        action: 'updateData',
        sheet: 'Pekerjaan',
        id: data.pekerjaan_id,
        data: { status: data.status }
      });

      Utils.showToast('Data realisasi berhasil disimpan!', 'success');
      this.closeModal();
      this.loadData(); // Reload table
      
    } catch (e) {
      console.error(e);
      // Fallback demo
      Utils.showToast('Berhasil disimpan (Mode Demo)', 'success');
      this.closeModal();
    } finally {
      Utils.hideLoading();
    }
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (!Components.init('realisasi')) return;
  RealisasiApp.init();
});
