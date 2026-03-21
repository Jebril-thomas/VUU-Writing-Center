/**
 * admin.js — VUU Writing Center
 * Admin dashboard: password gate, drafts table, messages table
 */

(function () {
  // ── Configuration ──────────────────────────────────────────
  // Change this to your Render backend URL before deploying
  const API_BASE = window.VUU_API_BASE || 'https://vuu-writing-center-api.onrender.com';
  const SESSION_KEY = 'vuu_admin_token';

  // ── DOM refs ────────────────────────────────────────────────
  const gate       = document.getElementById('passwordGate');
  const dashboard  = document.getElementById('adminDashboard');
  const gateAlert  = document.getElementById('gateAlert');
  const passInput  = document.getElementById('adminPassword');
  const gateSubmit = document.getElementById('gateSubmit');
  const logoutBtn  = document.getElementById('logoutBtn');

  // ── Session helpers ─────────────────────────────────────────
  function getToken() {
    return sessionStorage.getItem(SESSION_KEY);
  }
  function setToken(token) {
    sessionStorage.setItem(SESSION_KEY, token);
  }
  function clearToken() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function showDashboard() {
    gate.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loadAll();
  }

  function showGate() {
    dashboard.classList.add('hidden');
    gate.classList.remove('hidden');
  }

  // ── Check if already authenticated ─────────────────────────
  if (getToken()) {
    showDashboard();
  }

  // ── Password gate ───────────────────────────────────────────
  gateSubmit.addEventListener('click', async function () {
    const password = passInput.value.trim();
    if (!password) {
      showGateAlert('Please enter the admin password.');
      return;
    }

    gateSubmit.disabled = true;
    gateSubmit.textContent = 'Checking…';

    try {
      const res = await fetch(API_BASE + '/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        setToken(data.token);
        gateAlert.className = 'alert hidden';
        showDashboard();
      } else {
        showGateAlert(data.error || 'Incorrect password.');
      }
    } catch (err) {
      showGateAlert('Network error. Please try again.');
    } finally {
      gateSubmit.disabled = false;
      gateSubmit.textContent = 'Enter Dashboard';
    }
  });

  passInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') gateSubmit.click();
  });

  function showGateAlert(msg) {
    gateAlert.className = 'alert alert-error';
    gateAlert.textContent = msg;
  }

  // ── Logout ──────────────────────────────────────────────────
  logoutBtn.addEventListener('click', function () {
    clearToken();
    passInput.value = '';
    showGate();
  });

  // ── Tabs ────────────────────────────────────────────────────
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-content').forEach(function (t) { t.classList.remove('active'); t.classList.add('hidden'); });

      btn.classList.add('active');
      const target = document.getElementById('tab-' + btn.dataset.tab);
      if (target) { target.classList.add('active'); target.classList.remove('hidden'); }
    });
  });

  // ── Refresh buttons ─────────────────────────────────────────
  const refreshDrafts = document.getElementById('refreshDrafts');
  const refreshMessages = document.getElementById('refreshMessages');
  if (refreshDrafts)   refreshDrafts.addEventListener('click', loadDrafts);
  if (refreshMessages) refreshMessages.addEventListener('click', loadMessages);

  // ── Load all ────────────────────────────────────────────────
  function loadAll() {
    loadDrafts();
    loadMessages();
  }

  // ── Auth header ─────────────────────────────────────────────
  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken()
    };
  }

  function handleUnauth(res) {
    if (res.status === 401 || res.status === 403) {
      clearToken();
      showGate();
      return true;
    }
    return false;
  }

  // ── Load Drafts ─────────────────────────────────────────────
  async function loadDrafts() {
    const loading = document.getElementById('draftsLoading');
    const empty   = document.getElementById('draftsEmpty');
    const wrap    = document.getElementById('draftsTableWrap');
    const tbody   = document.getElementById('draftsBody');

    loading.classList.remove('hidden');
    empty.classList.add('hidden');
    wrap.classList.add('hidden');

    try {
      const res = await fetch(API_BASE + '/api/admin/drafts', {
        headers: authHeaders()
      });

      if (handleUnauth(res)) return;

      const data = await res.json();
      const drafts = data.drafts || [];

      loading.classList.add('hidden');

      // Update stats
      document.getElementById('statTotalDrafts').textContent  = drafts.length;
      document.getElementById('statPendingDrafts').textContent = drafts.filter(function (d) { return d.status === 'pending'; }).length;

      if (drafts.length === 0) {
        empty.classList.remove('hidden');
        return;
      }

      tbody.innerHTML = '';
      drafts.forEach(function (draft, i) {
        const tr = document.createElement('tr');
        tr.innerHTML = [
          '<td>' + (i + 1) + '</td>',
          '<td>' + escHtml(draft.name) + '</td>',
          '<td>' + escHtml(draft.email) + '</td>',
          '<td>' + buildDownloadLink(draft) + '</td>',
          '<td>' + buildBadge(draft.status) + '</td>',
          '<td>' + formatDate(draft.created_at) + '</td>',
          '<td>' + buildCompleteBtn('draft', draft.id, draft.status) + '</td>'
        ].join('');
        tbody.appendChild(tr);
      });

      wrap.classList.remove('hidden');
    } catch (err) {
      loading.textContent = 'Failed to load drafts.';
    }
  }

  // ── Load Messages ───────────────────────────────────────────
  async function loadMessages() {
    const loading = document.getElementById('messagesLoading');
    const empty   = document.getElementById('messagesEmpty');
    const wrap    = document.getElementById('messagesTableWrap');
    const tbody   = document.getElementById('messagesBody');

    loading.classList.remove('hidden');
    empty.classList.add('hidden');
    wrap.classList.add('hidden');

    try {
      const res = await fetch(API_BASE + '/api/admin/contact', {
        headers: authHeaders()
      });

      if (handleUnauth(res)) return;

      const data = await res.json();
      const messages = data.messages || [];

      loading.classList.add('hidden');

      // Update stats
      document.getElementById('statTotalMessages').textContent   = messages.length;
      document.getElementById('statPendingMessages').textContent = messages.filter(function (m) { return m.status === 'pending'; }).length;

      if (messages.length === 0) {
        empty.classList.remove('hidden');
        return;
      }

      tbody.innerHTML = '';
      messages.forEach(function (msg, i) {
        const tr = document.createElement('tr');
        tr.innerHTML = [
          '<td>' + (i + 1) + '</td>',
          '<td>' + escHtml(msg.name) + '</td>',
          '<td>' + escHtml(msg.email) + '</td>',
          '<td><div class="msg-preview" title="' + escHtml(msg.message) + '">' + escHtml(msg.message) + '</div></td>',
          '<td>' + buildBadge(msg.status) + '</td>',
          '<td>' + formatDate(msg.created_at) + '</td>',
          '<td>' + buildCompleteBtn('contact', msg.id, msg.status) + '</td>'
        ].join('');
        tbody.appendChild(tr);
      });

      wrap.classList.remove('hidden');
    } catch (err) {
      loading.textContent = 'Failed to load messages.';
    }
  }

  // ── Mark complete ───────────────────────────────────────────
  // Using event delegation on tables
  document.addEventListener('click', async function (e) {
    const btn = e.target.closest('[data-action="complete"]');
    if (!btn) return;

    const type = btn.dataset.type;   // 'draft' or 'contact'
    const id   = btn.dataset.id;

    btn.disabled = true;
    btn.textContent = 'Saving…';

    const endpoint = type === 'draft'
      ? API_BASE + '/api/admin/drafts/' + id
      : API_BASE + '/api/admin/contact/' + id;

    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: 'completed' })
      });

      if (handleUnauth(res)) return;

      if (res.ok) {
        if (type === 'draft')   loadDrafts();
        if (type === 'contact') loadMessages();
      } else {
        btn.disabled = false;
        btn.textContent = 'Complete';
        alert('Failed to update status.');
      }
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Complete';
      alert('Network error.');
    }
  });

  // ── Helpers ─────────────────────────────────────────────────
  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildBadge(status) {
    const cls = status === 'completed' ? 'badge-completed' : 'badge-pending';
    return '<span class="badge ' + cls + '">' + status + '</span>';
  }

  function buildDownloadLink(draft) {
    if (!draft.file_path) return '—';
    const filename = draft.file_path.split('/').pop();
    const url = API_BASE + '/api/admin/files/' + encodeURIComponent(filename) + '?token=' + encodeURIComponent(getToken());
    return '<a class="dl-link" href="' + url + '" target="_blank" rel="noopener">⬇ Download</a>';
  }

  function buildCompleteBtn(type, id, status) {
    if (status === 'completed') {
      return '<button class="btn-complete" disabled>Done</button>';
    }
    return '<button class="btn-complete" data-action="complete" data-type="' + type + '" data-id="' + id + '">Complete</button>';
  }

  function formatDate(str) {
    if (!str) return '—';
    const d = new Date(str);
    if (isNaN(d)) return str;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
           ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
})();
