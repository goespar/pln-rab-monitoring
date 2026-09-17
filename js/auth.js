// ============================================
// PLN RAB & Monitoring - Authentication Module
// ============================================

const Auth = {
  SESSION_KEY: 'pln_rab_session',

  // Login user
  async login(username, password) {
    try {
      const result = await API.login(username, password);
      if (result.success && result.user) {
        this.setSession(result.user);
        return { success: true, user: result.user };
      }
      return { success: false, message: result.message || 'Username atau password salah' };
    } catch (error) {
      // Demo mode - accept specific credentials
      if (CONFIG.API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        const demoUsers = {
          'admin': { id: '1', username: 'admin', nama: 'Administrator', role: 'admin', unit: 'UP3 Bali Utara' },
          'perencanaan': { id: '2', username: 'perencanaan', nama: 'Budi Santoso', role: 'tim_perencanaan', unit: 'UP3 Bali Utara' },
          'pengawas': { id: '3', username: 'pengawas', nama: 'Made Wirawan', role: 'tim_pengawasan', unit: 'UP3 Bali Utara' },
          'atasan': { id: '4', username: 'atasan', nama: 'Ir. Nyoman Surya', role: 'atasan', unit: 'UP3 Bali Utara' }
        };
        
        if (demoUsers[username]) {
          this.setSession(demoUsers[username]);
          return { success: true, user: demoUsers[username] };
        }
      }
      return { success: false, message: 'Gagal terhubung ke server' };
    }
  },

  // Set session
  setSession(user) {
    const session = {
      user,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  },

  // Get current session
  getSession() {
    try {
      const session = JSON.parse(localStorage.getItem(this.SESSION_KEY));
      if (!session) return null;
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  // Get current user
  getUser() {
    const session = this.getSession();
    return session ? session.user : null;
  },

  // Check if logged in
  isLoggedIn() {
    return !!this.getSession();
  },

  // Get user role
  getRole() {
    const user = this.getUser();
    return user ? user.role : null;
  },

  // Check if user has access to a page
  hasAccess(page) {
    const role = this.getRole();
    if (!role) return false;
    const allowedRoles = CONFIG.MENU_ACCESS[page];
    return allowedRoles ? allowedRoles.includes(role) : false;
  },

  // Logout
  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    window.location.href = 'index.html';
  },

  // Require auth - call on protected pages
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  // Require role
  requireRole(roles) {
    if (!this.requireAuth()) return false;
    const userRole = this.getRole();
    if (!roles.includes(userRole)) {
      Utils.showToast('Anda tidak memiliki akses ke halaman ini', 'error');
      window.location.href = 'dashboard.html';
      return false;
    }
    return true;
  },

  // Get user initials
  getInitials() {
    const user = this.getUser();
    if (!user) return '?';
    return user.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
};
