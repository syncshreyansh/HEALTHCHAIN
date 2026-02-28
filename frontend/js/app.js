'use strict';
/* ═══════════════════════════════════════════════════════════════════
   HEALTHCHAIN — app.js
   ═══════════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────────────
   THEME ENGINE — top-to-bottom wipe transition
   ──────────────────────────────────────────────────────────────── */
const Theme = {
  STORAGE_KEY: 'hc_theme',

  get current() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY) || 'light';
    this._apply(saved, false);
    this._syncToggles(saved);
  },

  toggle() {
    const next = this.current === 'light' ? 'dark' : 'light';
    this._wipe(next);
  },

  _wipe(next) {
    const wipe    = document.getElementById('theme-wipe');
    const wipeBg  = document.getElementById('theme-wipe-bg');
    if (!wipe || !wipeBg) { this._apply(next); return; }

    /* The curtain colour = the DESTINATION theme's background */
    const curtainColor = next === 'dark' ? '#040c1e' : '#f5f8ff';
    wipeBg.style.background = curtainColor;

    wipe.classList.add('active');

    /* At the halfway point (curtain fully covers screen) — swap theme */
    const halfDuration = 68 * 4.5; /* ~306ms — slightly past the 42% mark */
    setTimeout(() => {
      this._apply(next, false);
    }, halfDuration);

    /* Clean up after animation */
    wipe.addEventListener('animationend', () => {
      wipe.classList.remove('active');
    }, { once: true });
  },

  _apply(theme, animate = true) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this._syncToggles(theme);
  },

  _syncToggles(theme) {
    /* All toggle thumbs across navbar/landing */
    document.querySelectorAll('.theme-thumb').forEach(el => {
      el.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
    /* Aria */
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  },
};

/* ────────────────────────────────────────────────────────────────
   CURSOR
   ──────────────────────────────────────────────────────────────── */
const Cursor = {
  dot:   null,
  ring:  null,
  mx: 0, my: 0,
  rx: 0, ry: 0,
  raf:   null,

  init() {
    this.dot  = document.getElementById('cur-dot');
    this.ring = document.getElementById('cur-ring');
    if (!this.dot || !this.ring || window.matchMedia('(pointer: coarse)').matches) return;

    document.addEventListener('mousemove', e => { this.mx = e.clientX; this.my = e.clientY; });
    this._tick();

    /* Hover grow */
    document.addEventListener('mouseover', e => {
      if (e.target.matches('button, a, .btn, .claim-row, .feature-card, .step-item, .hero-pill, input, textarea')) {
        document.body.classList.add('on-interactive');
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.matches('button, a, .btn, .claim-row, .feature-card, .step-item, .hero-pill, input, textarea')) {
        document.body.classList.remove('on-interactive');
      }
    });
  },

  _tick() {
    this.dot.style.left = this.mx + 'px';
    this.dot.style.top  = this.my + 'px';
    this.rx += (this.mx - this.rx) * 0.11;
    this.ry += (this.my - this.ry) * 0.11;
    this.ring.style.left = this.rx + 'px';
    this.ring.style.top  = this.ry + 'px';
    this.raf = requestAnimationFrame(() => this._tick());
  },
};

/* ────────────────────────────────────────────────────────────────
   HERO 3D CARD PARALLAX
   ──────────────────────────────────────────────────────────────── */
const HeroCard = {
  zone: null,
  card: null,

  init() {
    this.zone = document.getElementById('hero-zone');
    this.card = document.getElementById('hero-card');
    if (!this.zone || !this.card) return;

    this.zone.addEventListener('mousemove', e => this._onMove(e));
    this.zone.addEventListener('mouseleave', ()  => this._onLeave());
    this.zone.addEventListener('touchmove',  e => this._onTouch(e), { passive: true });
  },

  _onMove(e) {
    const r  = this.zone.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const rx = ((e.clientY - cy) / r.height) * 20;
    const ry = -((e.clientX - cx) / r.width)  * 20;
    this.card.style.transition = 'none';
    this.card.style.animation  = 'none';
    this.card.style.transform  = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-10px) scale(1.015)`;
  },

  _onTouch(e) {
    const touch = e.touches[0];
    const fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
    this._onMove(fakeEvent);
  },

  _onLeave() {
    this.card.style.transition = 'transform 0.85s cubic-bezier(0.4,0,0.2,1)';
    this.card.style.animation  = 'floatCard 11s ease-in-out infinite';
  },
};

/* ────────────────────────────────────────────────────────────────
   SCROLL REVEAL
   ──────────────────────────────────────────────────────────────── */
const ScrollReveal = {
  observer: null,
  init() {
    if (!window.IntersectionObserver) return;
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity  = '1';
          entry.target.style.transform = 'translateY(0)';
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
  },

  observe(selector) {
    if (!this.observer) return;
    document.querySelectorAll(selector).forEach(el => {
      el.style.opacity  = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.4,0,0.2,1)';
      this.observer.observe(el);
    });
  },
};

/* ────────────────────────────────────────────────────────────────
   LANDING PAGE
   ──────────────────────────────────────────────────────────────── */
function initLanding() {
  renderPage('page-landing');
  document.getElementById('main-nav').style.display = 'none';

  /* Step flow */
  const steps = [
    'Doctor writes prescription',
    'AI structures medical codes',
    'Encrypted → IPFS',
    'Hash on blockchain',
    'Patient clicks Submit',
    'AI fraud scan',
    'Smart contract settles',
    'Patient notified',
  ];
  const flowEl = document.getElementById('step-flow');
  if (flowEl) {
    flowEl.innerHTML = steps.map((s, i) => `
      <div class="step-item">
        <span class="step-num">${i + 1}</span>
        <span>${s}</span>
      </div>
      ${i < steps.length - 1 ? '<span class="step-arrow">→</span>' : ''}
    `).join('');
  }

  /* Features */
  const features = [
    { icon: '⛓️', title: 'Blockchain-Verified',   desc: 'Every claim is registered on Ethereum — tamper-proof and transparent forever.' },
    { icon: '🤖', title: 'AI Fraud Detection',     desc: 'Machine learning scans every claim for anomalies before an insurer sees it.' },
    { icon: '🔐', title: 'AES-256 Encryption',     desc: 'Your medical data is encrypted before it ever leaves your device.' },
    { icon: '⚡', title: '24-Hour Settlement',      desc: 'Smart contracts auto-approve eligible claims — no 2–4 week waits.' },
    { icon: '🏥', title: 'Hospital Compatibility', desc: 'Instantly see which hospitals your insurance covers before you visit.' },
    { icon: '📝', title: 'Plain English AI',        desc: 'AI rewrites dense rejection reasons into language anyone can understand.' },
  ];
  const grid = document.getElementById('features-grid');
  if (grid) {
    grid.innerHTML = features.map(f => `
      <div class="feature-card">
        <div class="feature-icon">${f.icon}</div>
        <div class="feature-title">${f.title}</div>
        <div class="feature-desc">${f.desc}</div>
      </div>
    `).join('');
    /* Trigger scroll reveal */
    setTimeout(() => ScrollReveal.observe('.feature-card, .step-item'), 50);
  }

  /* Button events */
  document.getElementById('connect-wallet-btn')
    ?.addEventListener('click', handleConnect);
  document.getElementById('connect-wallet-btn-nav')
    ?.addEventListener('click', handleConnect);

  /* Smooth scroll for anchor */
  document.querySelectorAll('a[href="#features"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.getElementById('features');
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* Init hero card parallax */
  HeroCard.init();

  /* Theme toggle in landing nav */
  document.getElementById('theme-btn-landing')
    ?.addEventListener('click', () => Theme.toggle());
}

async function handleConnect() {
  openModal('modal-connecting');
  const msgEl = document.getElementById('connecting-msg');
  try {
    if (msgEl) msgEl.textContent = 'Requesting wallet access…';
    await MetaMask.connect();
    if (msgEl) msgEl.textContent = 'Authenticated — redirecting…';
    setTimeout(() => { closeModal('modal-connecting'); Router.navigate('/dashboard'); }, 600);
  } catch (err) {
    closeModal('modal-connecting');
    document.getElementById('modal-error-msg').textContent = err.message;
    openModal('modal-error');
  }
}

/* ────────────────────────────────────────────────────────────────
   DASHBOARD
   ──────────────────────────────────────────────────────────────── */
async function initDashboard() {
  renderPage('page-dashboard');
  renderNavbar();
  const user = Auth.user;
  if (!user) return;

  const titles = {
    patient:  ['Patient Dashboard',  'Track your insurance claims and medical records.'],
    doctor:   ['Doctor Dashboard',   'Create prescriptions and manage patient records.'],
    insurer:  ['Insurer Dashboard',  'Review pending claims with AI fraud analysis.'],
    hospital: ['Hospital Dashboard', 'View and manage claims from your facility.'],
  };
  const [title, sub] = titles[user.role] || ['Dashboard', ''];
  document.getElementById('dash-title').textContent    = title;
  document.getElementById('dash-subtitle').textContent = sub;

  const actionsEl = document.getElementById('dash-actions');
  if (actionsEl) {
    if (user.role === 'patient') {
      actionsEl.innerHTML = `
        <a href="#/hospitals"    class="btn btn-ghost btn-sm">🏥 Hospitals</a>
        <a href="#/submit-claim" class="btn btn-primary btn-sm">+ Submit Claim</a>
      `;
    } else if (user.role === 'doctor') {
      actionsEl.innerHTML = `<a href="#/prescribe" class="btn btn-primary btn-sm">+ New Prescription</a>`;
    }
  }

  document.getElementById('claims-list-title').textContent =
    user.role === 'insurer' ? 'All Claims' : 'Your Claims';

  let claims = [];
  try {
    const data = await API.claims.getAll();
    claims = data.claims || [];
  } catch (err) { Toast.error('Failed to load claims'); }

  renderDashStats(claims);
  renderClaimsList(claims, user.role);
}

function renderDashStats(claims) {
  const el = document.getElementById('dash-stats');
  if (!el) return;
  const stats = [
    { label: 'Total',       value: claims.length,                                    color: 'var(--text-primary)' },
    { label: 'Pending',     value: claims.filter(c => c.status === 'pending').length,  color: 'var(--warning)' },
    { label: 'Approved',    value: claims.filter(c => c.status === 'approved').length, color: 'var(--success)' },
    { label: 'Rejected',    value: claims.filter(c => c.status === 'rejected').length, color: 'var(--danger)' },
  ];
  el.innerHTML = stats.map(s => `
    <div class="stat-card">
      <div class="stat-value" style="color:${s.color};">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');
}

function renderClaimsList(claims, role) {
  const body    = document.getElementById('claims-list-body');
  const countEl = document.getElementById('claims-count');
  if (!body) return;
  if (countEl) countEl.textContent = `${claims.length} total`;

  if (!claims.length) {
    body.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">No claims yet</div>
        <div class="empty-state-sub">${role === 'patient' ? 'Submit your first claim to get started.' : 'Claims will appear here.'}</div>
      </div>`;
    return;
  }

  body.innerHTML = claims.map(c => `
    <div class="claim-row" onclick="Router.navigate('/claim/${c._id}')">
      <div class="claim-row-left">
        <div class="claim-row-id">#${c._id?.slice(-10)}</div>
        <div class="claim-row-title">${c.diagnosis || 'Medical Claim'}</div>
        <div class="claim-row-sub">
          ${statusBadge(c.status)}
          ${role === 'insurer' && c.fraudScore != null
            ? `<span class="mono" style="font-size:0.72rem;color:${fraudColor(c.fraudScore) === 'fraud-low' ? 'var(--success)' : fraudColor(c.fraudScore) === 'fraud-mid' ? 'var(--warning)' : 'var(--danger)'}">
                Fraud: ${c.fraudScore}/100
               </span>`
            : ''}
          <span style="font-size:0.74rem;">${formatDate(c.createdAt)}</span>
        </div>
      </div>
      <div class="claim-row-right">
        <div class="claim-row-amount">${formatCurrency(c.amount)}</div>
        <div class="claim-row-arrow">View →</div>
      </div>
    </div>
  `).join('');
}

/* ────────────────────────────────────────────────────────────────
   CLAIM DETAIL
   ──────────────────────────────────────────────────────────────── */
async function initClaimDetail(id) {
  renderPage('page-claim-detail');
  renderNavbar();
  const body = document.getElementById('claim-detail-body');
  if (!body) return;

  let claim;
  try {
    const data = await API.claims.getById(id);
    claim = data.claim;
  } catch (err) {
    body.innerHTML = `<div class="alert alert-error">Failed to load claim: ${err.message}</div>`;
    return;
  }

  const isInsurer = Auth.user?.role === 'insurer';

  body.innerHTML = `
    <div class="stagger">
      <div class="card fade-in" style="margin-bottom:18px;">
        <div class="flex items-center justify-between" style="margin-bottom:18px;">
          <div>
            <div class="mono" style="font-size:0.68rem;color:var(--text-faint);margin-bottom:5px;">Claim #${claim._id?.slice(-12)}</div>
            <h2>${claim.diagnosis || 'Medical Claim'}</h2>
          </div>
          ${statusBadge(claim.status)}
        </div>
        <div class="grid-2">
          ${dRow('Amount',    formatCurrency(claim.amount))}
          ${dRow('Hospital',  claim.hospitalId?.name || '—')}
          ${dRow('Patient',   claim.patientId?.name  || '—')}
          ${dRow('Procedure', claim.procedureCode    || '—')}
          ${dRow('Admitted',  formatDate(claim.admissionDate))}
          ${dRow('Discharged',formatDate(claim.dischargeDate))}
          ${dRow('Submitted', formatDate(claim.createdAt))}
          ${dRow('Policy #',  claim.patientId?.insurancePolicyId || '—')}
        </div>
      </div>

      <div class="card fade-in" style="margin-bottom:18px;">
        <h3 style="margin-bottom:16px;">⛓️ Blockchain Verification</h3>
        ${claim.ipfsCid ? `
          <div style="margin-bottom:14px;">
            <div class="form-label" style="margin-bottom:7px;">IPFS CID</div>
            <div class="cid-box">${claim.ipfsCid}</div>
          </div>` : ''}
        ${claim.blockchainTxHash ? `
          <div>
            <div class="form-label" style="margin-bottom:7px;">Ethereum Transaction</div>
            <a href="https://sepolia.etherscan.io/tx/${claim.blockchainTxHash}" target="_blank" rel="noopener" class="cid-box" style="display:block;color:var(--text-accent);">
              ${claim.blockchainTxHash} ↗
            </a>
          </div>` : `<div class="alert alert-warning" style="font-size:0.84rem;">Transaction pending.</div>`}
      </div>

      ${claim.fraudScore != null ? `
        <div class="card fade-in" style="margin-bottom:18px;">
          <h3 style="margin-bottom:16px;">🤖 AI Fraud Analysis</h3>
          <div class="flex items-center gap-4" style="margin-bottom:14px;">
            <div style="font-size:2.8rem;font-weight:900;color:var(--text-primary);line-height:1;font-family:var(--font-display);">${claim.fraudScore}</div>
            <div style="flex:1;">
              <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:7px;">Risk Score (0 = clean, 100 = suspicious)</div>
              <div class="fraud-bar"><div class="fraud-bar-fill ${fraudColor(claim.fraudScore)}" style="width:${claim.fraudScore}%;"></div></div>
            </div>
          </div>
          ${(claim.fraudConcerns || []).map(c => `
            <div style="display:flex;align-items:flex-start;gap:8px;font-size:0.85rem;color:var(--text-muted);margin-bottom:6px;">
              <span style="color:var(--warning);">⚠</span>${c}
            </div>
          `).join('')}
        </div>` : ''}

      ${claim.aiExplanation ? `
        <div class="card card--glow fade-in" style="margin-bottom:18px;">
          <h3 style="color:var(--info);margin-bottom:11px;">💬 What this means for you</h3>
          <p style="line-height:1.75;font-size:0.88rem;">${claim.aiExplanation}</p>
        </div>` : ''}

      ${isInsurer && claim.status === 'pending' ? `
        <div class="card fade-in">
          <h3 style="margin-bottom:15px;">Resolve Claim</h3>
          <div class="form-group" style="margin-bottom:18px;">
            <label class="form-label">Rejection Reason (required if rejecting)</label>
            <textarea class="textarea" id="rejection-reason"
              placeholder="e.g. ICD-10 mismatch — procedure not covered under policy tier 2…"
              style="min-height:90px;"></textarea>
          </div>
          <div class="flex gap-3">
            <button class="btn btn-primary" style="flex:1;justify-content:center;" id="approve-btn" data-id="${claim._id}">✓ Approve</button>
            <button class="btn btn-danger"  style="flex:1;justify-content:center;" id="reject-btn"  data-id="${claim._id}">✗ Reject</button>
          </div>
        </div>` : ''}
    </div>
  `;

  document.getElementById('approve-btn')
    ?.addEventListener('click', () => resolveClaim(claim._id, 'approved'));
  document.getElementById('reject-btn')
    ?.addEventListener('click', () => {
      const reason = document.getElementById('rejection-reason')?.value?.trim();
      if (!reason) { Toast.error('Please enter a rejection reason.'); return; }
      resolveClaim(claim._id, 'rejected', reason);
    });
}

function dRow(label, value, mono = false) {
  return `
    <div>
      <div style="font-size:0.68rem;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:4px;font-family:var(--font-display);font-weight:800;">${label}</div>
      <div style="font-size:0.88rem;color:${mono ? 'var(--text-accent)' : 'var(--text-secondary)'};font-family:${mono ? 'var(--font-mono)' : 'inherit'};word-break:break-all;">${value}</div>
    </div>`;
}

async function resolveClaim(id, decision, reason = '') {
  const btnId = decision === 'approved' ? 'approve-btn' : 'reject-btn';
  const btn   = document.getElementById(btnId);
  if (btn) setLoading(btn, true, decision === 'approved' ? 'Approving…' : 'Rejecting…');
  try {
    await API.claims.resolve(id, decision, reason);
    Toast.success(`Claim ${decision} successfully.`);
    setTimeout(() => Router.navigate('/dashboard'), 900);
  } catch (err) {
    Toast.error(`Failed: ${err.message}`);
    if (btn) setLoading(btn, false);
  }
}

/* ────────────────────────────────────────────────────────────────
   PRESCRIPTION
   ──────────────────────────────────────────────────────────────── */
let rxStructured = null;

function initPrescribe() {
  renderPage('page-prescribe');
  renderNavbar();
  rxStructured = null;
  const resultEl  = document.getElementById('rx-ai-result');
  const successEl = document.getElementById('rx-success');
  if (resultEl)  resultEl.style.display  = 'none';
  if (successEl) successEl.style.display = 'none';
  document.getElementById('rx-ai-btn').onclick   = handleRxAI;
  document.getElementById('rx-save-btn').onclick  = handleRxSave;
}

async function handleRxAI() {
  const notes = document.getElementById('rx-notes')?.value?.trim();
  if (!notes) { Toast.error('Please enter clinical notes.'); return; }
  const btn = document.getElementById('rx-ai-btn');
  setLoading(btn, true, 'AI is structuring…');
  try {
    const data = await API.ai.prescriptionAssist(notes);
    rxStructured = data.structured;
    renderRxStructured(rxStructured);
    document.getElementById('rx-ai-result').style.display = 'block';
  } catch (err) {
    Toast.error(`AI failed: ${err.message}`);
  } finally { setLoading(btn, false); }
}

function renderRxStructured(s) {
  const el = document.getElementById('rx-structured-output');
  if (!el || !s) return;
  const meds = (s.medications || []).map(m => `
    <div style="background:var(--bg-subtle);border:1px solid var(--border-faint);border-radius:var(--r-sm);padding:9px 13px;font-size:0.85rem;margin-bottom:7px;">
      <span style="font-weight:700;color:var(--text-primary);">${m.name}</span>
      <span style="color:var(--text-muted);margin-left:8px;">${m.dosage} · ${m.frequency} · ${m.duration}</span>
    </div>`).join('');
  el.innerHTML = `
    <div class="grid-2" style="margin-bottom:18px;">
      ${dRow('Diagnosis', s.diagnosis || '—')}
      ${dRow('ICD-10 Code', s.icd10Code || '—', true)}
    </div>
    ${meds ? `<div style="margin-bottom:14px;"><div class="form-label" style="margin-bottom:9px;">Medications</div>${meds}</div>` : ''}
    ${s.notes ? `<div><div class="form-label" style="margin-bottom:5px;">Notes</div><p style="font-size:0.85rem;">${s.notes}</p></div>` : ''}
  `;
}

async function handleRxSave() {
  const addr = document.getElementById('rx-patient-addr')?.value?.trim();
  if (!addr) { Toast.error('Please enter the patient wallet address.'); return; }
  if (!rxStructured) { Toast.error('Run AI structuring first.'); return; }
  const btn = document.getElementById('rx-save-btn');
  setLoading(btn, true, 'Encrypting & uploading…');
  try {
    const data = await API.records.upload({
      patientWalletAddress: addr,
      recordData: { ...rxStructured, rawNotes: document.getElementById('rx-notes')?.value, createdAt: new Date().toISOString() },
    });
    document.getElementById('rx-success').style.display = 'block';
    document.getElementById('rx-success-detail').textContent = `IPFS: ${data.ipfsCid}  ·  Tx: ${data.txHash?.slice(0, 22)}…`;
    Toast.success('Record saved to blockchain!');
  } catch (err) {
    Toast.error(`Save failed: ${err.message}`);
  } finally { setLoading(btn, false); }
}

/* ────────────────────────────────────────────────────────────────
   HOSPITALS
   ──────────────────────────────────────────────────────────────── */
let allHospitals = [], coveredIds = new Set(), hospitalFilter = true;

async function initHospitals() {
  renderPage('page-hospitals');
  renderNavbar();
  hospitalFilter = true;
  updateHospitalFilterBtn();
  try {
    const [covRes, allRes] = await Promise.all([
      API.hospitals.getAll(true),
      API.hospitals.getAll(false),
    ]);
    coveredIds   = new Set((covRes.hospitals || []).map(h => h._id));
    allHospitals = allRes.hospitals || [];
  } catch (err) { Toast.error('Failed to load hospitals'); }
  renderHospitals();
  document.getElementById('hospital-search')?.addEventListener('input', renderHospitals);
  document.getElementById('hospital-filter-btn')?.addEventListener('click', () => {
    hospitalFilter = !hospitalFilter;
    updateHospitalFilterBtn();
    renderHospitals();
  });
}

function updateHospitalFilterBtn() {
  const btn = document.getElementById('hospital-filter-btn');
  const sub = document.getElementById('hospital-subtitle');
  if (!btn) return;
  if (hospitalFilter) {
    btn.textContent = '✓ My Insurance Only';
    btn.style.borderColor = 'var(--border-strong)';
    btn.style.color       = 'var(--info)';
    if (sub) sub.textContent = 'Showing hospitals covered by your insurance.';
  } else {
    btn.textContent = 'All Hospitals';
    btn.style.borderColor = '';
    btn.style.color       = '';
    if (sub) sub.textContent = 'Showing all hospitals — some may not be covered.';
  }
}

function renderHospitals() {
  const query   = (document.getElementById('hospital-search')?.value || '').toLowerCase();
  const list    = document.getElementById('hospitals-list');
  if (!list) return;
  let hospitals = hospitalFilter ? allHospitals.filter(h => coveredIds.has(h._id)) : allHospitals;
  if (query) hospitals = hospitals.filter(h => h.name.toLowerCase().includes(query) || (h.location?.city||'').toLowerCase().includes(query));
  if (!hospitals.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🏥</div><div class="empty-state-text">No hospitals found</div></div>`;
    return;
  }
  list.innerHTML = hospitals.map(h => {
    const covered = coveredIds.has(h._id);
    const loc = [h.location?.address, h.location?.city, h.location?.state].filter(Boolean).join(', ');
    return `
      <div class="card card--hover" style="margin-bottom:12px;${!covered&&!hospitalFilter?'opacity:0.55;':''}">
        <div class="flex items-center justify-between" style="margin-bottom:9px;">
          <h3 style="margin:0;">${h.name}</h3>
          ${covered ? '<span class="badge badge-approved">Covered</span>' : '<span class="badge badge-rejected">Not Covered</span>'}
        </div>
        <div style="font-size:0.85rem;color:var(--text-muted);">${loc}</div>
        <div class="mono" style="font-size:0.68rem;color:var(--text-faint);margin-top:7px;">Reg: ${h.registrationNumber}</div>
      </div>`;
  }).join('');
}

/* ────────────────────────────────────────────────────────────────
   SUBMIT CLAIM
   ──────────────────────────────────────────────────────────────── */
function initSubmitClaim() {
  renderPage('page-submit-claim');
  renderNavbar();
  document.getElementById('claim-submit-btn')?.addEventListener('click', handleSubmitClaim);
}

async function handleSubmitClaim() {
  const btn = document.getElementById('claim-submit-btn');
  const hospitalId    = document.getElementById('claim-hospital-id')?.value?.trim();
  const ipfsCid       = document.getElementById('claim-ipfs-cid')?.value?.trim();
  const amount        = parseFloat(document.getElementById('claim-amount')?.value);
  const procedureCode = document.getElementById('claim-procedure')?.value?.trim();
  const diagnosis     = document.getElementById('claim-diagnosis')?.value?.trim();
  const admissionDate = document.getElementById('claim-admission')?.value;
  const dischargeDate = document.getElementById('claim-discharge')?.value;
  if (!hospitalId || !ipfsCid || !amount || !diagnosis) { Toast.error('Please fill in all required fields.'); return; }
  setLoading(btn, true, 'Submitting…');
  try {
    const data = await API.claims.submit({ hospitalId, ipfsCid, amount, procedureCode, diagnosis, admissionDate, dischargeDate });
    Toast.success('Claim submitted!');
    setTimeout(() => Router.navigate(`/claim/${data.claim._id}`), 800);
  } catch (err) {
    Toast.error(`Submit failed: ${err.message}`);
    setLoading(btn, false);
  }
}

/* ────────────────────────────────────────────────────────────────
   NAVBAR
   ──────────────────────────────────────────────────────────────── */
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
      <button class="theme-toggle" id="theme-btn-nav" aria-label="Toggle theme">
        <div class="theme-thumb" id="thumb-nav">${Theme.current === 'dark' ? '☀️' : '🌙'}</div>
      </button>
      <button class="btn btn-ghost btn-sm" id="logout-btn">Disconnect</button>
    </div>
  `;

  document.getElementById('theme-btn-nav')?.addEventListener('click', () => Theme.toggle());
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    Auth.clear();
    Router.navigate('/');
  });
}

/* ────────────────────────────────────────────────────────────────
   ROUTER
   ──────────────────────────────────────────────────────────────── */
Router.register('/',              initLanding);
Router.register('/login',         initLanding);
Router.register('/dashboard',     initDashboard);
Router.register('/prescribe',     initPrescribe);
Router.register('/hospitals',     initHospitals);
Router.register('/submit-claim',  initSubmitClaim);

/* Dynamic /claim/:id */
const _baseHandle = Router._handle.bind(Router);
Router._handle = function () {
  const hash  = window.location.hash.replace('#', '') || '/';
  const match = hash.match(/^\/claim\/(.+)$/);
  if (match) {
    if (!Auth.isLoggedIn()) { Router.navigate('/'); return; }
    initClaimDetail(match[1]);
    return;
  }
  _baseHandle();
};

/* ────────────────────────────────────────────────────────────────
   BOOT
   ──────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Cursor.init();
  ScrollReveal.init();
  Router.init();
});