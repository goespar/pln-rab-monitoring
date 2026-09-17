// ============================================
// PLN RAB & Monitoring - Utility Functions
// ============================================

const Utils = {
  // Format currency to Indonesian Rupiah
  formatCurrency(value, short = false) {
    const num = parseFloat(value) || 0;
    if (short) {
      if (num >= 1e12) return `Rp ${(num / 1e12).toFixed(2)} T`;
      if (num >= 1e9) return `Rp ${(num / 1e9).toFixed(2)} M`;
      if (num >= 1e6) return `Rp ${(num / 1e6).toFixed(2)} Jt`;
      if (num >= 1e3) return `Rp ${(num / 1e3).toFixed(0)} Rb`;
    }
    return new Intl.NumberFormat(CONFIG.CURRENCY_FORMAT, {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  },

  // Format number with separators
  formatNumber(value) {
    return new Intl.NumberFormat(CONFIG.CURRENCY_FORMAT).format(parseFloat(value) || 0);
  },

  // Short currency for cards (Rp 25,00 M)
  formatShortCurrency(value) {
    const num = parseFloat(value) || 0;
    if (num >= 1e9) return `Rp ${(num / 1e6).toFixed(2).replace('.', ',')} M`;
    if (num >= 1e6) return `Rp ${(num / 1e6).toFixed(2).replace('.', ',')} Jt`;
    return this.formatCurrency(num);
  },

  // Parse currency string to number
  parseCurrency(str) {
    if (typeof str === 'number') return str;
    return parseFloat(String(str).replace(/[^\d.-]/g, '')) || 0;
  },

  // Format date
  formatDate(dateStr, format = 'short') {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const options = format === 'long' 
      ? { day: 'numeric', month: 'long', year: 'numeric' }
      : { day: '2-digit', month: '2-digit', year: 'numeric' };
    
    return date.toLocaleDateString(CONFIG.DATE_FORMAT, options);
  },

  // Format date-time
  formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString(CONFIG.DATE_FORMAT, {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },

  // Time ago
  timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return this.formatDate(dateStr);
  },

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  // Debounce function
  debounce(func, wait = 300) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  // Throttle function
  throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Get query parameter
  getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  // Set query parameters
  setUrlParams(params) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    });
    window.history.replaceState({}, '', url);
  },

  // Deep clone object
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // Truncate text
  truncate(str, maxLen = 50) {
    if (!str) return '';
    return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
  },

  // Capitalize first letter
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  },

  // Validate email
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Get status badge HTML
  getStatusBadge(status) {
    const statusMap = {
      'selesai': { label: 'Selesai', class: 'selesai' },
      'on_progress': { label: 'On Progress', class: 'on-progress' },
      'belum_mulai': { label: 'Belum Mulai', class: 'belum-mulai' },
      'tunda': { label: 'Tunda', class: 'tunda' },
      'batal': { label: 'Batal', class: 'batal' },
      'draft': { label: 'Draft', class: 'draft' },
      'review': { label: 'Review', class: 'review' },
      'approved': { label: 'Approved', class: 'selesai' },
      'rejected': { label: 'Rejected', class: 'batal' }
    };
    const s = statusMap[status] || { label: status, class: 'draft' };
    return `<span class="badge-status ${s.class}">${s.label}</span>`;
  },

  // Get progress color
  getProgressColor(percentage) {
    if (percentage >= 80) return 'success';
    if (percentage >= 40) return '';
    if (percentage >= 20) return 'warning';
    return 'danger';
  },

  // Number to words (Indonesian)
  terbilang(angka) {
    const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
    
    angka = Math.floor(Math.abs(angka));
    
    if (angka < 12) return satuan[angka];
    if (angka < 20) return this.terbilang(angka - 10) + ' belas';
    if (angka < 100) return this.terbilang(Math.floor(angka / 10)) + ' puluh' + (angka % 10 ? ' ' + this.terbilang(angka % 10) : '');
    if (angka < 200) return 'seratus' + (angka - 100 ? ' ' + this.terbilang(angka - 100) : '');
    if (angka < 1000) return this.terbilang(Math.floor(angka / 100)) + ' ratus' + (angka % 100 ? ' ' + this.terbilang(angka % 100) : '');
    if (angka < 2000) return 'seribu' + (angka - 1000 ? ' ' + this.terbilang(angka - 1000) : '');
    if (angka < 1e6) return this.terbilang(Math.floor(angka / 1000)) + ' ribu' + (angka % 1000 ? ' ' + this.terbilang(angka % 1000) : '');
    if (angka < 1e9) return this.terbilang(Math.floor(angka / 1e6)) + ' juta' + (angka % 1e6 ? ' ' + this.terbilang(angka % 1e6) : '');
    if (angka < 1e12) return this.terbilang(Math.floor(angka / 1e9)) + ' milyar' + (angka % 1e9 ? ' ' + this.terbilang(angka % 1e9) : '');
    if (angka < 1e15) return this.terbilang(Math.floor(angka / 1e12)) + ' triliun' + (angka % 1e12 ? ' ' + this.terbilang(angka % 1e12) : '');
    return '';
  },

  // Format terbilang
  formatTerbilang(angka) {
    const result = this.terbilang(angka);
    return result ? result.charAt(0).toUpperCase() + result.slice(1) + ' Rupiah' : 'Nol Rupiah';
  },

  // Calculate percentage
  percentage(value, total) {
    if (!total) return 0;
    return Math.round((value / total) * 100 * 10) / 10;
  },

  // Show toast notification
  showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer') || this.createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="lucide" data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : type === 'warning' ? 'alert-triangle' : 'info'}"></i>
      <span>${message}</span>
      <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
    `;
    
    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  },

  // Show loading overlay
  showLoading(message = 'Memuat data...') {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loadingOverlay';
      overlay.className = 'loading-overlay';
      overlay.innerHTML = `<div class="spinner"></div><div class="loading-text">${message}</div>`;
      document.body.appendChild(overlay);
    }
    overlay.querySelector('.loading-text').textContent = message;
    overlay.style.display = 'flex';
  },

  // Hide loading overlay
  hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
  },

  // Confirm dialog
  confirm(message) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay active';
      overlay.innerHTML = `
        <div class="modal" style="max-width:400px">
          <div class="modal-header">
            <h3>Konfirmasi</h3>
          </div>
          <div class="modal-body">
            <p style="font-size:14px;color:var(--text-secondary)">${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="confirmNo">Batal</button>
            <button class="btn btn-primary" id="confirmYes">Ya, Lanjutkan</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      
      overlay.querySelector('#confirmNo').onclick = () => { overlay.remove(); resolve(false); };
      overlay.querySelector('#confirmYes').onclick = () => { overlay.remove(); resolve(true); };
    });
  },

  // Export table to CSV
  exportToCSV(data, filename) {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  },

  // Currency input formatting
  setupCurrencyInput(input) {
    input.addEventListener('input', function() {
      let value = this.value.replace(/[^\d]/g, '');
      if (value) {
        this.value = new Intl.NumberFormat('id-ID').format(parseInt(value));
      }
    });
  }
};
