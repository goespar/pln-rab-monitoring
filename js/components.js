// ============================================
// PLN RAB & Monitoring - Reusable Components
// Sidebar, Header, Modal, etc.
// ============================================

const Components = {
  // Current active page
  currentPage: '',

  // Initialize page layout
  init(pageName) {
    this.currentPage = pageName;
    if (!Auth.requireAuth()) return false;
    
    this.renderSidebar();
    this.renderHeader(pageName);
    this.applyRoleRestrictions();
    
    // Initialize icons
    if (window.lucide) lucide.createIcons();
    
    // Setup mobile menu
    this.setupMobileMenu();
    
    return true;
  },

  // Render sidebar
  renderSidebar() {
    const user = Auth.getUser();
    const role = user ? user.role : '';
    
    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', href: 'dashboard.html' },
      { id: 'rab', label: 'RAB', icon: 'file-text', href: 'rab.html' },
      { id: 'realisasi', label: 'Realisasi', icon: 'bar-chart-3', href: 'realisasi.html' },
      { id: 'kontrak', label: 'Kontrak', icon: 'file-check', href: 'kontrak.html' },
      { id: 'material', label: 'Material', icon: 'package', href: 'material.html' },
      { id: 'penyedia', label: 'Penyedia', icon: 'building-2', href: 'penyedia.html' },
      { divider: true },
      { id: 'laporan', label: 'Laporan', icon: 'pie-chart', href: 'laporan.html' },
      { divider: true },
      { id: 'pengaturan', label: 'Pengaturan', icon: 'settings', href: 'pengaturan.html' }
    ];

    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-logo">⚡</div>
        <div class="sidebar-brand">
          <h2>PLN</h2>
          <span>RAB & Monitoring</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${menuItems.map(item => {
          if (item.divider) return '<div class="nav-divider"></div>';
          
          // Check role access
          const hasAccess = CONFIG.MENU_ACCESS[item.id] ? CONFIG.MENU_ACCESS[item.id].includes(role) : true;
          if (!hasAccess) return '';
          
          const isActive = this.currentPage === item.id;
          return `
            <a href="${item.href}" class="nav-item ${isActive ? 'active' : ''}" data-page="${item.id}">
              <i data-lucide="${item.icon}"></i>
              <span class="nav-label">${item.label}</span>
            </a>
          `;
        }).join('')}
      </nav>
      <div class="sidebar-footer">
        <small>© 2026 PLN RAB & Monitoring v${CONFIG.APP_VERSION}</small>
      </div>
    `;
  },

  // Render header
  renderHeader(pageName) {
    const user = Auth.getUser();
    const pageInfo = this.getPageInfo(pageName);
    
    const header = document.getElementById('header');
    if (!header) return;

    header.innerHTML = `
      <div class="header-left">
        <button class="menu-toggle" id="menuToggle" onclick="Components.toggleSidebar()">
          <i data-lucide="menu"></i>
        </button>
        <div class="page-title">
          <h1>${pageInfo.title}</h1>
          <span>${pageInfo.subtitle}</span>
        </div>
      </div>
      <div class="header-filters" id="headerFilters">
        <div class="filter-group">
          <span class="filter-label">Tahun</span>
          <select class="filter-select" id="filterTahun">
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">UP3</span>
          <select class="filter-select" id="filterUP3">
            <option value="">Semua</option>
            ${CONFIG.UP3_OPTIONS.map(u => `<option value="${u}">${u}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">ULP</span>
          <select class="filter-select" id="filterULP">
            <option value="">Semua</option>
            ${CONFIG.ULP_OPTIONS.map(u => `<option value="${u}">${u}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">Status</span>
          <select class="filter-select" id="filterStatus">
            <option value="">Semua</option>
            ${CONFIG.STATUS_PEKERJAAN.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="header-right">
        <div class="header-notification" onclick="Components.showNotifications()">
          <i data-lucide="bell"></i>
          <span class="badge">3</span>
        </div>
        <div class="user-profile" onclick="Components.showUserMenu()">
          <div class="user-info">
            <div class="user-name">${user ? user.nama : 'User'}</div>
            <div class="user-role">${user ? (CONFIG.ROLE_LABELS[user.role] || user.role) : ''}</div>
          </div>
          <div class="user-avatar">${Auth.getInitials()}</div>
        </div>
      </div>
    `;
  },

  // Get page info
  getPageInfo(pageName) {
    const pages = {
      'dashboard': { title: 'Dashboard', subtitle: 'Ringkasan pelaksanaan pekerjaan dan anggaran' },
      'rab': { title: 'RAB', subtitle: 'Penyusunan Rencana Anggaran Biaya' },
      'kontrak': { title: 'Kontrak', subtitle: 'Manajemen kontrak pekerjaan' },
      'realisasi': { title: 'Realisasi', subtitle: 'Input dan monitoring realisasi pekerjaan' },
      'laporan': { title: 'Laporan & Monitoring', subtitle: 'Realisasi fisik, keuangan dan progres pekerjaan' },
      'material': { title: 'Master Material', subtitle: 'Data harga satuan material dan jasa' },
      'penyedia': { title: 'Data Penyedia', subtitle: 'Manajemen data penyedia/kontraktor' },
      'detail-pekerjaan': { title: 'Detail Pekerjaan', subtitle: 'Informasi lengkap progres pekerjaan' },
      'pengaturan': { title: 'Pengaturan', subtitle: 'Konfigurasi sistem dan manajemen pengguna' }
    };
    return pages[pageName] || { title: pageName, subtitle: '' };
  },

  // Mobile menu toggle
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  },

  // Setup mobile menu
  setupMobileMenu() {
    // Create overlay if not exists
    if (!document.getElementById('sidebarOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'sidebarOverlay';
      overlay.className = 'sidebar-overlay';
      overlay.onclick = () => this.toggleSidebar();
      document.body.appendChild(overlay);
    }
  },

  // Apply role restrictions
  applyRoleRestrictions() {
    const role = Auth.getRole();
    document.querySelectorAll('[data-roles]').forEach(el => {
      const allowedRoles = el.dataset.roles.split(',');
      if (!allowedRoles.includes(role)) {
        el.style.display = 'none';
      }
    });
  },

  // Show user menu
  showUserMenu() {
    const user = Auth.getUser();
    const existing = document.getElementById('userMenu');
    if (existing) { existing.remove(); return; }

    const menu = document.createElement('div');
    menu.id = 'userMenu';
    menu.style.cssText = `
      position: fixed; top: 60px; right: 20px; background: white;
      border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      padding: 8px; min-width: 200px; z-index: 10000;
      animation: fadeInDown 0.2s ease;
    `;
    menu.innerHTML = `
      <div style="padding: 12px 16px; border-bottom: 1px solid #E2E8F0;">
        <div style="font-weight:600; font-size:14px;">${user.nama}</div>
        <div style="font-size:12px; color:#A0AEC0;">${CONFIG.ROLE_LABELS[user.role] || user.role}</div>
        <div style="font-size:11px; color:#A0AEC0;">${user.unit || ''}</div>
      </div>
      <a href="pengaturan.html" style="display:flex; align-items:center; gap:8px; padding:10px 16px; font-size:13px; color:#4A5568; border-radius:8px; cursor:pointer; transition:background 0.15s;" onmouseover="this.style.background='#F0F4F8'" onmouseout="this.style.background='transparent'">
        <i data-lucide="settings" style="width:16px;height:16px;"></i> Pengaturan
      </a>
      <div onclick="Auth.logout()" style="display:flex; align-items:center; gap:8px; padding:10px 16px; font-size:13px; color:#F44336; border-radius:8px; cursor:pointer; transition:background 0.15s;" onmouseover="this.style.background='#FFEBEE'" onmouseout="this.style.background='transparent'">
        <i data-lucide="log-out" style="width:16px;height:16px;"></i> Logout
      </div>
    `;
    document.body.appendChild(menu);
    if (window.lucide) lucide.createIcons();

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && !e.target.closest('.user-profile')) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 100);
  },

  // Show notifications panel
  showNotifications() {
    const existing = document.getElementById('notifPanel');
    if (existing) { existing.remove(); return; }

    const panel = document.createElement('div');
    panel.id = 'notifPanel';
    panel.style.cssText = `
      position: fixed; top: 60px; right: 80px; background: white;
      border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      width: 350px; z-index: 10000; animation: fadeInDown 0.2s ease;
    `;
    panel.innerHTML = `
      <div style="padding: 16px 20px; border-bottom: 1px solid #E2E8F0; display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:14px; font-weight:600;">Notifikasi</h3>
        <span style="font-size:12px; color:#2196F3; cursor:pointer;">Tandai semua dibaca</span>
      </div>
      <div style="max-height:300px; overflow-y:auto; padding:8px;">
        <div class="notification-item">
          <div class="notification-icon warning"><i data-lucide="alert-triangle" style="width:14px;height:14px;"></i></div>
          <div class="notification-content">
            <div class="notification-text">Pekerjaan Rehab JTM di Penyabng Tabanan belum ada realisasi</div>
            <div class="notification-time">2 jam lalu</div>
          </div>
        </div>
        <div class="notification-item">
          <div class="notification-icon info"><i data-lucide="info" style="width:14px;height:14px;"></i></div>
          <div class="notification-content">
            <div class="notification-text">Kontrak dengan PT. Bali Konstruksi segera berakhir</div>
            <div class="notification-time">1 hari lalu</div>
          </div>
        </div>
        <div class="notification-item">
          <div class="notification-icon danger"><i data-lucide="alert-circle" style="width:14px;height:14px;"></i></div>
          <div class="notification-content">
            <div class="notification-text">Terdapat sisa anggaran berpotensi dikembalikan</div>
            <div class="notification-time">1 hari lalu</div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      document.addEventListener('click', function closeNotif(e) {
        if (!panel.contains(e.target) && !e.target.closest('.header-notification')) {
          panel.remove();
          document.removeEventListener('click', closeNotif);
        }
      });
    }, 100);
  },

  // Create modal
  openModal(title, content, footer = '') {
    const existing = document.getElementById('appModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'appModal';
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="Components.closeModal()">✕</button>
        </div>
        <div class="modal-body">${content}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    `;
    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons();

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal();
    });
  },

  // Close modal
  closeModal() {
    const modal = document.getElementById('appModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  },

  // Render pagination
  renderPagination(containerId, currentPage, totalPages, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container || totalPages <= 1) {
      if (container) container.innerHTML = '';
      return;
    }

    let html = '<div style="display:flex;gap:4px;align-items:center;justify-content:center;margin-top:16px;">';
    
    // Previous
    html += `<button class="btn btn-sm btn-secondary" ${currentPage <= 1 ? 'disabled' : ''} onclick="${onPageChange}(${currentPage - 1})">
      <i data-lucide="chevron-left" style="width:14px;height:14px;"></i>
    </button>`;

    // Pages
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        html += `<button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-secondary'}" onclick="${onPageChange}(${i})">${i}</button>`;
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        html += '<span style="padding:0 4px;color:var(--text-muted);">...</span>';
      }
    }

    // Next
    html += `<button class="btn btn-sm btn-secondary" ${currentPage >= totalPages ? 'disabled' : ''} onclick="${onPageChange}(${currentPage + 1})">
      <i data-lucide="chevron-right" style="width:14px;height:14px;"></i>
    </button>`;
    
    html += '</div>';
    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }
};
