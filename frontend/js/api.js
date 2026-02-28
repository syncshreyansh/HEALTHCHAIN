'use strict';

/* ── Toast ─────────────────────────────────────────────────────── */
const Toast = {
  show(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-dot"></span><span>${msg}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('fade-out');
      setTimeout(() => el.remove(), 300);
    }, 3500);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error');   },
};

/* ── Auth ──────────────────────────────────────────────────────── */
const Auth = {
  get token() { return localStorage.getItem('hc_token'); },
  get user()  {
    const u = localStorage.getItem('hc_user');
    return u ? JSON.parse(u) : null;
  },
  set(user, token) {
    localStorage.setItem('hc_token', token);
    localStorage.setItem('hc_user', JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem('hc_token');
    localStorage.removeItem('hc_user');
  },
  isLoggedIn() { return !!this.token && !!this.user; },
};

/* ── API Client ────────────────────────────────────────────────── */
const API = {
  BASE: '/api',

  async request(method, path, body = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (Auth.token) opts.headers['Authorization'] = `Bearer ${Auth.token}`;
    if (body) opts.body = JSON.stringify(body);

    const res  = await fetch(this.BASE + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  },

  get:  (path)       => API.request('GET',  path),
  post: (path, body) => API.request('POST', path, body),
  put:  (path, body) => API.request('PUT',  path, body),

  auth: {
    challenge:     (walletAddress)            => API.post('/auth/challenge', { walletAddress }),
    verify:        (walletAddress, signature) => API.post('/auth/verify',    { walletAddress, signature }),
    me:            ()                         => API.get('/auth/me'),
    updateProfile: (data)                     => API.put('/auth/profile', data),
  },

  claims: {
    submit:  (data)                     => API.post('/claims/submit', data),
    getAll:  ()                         => API.get('/claims'),
    getById: (id)                       => API.get(`/claims/${id}`),
    resolve: (id, decision, reason)     => API.post(`/claims/${id}/resolve`, { decision, rejectionReason: reason }),
  },

  records: {
    upload: (data)    => API.post('/records/upload', data),
    getAll: (address) => API.get(`/records/${address}`),
  },

  hospitals: {
    getAll:  (filter = true) => API.get(`/hospitals?filterByInsurer=${filter}`),
    getById: (id)            => API.get(`/hospitals/${id}`),
  },

  ai: {
    prescriptionAssist: (notes)  => API.post('/ai/prescription-assist', { notes }),
    explain:            (reason) => API.post('/ai/explain', { technicalReason: reason }),
  },
};

/* ── Router ────────────────────────────────────────────────────── */
const Router = {
  routes: {},

  register(hash, fn) { this.routes[hash] = fn; },

  navigate(hash) { window.location.hash = hash; },

  init() {
    window.addEventListener('hashchange', () => this._handle());
    this._handle();
  },

  _handle() {
    const hash   = window.location.hash.replace('#', '') || '/';
    const publicRoutes = ['/', '/login'];

    if (!publicRoutes.includes(hash) && !Auth.isLoggedIn()) {
      this.navigate('/');
      return;
    }
    if ((hash === '/' || hash === '/login') && Auth.isLoggedIn()) {
      this.navigate('/dashboard');
      return;
    }

    const handler = this.routes[hash];
    if (handler) handler();
    else this.navigate('/');
  },
};

/* ── UI Utilities ──────────────────────────────────────────────── */
function renderPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

function setLoading(btn, on, text = '') {
  if (on) {
    btn.disabled   = true;
    btn._origHTML  = btn.innerHTML;
    btn.innerHTML  = `<span class="spinner"></span>${text || 'Loading…'}`;
  } else {
    btn.disabled  = false;
    btn.innerHTML = btn._origHTML || text;
  }
}

function shortAddr(a)    { return a ? `${a.slice(0,6)}…${a.slice(-4)}` : '—'; }
function formatCurrency(n) { return `₹${Number(n || 0).toLocaleString('en-IN')}`; }
function formatDate(d)   { return d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'; }

function statusBadge(s) {
  const map = { pending:'badge-pending', approved:'badge-approved', rejected:'badge-rejected', under_review:'badge-review' };
  return `<span class="badge ${map[s] || 'badge-review'}">${(s||'').replace('_',' ')}</span>`;
}

function roleBadge(r) {
  return `<span class="badge badge-${r}">${r}</span>`;
}

function fraudColor(s) {
  return s < 30 ? 'fraud-low' : s < 70 ? 'fraud-mid' : 'fraud-high';
}

function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-backdrop')) e.target.classList.remove('open');
});

/* ── Navbar ────────────────────────────────────────────────────── */
function renderNavbar() {
  const user = Auth.user;
  const nav  = document.getElementById('main-nav');
  if (!nav) return;

  if (!user) { nav.style.display = 'none'; return; }

  nav.style.display = 'flex';
  nav.innerHTML = `
    <a class="navbar-brand" href="#/dashboard">
      <div class="navbar-logo">H</div>
      <span class="navbar-name">HealthChain</span>
    </a>
    <div class="navbar-right">
      <div class="hide-mobile" style="text-align:right;">
        <div class="navbar-user-name">${user.name || 'User'}</div>
        <div class="navbar-user-addr mono">${shortAddr(user.walletAddress)}</div>
      </div>
      ${roleBadge(user.role)}
      <button class="btn btn-outline btn-sm" id="logout-btn">Disconnect</button>
    </div>
  `;

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    Auth.clear();
    Router.navigate('/');
  });
}