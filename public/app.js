//AUTH TAB SWITCHING
function showAuthTab(tab) {
    document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
    document.getElementById('tabLoginBtn').classList.toggle('active', tab === 'login');
    document.getElementById('tabRegisterBtn').classList.toggle('active', tab === 'register');
}

//SHOW DASHBOARD / SHOW AUTH GATE
function enterDashboard(user) {
    document.getElementById('authGate').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('welcomeName').textContent = user.name || user.email;
    sessionStorage.setItem('clubPortalUser', JSON.stringify(user));
    loadClubs();
}

function logout() {
    sessionStorage.removeItem('clubPortalUser');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('authGate').classList.remove('hidden');
    document.getElementById('loginForm').reset();
    showAuthTab('login');
}

// Restore session on page load, if present
(function restoreSession() {
    const saved = sessionStorage.getItem('clubPortalUser');
    if (saved) {
        try { enterDashboard(JSON.parse(saved)); } catch (e) { /* ignore bad state */ }
    }
})();

//DASHBOARD NAVIGATION
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById(pageId).classList.add('active');
    event.currentTarget.classList.add('active');

    if (pageId === 'clubs') loadClubs();
    if (pageId === 'events') loadEvents();
    if (pageId === 'members') loadMembers();
    if (pageId === 'apitests') loadApiTests();
}

//LIVE API MONITOR
// The API Tests page now calls the real backend directly. Bruno is still useful
// for independent API testing, but these results are generated live by the frontend.
const apiActivityLog = [];
const liveApiResults = {};

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function formatJson(value) {
    try { return JSON.stringify(value, null, 2); }
    catch (_) { return String(value); }
}

function recordApiActivity(method, url, status, durationMs) {
    apiActivityLog.unshift({ method, url, status, durationMs, time: new Date() });
    if (apiActivityLog.length > 30) apiActivityLog.pop();
    renderApiActivity();
}

function renderApiActivity() {
    const target = document.getElementById('apiActivity');
    if (!target) return;
    if (!apiActivityLog.length) {
        target.innerHTML = '<div class="empty-note">No API calls yet.</div>';
        return;
    }
    target.innerHTML = apiActivityLog.map(item => `
        <div class="api-activity-row">
            <span class="api-method">${escapeHtml(item.method)}</span>
            <span class="api-activity-url">${escapeHtml(item.url)}</span>
            <span class="${item.status >= 200 && item.status < 300 ? 'api-status ok' : 'api-status bad'}">${escapeHtml(item.status)}</span>
            <span class="api-duration">${escapeHtml(item.durationMs)}ms</span>
        </div>
    `).join('');
}

// Use this wrapper for frontend requests so the API Tests page can show the
// actual calls made by the application. PUT/DELETE remain backend-only for Bruno testing.
async function apiFetch(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const started = performance.now();
    try {
        const response = await fetch(url, options);
        const durationMs = Math.round(performance.now() - started);
        recordApiActivity(method, url, response.status, durationMs);
        return response;
    } catch (error) {
        const durationMs = Math.round(performance.now() - started);
        recordApiActivity(method, url, 'ERR', durationMs);
        throw error;
    }
}

async function runLiveApiTest(name, method, url, options = {}) {
    const started = performance.now();
    try {
        const response = await apiFetch(url, options);
        const durationMs = Math.round(performance.now() - started);
        const raw = await response.text();
        let body;
        try { body = JSON.parse(raw); } catch (_) { body = raw; }
        liveApiResults[name] = { name, method, url, status: response.status, ok: response.ok, durationMs, body };
    } catch (error) {
        const durationMs = Math.round(performance.now() - started);
        liveApiResults[name] = {
            name, method, url, status: 'ERR', ok: false, durationMs,
            body: { error: error.message || 'Could not reach backend' }
        };
    }
    renderLiveApiResults();
}

function renderLiveApiResults() {
    const target = document.getElementById('wireResults');
    if (!target) return;
    const rows = Object.values(liveApiResults);
    const passed = rows.filter(r => r.ok).length;
    const total = rows.length;
    const summary = document.getElementById('apiSummary');
    if (summary) {
        summary.innerHTML = `<span class="api-live-dot"></span>${passed}/${total} live API checks passed &middot; Last checked ${new Date().toLocaleTimeString()}`;
    }
    const status = document.getElementById('wireStatus');
    if (status) status.textContent = total ? `${passed}/${total} Passed` : '—';

    target.innerHTML = rows.map(r => `
        <div class="api-result-card">
            <div class="api-result-head">
                <span class="api-method">${escapeHtml(r.method)}</span>
                <span class="api-status ${r.ok ? 'ok' : 'bad'}">${r.ok ? 'PASS' : 'FAIL'} · ${escapeHtml(r.status)}</span>
                <span class="api-url">${escapeHtml(r.url)}</span>
                <span class="badge">${escapeHtml(r.durationMs)}ms</span>
            </div>
            <div class="api-result-body">
                <div class="api-result-name">${escapeHtml(r.name)}</div>
                <pre class="api-json">${escapeHtml(formatJson(r.body))}</pre>
            </div>
        </div>
    `).join('');
}

