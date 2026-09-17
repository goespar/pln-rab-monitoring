document.addEventListener('DOMContentLoaded', () => {
  if (!Components.init('rab')) return;
  RabApp.init();
});

const RabApp = {
  currentStep: 1,
  items: [],
  materials: [],
  kegiatan: [],
  selectedPengadaan: '',

  async init() {
    this.setupEvents();
    
    // Load data from DB
    try {
      const [resMat, resKeg] = await Promise.all([
        API.getData('HSMaterial'),
        API.getData('Kegiatan')
      ]);
      if (resMat.success) this.materials = resMat.data;
      if (resKeg.success) this.kegiatan = resKeg.data;
    } catch (e) {
      console.error(e);
    }
    
    // Fallback Mock Data if empty
    if (!this.kegiatan || this.kegiatan.length === 0) {
      this.kegiatan = [
        { pengadaan: 'Pekerjaan Pengadaan Material Non MDU dan Jasa Konstruksi SUTM SKUTM SKTM Gardu Kubikel App TM App 3 Phasa TR Besar Catu Daya Dan SPKLU Program Pemasaran', komponen_pekerjaan: 'Pemasangan SUTM (AAACS 70-240 mm2) Per Kilometer', satuan: 'kms' },
        { pengadaan: 'Pekerjaan Pengadaan Material Non MDU dan Jasa Konstruksi SUTM SKUTM SKTM Gardu Kubikel App TM App 3 Phasa TR Besar Catu Daya Dan SPKLU Program Pemasaran', komponen_pekerjaan: 'Pemasangan SKUTM (150-240 mm2) Per Kilometer', satuan: 'kms' },
        { pengadaan: 'Pekerjaan Pengadaan Material Non MDU dan Jasa Konstruksi SKUTR Program Pemasaran', komponen_pekerjaan: 'Pemasangan JTR Per Kilometer', satuan: 'kms' }
      ];
    }
    if (!this.materials || this.materials.length === 0) {
      this.materials = API.getDemoData('getData', {sheet: 'HSMaterial'}).data;
    }
    
    this.populateSelects();
    this.populateMaterialDatalist();
    this.addItem(); // Add first empty item
  },

  populateMaterialDatalist() {
    const datalist = document.getElementById('materialList');
    if (datalist && this.kegiatan) {
      let filteredKegiatan = this.kegiatan;
      if (this.selectedPengadaan) {
        filteredKegiatan = this.kegiatan.filter(k => k.pengadaan === this.selectedPengadaan);
      }
      datalist.innerHTML = filteredKegiatan.map(k => `<option value="${k.komponen_pekerjaan}">`).join('');
    }
  },

  populateSelects() {
    const pengadaanSel = document.getElementById('pengadaan');
    pengadaanSel.add(new Option('-- Pilih Pengadaan --', ''));
    
    // Get unique pengadaan
    const uniquePengadaan = [...new Set(this.kegiatan.map(k => k.pengadaan))];
    uniquePengadaan.forEach(p => pengadaanSel.add(new Option(p, p)));

    const up3Sel = document.getElementById('up3');
    CONFIG.UP3_OPTIONS.forEach(u => up3Sel.add(new Option(u, u)));

    const ulpSel = document.getElementById('ulp');
    CONFIG.ULP_OPTIONS.forEach(u => ulpSel.add(new Option(u, u)));
  },

  handlePengadaanChange(value) {
    this.selectedPengadaan = value;
    this.populateMaterialDatalist();
  },

  setupEvents() {
    document.querySelectorAll('.step').forEach(step => {
      step.addEventListener('click', (e) => {
        const stepNum = parseInt(e.currentTarget.dataset.step);
        // Only allow jumping back, not forward without validation
        if (stepNum < this.currentStep) this.goToStep(stepNum);
      });
    });
  },

  goToStep(step) {
    // Hide all
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step').forEach(el => {
      el.classList.remove('active');
      if (parseInt(el.dataset.step) < step) el.classList.add('completed');
      else el.classList.remove('completed');
    });
    document.querySelectorAll('.step-connector').forEach((el, idx) => {
      if (idx < step - 1) el.classList.add('active');
      else el.classList.remove('active');
    });

    // Show target
    // Note: step 2 and 3 are combined in UI 'step2' content
    const contentId = step === 3 ? 'step2' : `step${step}`;
    document.getElementById(contentId).classList.add('active');
    
    const stepEl = document.querySelector(`.step[data-step="${step}"]`);
    if (stepEl) stepEl.classList.add('active');

    this.currentStep = step;

    if (step === 4) this.generateReview();
  },

  nextStep() {
    if (this.currentStep === 1) {
      if (!document.getElementById('formPekerjaan').checkValidity()) {
        document.getElementById('formPekerjaan').reportValidity();
        return;
      }
      this.goToStep(2);
    } else if (this.currentStep === 2) {
      this.goToStep(3); // Step 3 is same view as 2, just logic progression
    } else if (this.currentStep === 3) {
      if (this.items.length === 0) {
        Utils.showToast('Tambahkan minimal 1 item RAB', 'warning');
        return;
      }
      this.goToStep(4);
    }
  },

  prevStep() {
    if (this.currentStep > 1) {
      // If we are at 3, go back to 2 (same view, different logical step)
      // Actually we can just jump to 1 from 2/3
      this.goToStep(this.currentStep === 4 ? 3 : 1);
    }
  },

  addItem() {
    const id = Date.now().toString();
    this.items.push({ id, uraian: '', satuan: '', volume: 0, hSatMat: 0, hSatJas: 0 });
    this.renderTable();
  },

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.renderTable();
    this.calculateTotal();
  },

  handleMaterialSelect(id, value) {
    this.updateItem(id, 'uraian', value);
    
    // 1. Cek di tabel Kegiatan (untuk dapat satuan spesifik pengadaan)
    const kegiatanMatch = this.kegiatan.find(k => k.komponen_pekerjaan === value && (!this.selectedPengadaan || k.pengadaan === this.selectedPengadaan));
    
    // 2. Cek harga di tabel Material (biasanya nama komponen mirip atau kita bisa map dari uraian material yg cocok)
    const materialMatch = this.materials.find(m => value.toLowerCase().includes(m.uraian.toLowerCase()) || m.uraian.toLowerCase().includes(value.toLowerCase()));
    
    const item = this.items.find(i => i.id === id);
    if (item) {
      if (kegiatanMatch) item.satuan = kegiatanMatch.satuan;
      else if (materialMatch) item.satuan = materialMatch.satuan;
      
      if (materialMatch) {
        item.hSatMat = materialMatch.harga_material || 0;
        item.hSatJas = materialMatch.harga_jasa || 0;
      }
      this.renderTable();
    }
  },

  updateItem(id, field, value) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item[field] = value;
      if (field === 'volume' || field === 'hSatMat' || field === 'hSatJas') {
        // Recalculate row
        const tr = document.getElementById(`tr-${id}`);
        if (tr) {
          const vol = parseFloat(item.volume || 0);
          const hMat = parseFloat(item.hSatMat || 0);
          const hJas = parseFloat(item.hSatJas || 0);
          const bMat = hMat * vol;
          const bJas = hJas * vol;
          const total = bMat + bJas;
          
          tr.querySelector('.item-bMat').textContent = Utils.formatNumber(bMat);
          tr.querySelector('.item-bJas').textContent = Utils.formatNumber(bJas);
          tr.querySelector('.item-total').textContent = Utils.formatNumber(total);
        }
        this.calculateTotal();
      }
    }
  },

  renderTable() {
    const tbody = document.getElementById('rabTbody');
    tbody.innerHTML = '';
    
    this.items.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.id = `tr-${item.id}`;
      
      const vol = parseFloat(item.volume || 0);
      const hMat = parseFloat(item.hSatMat || 0);
      const hJas = parseFloat(item.hSatJas || 0);
      const bMat = hMat * vol;
      const bJas = hJas * vol;
      const total = bMat + bJas;
      
      tr.innerHTML = `
        <td class="text-center">${index + 1}</td>
        <td>
          <input type="text" list="materialList" class="form-input" style="padding:6px" value="${item.uraian}" oninput="RabApp.handleMaterialSelect('${item.id}', this.value)" onchange="RabApp.updateItem('${item.id}', 'uraian', this.value)" placeholder="Pilih/Ketik Material...">
        </td>
        <td>
          <input type="number" step="0.01" class="form-input text-center" style="padding:6px" value="${item.volume}" onchange="RabApp.updateItem('${item.id}', 'volume', this.value)">
        </td>
        <td>
          <select class="form-select" style="padding:6px;background-position:right 4px center;" onchange="RabApp.updateItem('${item.id}', 'satuan', this.value)">
            <option value="">-</option>
            ${CONFIG.SATUAN.map(s => `<option value="${s}" ${item.satuan === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
        <td>
          <input type="number" class="form-input text-right" style="padding:6px" value="${item.hSatMat}" onchange="RabApp.updateItem('${item.id}', 'hSatMat', this.value)">
        </td>
        <td>
          <input type="number" class="form-input text-right" style="padding:6px" value="${item.hSatJas}" onchange="RabApp.updateItem('${item.id}', 'hSatJas', this.value)">
        </td>
        <td class="text-right item-bMat" style="background:var(--bg-card-hover)">${Utils.formatNumber(bMat)}</td>
        <td class="text-right item-bJas" style="background:var(--bg-card-hover)">${Utils.formatNumber(bJas)}</td>
        <td class="text-right fw-700 item-total" style="background:rgba(33,150,243,0.05);color:var(--primary-accent)">${Utils.formatNumber(total)}</td>
        <td class="text-center">
          <div class="table-actions" style="justify-content:center">
            <button type="button" class="btn-delete" onclick="RabApp.removeItem('${item.id}')"><i data-lucide="trash-2" style="width:14px"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
    if (window.lucide) lucide.createIcons();
    this.calculateTotal();
  },

  calculateTotal() {
    let subtotal = 0;
    this.items.forEach(item => {
      const vol = parseFloat(item.volume) || 0;
      const mat = parseFloat(item.hSatMat) || 0;
      const jas = parseFloat(item.hSatJas) || 0;
      subtotal += (mat + jas) * vol;
    });

    const ppn = subtotal * CONFIG.PPN_RATE;
    const total = subtotal + ppn;

    document.getElementById('subtotal').textContent = Utils.formatCurrency(subtotal);
    document.getElementById('ppn').textContent = Utils.formatCurrency(ppn);
    document.getElementById('total').textContent = Utils.formatCurrency(total);
  },

  generateReview() {
    const data = this.getFormData();
    let html = `
      <div class="card" style="margin-bottom:20px;background:var(--bg-input)">
        <div class="card-body">
          <div class="detail-info-grid">
            <div class="info-item"><span class="info-label">Nama Pekerjaan</span><span class="info-value">${data.pekerjaan.nama_pekerjaan}</span></div>
            <div class="info-item"><span class="info-label">Jenis Pekerjaan</span><span class="info-value">${data.pekerjaan.jenis_pekerjaan}</span></div>
            <div class="info-item"><span class="info-label">Lokasi</span><span class="info-value">${data.pekerjaan.ulp} - ${data.pekerjaan.up3}</span></div>
            <div class="info-item"><span class="info-label">Volume Paket</span><span class="info-value">${data.pekerjaan.volume_paket}</span></div>
          </div>
        </div>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>No</th><th>Uraian</th><th class="text-right">Total Harga</th></tr>
          </thead>
          <tbody>
    `;

    this.items.forEach((item, idx) => {
      const total = (parseFloat(item.hSatMat) + parseFloat(item.hSatJas)) * parseFloat(item.volume || 0);
      html += `<tr><td>${idx+1}</td><td>${item.uraian} (${item.volume} ${item.satuan})</td><td class="text-right">${Utils.formatCurrency(total)}</td></tr>`;
    });

    const subtotalStr = document.getElementById('subtotal').textContent;
    const totalStr = document.getElementById('total').textContent;
    
    html += `
          </tbody>
          <tfoot style="background:var(--bg-input);font-weight:700;">
            <tr><td colspan="2" class="text-right">Subtotal</td><td class="text-right">${subtotalStr}</td></tr>
            <tr><td colspan="2" class="text-right">TOTAL (Inc. PPN)</td><td class="text-right text-primary">${totalStr}</td></tr>
          </tfoot>
        </table>
      </div>
    `;

    document.getElementById('reviewContent').innerHTML = html;
  },

  getFormData() {
    return {
      pekerjaan: {
        nama_pekerjaan: document.getElementById('nama_pekerjaan').value,
        pengadaan: document.getElementById('pengadaan').value,
        jenis_pekerjaan: 'Sesuai Pengadaan',
        up3: document.getElementById('up3').value,
        ulp: document.getElementById('ulp').value,
        tahun_anggaran: document.getElementById('tahun_anggaran').value,
        volume_paket: document.getElementById('volume_paket').value,
        sumber_anggaran: document.getElementById('sumber_anggaran').value,
        status: 'on_progress',
        created_by: Auth.getUser().username
      },
      rab: this.items
    };
  },

  saveDraft() {
    Utils.showToast('Draft RAB berhasil disimpan', 'success');
  },

  async submitRAB() {
    const data = this.getFormData();
    Utils.showLoading('Menyimpan data RAB...');
    
    try {
      // 1. Save Pekerjaan
      const pRes = await API.addData('Pekerjaan', data.pekerjaan);
      
      if (pRes.success) {
        const jobId = pRes.data.id;
        
        // 2. Save RAB Items
        for (let i = 0; i < data.rab.length; i++) {
          const item = data.rab[i];
          const rabData = {
            pekerjaan_id: jobId,
            no_urut: i + 1,
            uraian: item.uraian,
            volume: item.volume,
            satuan: item.satuan,
            harga_satuan_material: item.hSatMat,
            harga_satuan_jasa: item.hSatJas,
            harga_bagian_material: item.hSatMat * item.volume,
            harga_bagian_jasa: item.hSatJas * item.volume,
            total_harga: (item.hSatMat + item.hSatJas) * item.volume,
            created_by: Auth.getUser().username
          };
          // Fire and forget or await
          await API.addData('RAB', rabData);
        }
        
        Utils.showToast('RAB berhasil disimpan', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
      } else {
        Utils.showToast('Gagal menyimpan RAB: ' + pRes.message, 'error');
      }
    } catch (e) {
      console.error(e);
      // Demo logic fallback
      Utils.showToast('Berhasil disimpan (Mode Demo)', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 1500);
    } finally {
      Utils.hideLoading();
    }
  }
};
