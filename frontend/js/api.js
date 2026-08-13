const API_BASE = 'http://localhost:5000/api';

const Api = {
  token: () => localStorage.getItem('ec_token'),

  setSession(data) {
    localStorage.setItem('ec_token', data.token);
    localStorage.setItem('ec_user', JSON.stringify({
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role
    }));
  },

  currentUser() {
    const raw = localStorage.getItem('ec_user');
    return raw ? JSON.parse(raw) : null;
  },

  logout() {
    localStorage.removeItem('ec_token');
    localStorage.removeItem('ec_user');
    window.location.href = 'index.html';
  },

  isLoggedIn: () => !!localStorage.getItem('ec_token'),

  requireRole(role) {
    const user = this.currentUser();
    if (!user || user.role !== role) {
      window.location.href = 'login.html';
      return null;
    }
    return user;
  },

  async request(method, path, body, isForm = false) {
    const headers = {};
    const token = this.token();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (!isForm) headers['Content-Type'] = 'application/json';

    const opts = { method, headers };
    if (body) opts.body = isForm ? body : JSON.stringify(body);

    const res = await fetch(API_BASE + path, opts);

    if (res.status === 401) { this.logout(); return; }

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || 'Erreur serveur.');
    return data;
  },

  get: (path) => Api.request('GET', path),
  post: (path, body) => Api.request('POST', path, body),
  patch: (path, body) => Api.request('PATCH', path, body),
  postForm: (path, form) => Api.request('POST', path, form, true)
};

// ── Toast notifications ──────────────────────────────────────
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
  }
  const colors = {
    success: '#15803d',
    error: '#b91c1c',
    info: '#1d4ed8'
  };
  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.style.cssText = `
    background:${colors[type] || colors.info};
    color:#fff;
    padding:14px 18px;
    border-radius:12px;
    font-weight:600;
    font-size:0.92rem;
    box-shadow:0 8px 24px rgba(0,0,0,0.18);
    display:flex;
    align-items:center;
    gap:10px;
    min-width:280px;
    max-width:380px;
    animation:slideIn 0.25s ease-out;
  `;
  toast.innerHTML = `<span style="font-size:1.1rem">${icons[type]||'ℹ️'}</span><span style="flex:1">${message}</span><span style="cursor:pointer;opacity:0.8" onclick="this.parentElement.remove()">✕</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), type === 'error' ? 6000 : 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-CD', { day:'2-digit', month:'short', year:'numeric' });
}

function statusBadge(status) {
  const classes = {
    APPROVED: 'badge-approved',
    ACTIVE: 'badge-approved',
    SUBMITTED: 'badge-pending',
    PENDING: 'badge-pending',
    UNDER_REVIEW: 'badge-pending',
    INTERVIEWING: 'badge-interviewing',
    REJECTED: 'badge-rejected',
    POSITION_FILLED: 'badge-rejected',
    CLOSED: 'badge-rejected',
    SUSPENDED: 'badge-rejected'
  };
  const label = Lang.t('status_' + status) || status;
  return `<span class="badge-status ${classes[status] || 'badge-pending'}">${label}</span>`;
}