async function runLiveApiTests() {
    const button = document.querySelector('.api-run-btn');
    if (button) { button.disabled = true; button.textContent = 'Running…'; }
    const tests = [
        ['Get Clubs', 'GET', '/api/clubs'],
        ['Get Events', 'GET', '/api/events'],
        ['Get Members', 'GET', '/api/members']
    ];
    await Promise.all(tests.map(([name, method, url]) => runLiveApiTest(name, method, url)));
    const meta = document.getElementById('wireRunMeta');
    if (meta) meta.textContent = `Live backend responses · ${new Date().toLocaleString()} · No static Bruno result file used.`;
    if (button) { button.disabled = false; button.textContent = 'Run Live API Checks'; }
}

async function loadApiTests() {
    renderApiActivity();
    renderLiveApiResults();
    await runLiveApiTests();
}

// Fetch Clubs
async function loadClubs() {
    const res = await apiFetch('/api/clubs');
    const data = await res.json();
    const rows = data.data || [];
    document.getElementById('clubsGrid').innerHTML = rows.length ? rows.map(c => `
        <div class="cell">
            <span class="badge">${c.category}</span>
            <h3>${c.name}</h3>
            <p>${c.description}</p>
        </div>
    `).join('') : `<div class="empty-note">No clubs on record yet.</div>`;
}

// Fetch Events
async function loadEvents() {
    const res = await apiFetch('/api/events');
    const data = await res.json();
    const rows = data.data || [];
    document.getElementById('eventsList').innerHTML = rows.length ? rows.map(e => `
        <div class="cell">
            <span class="badge accent">${e.club_name}</span>
            <h3>${e.title}</h3>
            <div class="meta-line"><strong>Where&mdash;</strong> ${e.location}</div>
            <div class="meta-line"><strong>Date&mdash;</strong> ${e.event_date}</div>
        </div>
    `).join('') : `<div class="empty-note">No events scheduled yet.</div>`;
}

// Fetch Members
async function loadMembers() {
    const res = await apiFetch('/api/members');
    const data = await res.json();
    const rows = data.data || [];
    document.getElementById('membersList').innerHTML = rows.length ? rows.map(m => `
        <div class="list-item">
            <div>
                <strong>${m.fullName}</strong> <span class="badge">${m.club}</span>
                <div class="sub">${m.email}</div>
            </div>
        </div>
    `).join('') : `<div class="empty-note">Directory is empty.</div>`;
}

// Member Submit Form
document.getElementById('memberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await apiFetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fullName: document.getElementById('mName').value,
            email: document.getElementById('mEmail').value,
            club: document.getElementById('mClub').value
        })
    });
    const data = await res.json();
    if (res.ok) {
        alert(data.message || 'Member registered to club!');
        document.getElementById('memberForm').reset();
        loadMembers();
    } else {
        alert(data.error || 'Unable to add member.');
    }
});

// Event Submit Form
document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const res = await apiFetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: document.getElementById('evTitle').value,
            club_name: document.getElementById('evClub').value,
            event_date: document.getElementById('evDate').value,
            location: document.getElementById('evLoc').value
        })
    });

    const data = await res.json();

    if (res.ok) {
        alert(data.message || 'Event added!');
        document.getElementById('eventForm').reset();
        loadEvents();
    } else {
        alert(data.error || 'Unable to add event.');
    }
});

// User Registration Form (on the auth gate)
document.getElementById('regForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await apiFetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: document.getElementById('rName').value,
            email: document.getElementById('rEmail').value,
            password: document.getElementById('rPassword').value
        })
    });
    const data = await res.json();
    if (res.ok) {
        alert(data.message || 'Registered! Please sign in.');
        document.getElementById('regForm').reset();
        showAuthTab('login');
        document.getElementById('lEmail').value = document.getElementById('rEmail').value || '';
    } else {
        alert(data.error);
    }
});

// User Login Form (on the auth gate)
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await apiFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: document.getElementById('lEmail').value,
            password: document.getElementById('lPassword').value
        })
    });
    const data = await res.json();
    if (res.ok) {
        enterDashboard(data.user);
    } else {
        alert(data.error);
    }
});

