// ============================================================
// LIBRARY MANAGER — app.js
// All Supabase calls, state, and UI logic live here.
// ============================================================

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

const MAX_CHECKOUT = 3;
let sentEmails = {};        // { bookId: count } — session only
let emailPendingIds = [];
let currentPanel = 'dashboard';

// ── Auth ──────────────────────────────────────────────────────────────────────
async function checkAuth() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    showLoginScreen();
  } else {
    showAppScreen(session.user.email);
    renderPanel(currentPanel);
  }
}

async function login() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  setLoginError('');
  setLoginLoading(true);
  const { error } = await db.auth.signInWithPassword({ email, password });
  setLoginLoading(false);
  if (error) { setLoginError(error.message); return; }
  showAppScreen(email);
  renderPanel('dashboard');
}

async function logout() {
  await db.auth.signOut();
  showLoginScreen();
}

function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app-screen').style.display   = 'none';
}
function showAppScreen(email) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-screen').style.display   = 'block';
  document.getElementById('user-email').textContent = email;
}
function setLoginError(msg) {
  document.getElementById('login-error').textContent = msg;
}
function setLoginLoading(on) {
  document.getElementById('login-btn').textContent = on ? 'Signing in…' : 'Sign in';
  document.getElementById('login-btn').disabled = on;
}

document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault(); login();
});
document.getElementById('login-password').addEventListener('keydown', e => {
  if (e.key === 'Enter') login();
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function today() { return new Date().toISOString().split('T')[0]; }
function daysOverdue(d) {
  if (!d || d >= today()) return 0;
  return Math.floor((new Date(today()) - new Date(d)) / 86400000);
}
function isOverdue(d) { return daysOverdue(d) > 0; }

function showAlert(msg, type = 'success') {
  document.getElementById('alert-area').innerHTML =
    `<div class="alert alert-${type}">${msg}</div>`;
  setTimeout(() => document.getElementById('alert-area').innerHTML = '', 7000);
}
function openModal(name) {
  document.getElementById('modal-' + name).style.display = 'flex';
}
function closeModal(name) {
  document.getElementById('modal-' + name).style.display = 'none';
}

function showPanel(p, btn) {
  document.querySelectorAll('.panel').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(el => el.classList.remove('active'));
  document.getElementById('panel-' + p).classList.add('active');
  if (btn) btn.classList.add('active');
  currentPanel = p;
  document.getElementById('alert-area').innerHTML = '';
  renderPanel(p);
}
function renderPanel(p) {
  if (p === 'dashboard')  renderDash();
  if (p === 'books')      renderBooks();
  if (p === 'users')      renderUsers();
  if (p === 'checkout')   populateCheckout();
  if (p === 'checkin')    populateCheckin();
  if (p === 'checkedout') renderCheckedOut();
  if (p === 'overdue')    renderOverdue();
  if (p === 'holds')      renderHolds();
}

function setLoading(tableId, cols) {
  document.getElementById(tableId).innerHTML =
    `<tr><td colspan="${cols}" style="text-align:center;padding:24px;color:var(--text3)">Loading…</td></tr>`;
}

function bookStatusBadge(b) {
  if (b.status === 'available') return '<span class="bdg bdg-available">Available</span>';
  if (isOverdue(b.due_date))    return '<span class="bdg bdg-overdue">Overdue</span>';
  return '<span class="bdg bdg-checked">Checked out</span>';
}

function limitPips(count) {
  let p = '';
  for (let i = 0; i < MAX_CHECKOUT; i++) {
    const cl = i < count ? (count > MAX_CHECKOUT ? 'pip-over' : 'pip-used') : 'pip-empty';
    p += `<div class="limit-pip ${cl}"></div>`;
  }
  return `<div class="limit-bar">${p}</div>`;
}

function buildEmailBody(name, title, dueDate, days) {
  return `Dear ${name},\n\nThis is a friendly reminder that the following book is overdue:\n\n  Title: ${title}\n  Due date: ${dueDate}\n  Days overdue: ${days} day${days === 1 ? '' : 's'}\n\nPlease return this book to the library at your earliest convenience.\nIf you have any questions, feel free to contact us.\n\nThank you,\nLibrary Staff`;
}

async function updateNavBadge() {
  const { data } = await db.from('books')
    .select('due_date')
    .eq('status', 'checked');
  const od = (data || []).filter(b => isOverdue(b.due_date)).length;
  document.getElementById('nav-overdue').innerHTML =
    'Overdue' + (od > 0 ? `<span class="badge-nav">${od}</span>` : '');
}

// ── Dashboard ────────────────────────────────────────────────────────────────
async function renderDash() {
  updateNavBadge();
  setLoading('dash-table', 7);

  const [{ data: allBooks }, { data: allPatrons }] = await Promise.all([
    db.from('books').select('*, checked_out_patron:patrons!books_checked_out_by_fkey(name), hold_patron:patrons!books_hold_by_fkey(name)'),
    db.from('patrons').select('id')
  ]);
  const books    = allBooks    || [];
  const patrons  = allPatrons  || [];
  const checked  = books.filter(b => b.status === 'checked');
  const overdue  = checked.filter(b => isOverdue(b.due_date)).length;
  const holds    = books.filter(b => b.hold_by).length;

  document.getElementById('stat-cards').innerHTML = `
    <div class="stat-card"><div class="num">${books.length}</div><div class="lbl">Total books</div></div>
    <div class="stat-card"><div class="num">${books.filter(b=>b.status==='available').length}</div><div class="lbl">Available</div></div>
    <div class="stat-card"><div class="num">${checked.length}</div><div class="lbl">Checked out</div></div>
    <div class="stat-card"><div class="num" style="color:var(--red)">${overdue}</div><div class="lbl">Overdue</div></div>
    <div class="stat-card"><div class="num" style="color:var(--blue)">${holds}</div><div class="lbl">On hold</div></div>
    <div class="stat-card"><div class="num">${patrons.length}</div><div class="lbl">Patrons</div></div>`;

  const rows = checked.map(b => `<tr>
    <td><strong>${b.title}</strong></td><td>${b.author}</td>
    <td>${b.checked_out_patron?.name || '—'}</td>
    <td style="color:var(--text2)">${b.checked_out_date || '—'}</td>
    <td>${b.due_date || '—'}</td>
    <td>${bookStatusBadge(b)}</td>
    <td>${b.hold_patron ? `<span class="bdg bdg-hold">${b.hold_patron.name}</span>` : '—'}</td>
  </tr>`).join('');
  document.getElementById('dash-table').innerHTML = rows ||
    '<tr><td colspan="7" class="empty">No books currently checked out</td></tr>';
}

// ── Books ────────────────────────────────────────────────────────────────────
async function renderBooks() {
  setLoading('books-table', 6);
  const q = (document.getElementById('book-search').value || '').toLowerCase();
  let query = db.from('books')
    .select('*, checked_out_patron:patrons!books_checked_out_by_fkey(name), hold_patron:patrons!books_hold_by_fkey(name)')
    .order('title');
  const { data: books } = await query;
  const filtered = (books || []).filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    (b.isbn || '').toLowerCase().includes(q));

  const rows = filtered.map(b => `<tr>
    <td><strong>${b.title}</strong></td><td>${b.author}</td>
    <td style="color:var(--text2);font-size:11px">${b.isbn || '—'}</td>
    <td>${bookStatusBadge(b)}</td>
    <td>${b.hold_patron ? `<span class="bdg bdg-hold">${b.hold_patron.name}</span>` : '—'}</td>
    <td style="text-align:right;white-space:nowrap">
      <button class="btn sm" onclick="openEditBook(${b.id},'${escHtml(b.title)}','${escHtml(b.author)}','${escHtml(b.isbn||'')}')" style="margin-right:4px">Edit</button>
      <button class="btn danger sm" onclick="removeBook(${b.id},'${escHtml(b.title)}','${b.status}')">Remove</button>
    </td>
  </tr>`).join('');
  document.getElementById('books-table').innerHTML = rows ||
    '<tr><td colspan="6" class="empty">No books found</td></tr>';
}

function escHtml(s) { return String(s).replace(/'/g, "\\'"); }

async function addBook() {
  const title  = document.getElementById('ab-title').value.trim();
  const author = document.getElementById('ab-author').value.trim();
  const isbn   = document.getElementById('ab-isbn').value.trim();
  if (!title || !author) { showAlert('Title and author are required.', 'error'); return; }
  const { error } = await db.from('books').insert({ title, author, isbn, status: 'available' });
  if (error) { showAlert('Error: ' + error.message, 'error'); return; }
  closeModal('add-book');
  ['ab-title','ab-author','ab-isbn'].forEach(id => document.getElementById(id).value = '');
  renderBooks();
  showAlert(`"${title}" added to the library.`);
}

function openEditBook(id, title, author, isbn) {
  document.getElementById('eb-id').value     = id;
  document.getElementById('eb-title').value  = title;
  document.getElementById('eb-author').value = author;
  document.getElementById('eb-isbn').value   = isbn;
  openModal('edit-book');
}
async function saveBook() {
  const id     = parseInt(document.getElementById('eb-id').value);
  const title  = document.getElementById('eb-title').value.trim();
  const author = document.getElementById('eb-author').value.trim();
  const isbn   = document.getElementById('eb-isbn').value.trim();
  const { error } = await db.from('books').update({ title, author, isbn }).eq('id', id);
  if (error) { showAlert('Error: ' + error.message, 'error'); return; }
  closeModal('edit-book'); renderBooks();
}

async function removeBook(id, title, status) {
  if (status === 'checked') { showAlert('Cannot remove a checked-out book.', 'error'); return; }
  if (!confirm(`Remove "${title}"?`)) return;
  const { error } = await db.from('books').delete().eq('id', id);
  if (error) { showAlert('Error: ' + error.message, 'error'); return; }
  renderBooks();
}

// ── Patrons (Users) ──────────────────────────────────────────────────────────
async function renderUsers() {
  setLoading('users-table', 4);
  const q = (document.getElementById('user-search').value || '').toLowerCase();
  const [{ data: patrons }, { data: books }] = await Promise.all([
    db.from('patrons').select('*').order('name'),
    db.from('books').select('id, title, checked_out_by').eq('status', 'checked')
  ]);

  const filtered = (patrons || []).filter(u =>
    u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));

  const rows = filtered.map(u => {
    const out   = (books || []).filter(b => b.checked_out_by === u.id);
    const count = out.length;
    return `<tr>
      <td><strong>${u.name}</strong></td>
      <td style="color:var(--text2)">${u.email}</td>
      <td>
        <span style="font-size:12px;color:${count>=MAX_CHECKOUT?'var(--red)':'var(--text2)'}">${count}/${MAX_CHECKOUT}</span>
        ${limitPips(count)}
        <div style="margin-top:4px">${out.map(b=>`<span class="bdg bdg-checked">${b.title}</span>`).join(' ') ||
          '<span style="color:var(--text3);font-size:12px">None</span>'}</div>
      </td>
      <td style="text-align:right;white-space:nowrap">
        <button class="btn sm" onclick="openEditUser(${u.id},'${escHtml(u.name)}','${escHtml(u.email)}')" style="margin-right:4px">Edit</button>
        <button class="btn danger sm" onclick="removeUser(${u.id},'${escHtml(u.name)}')">Remove</button>
      </td>
    </tr>`;
  }).join('');
  document.getElementById('users-table').innerHTML = rows ||
    '<tr><td colspan="4" class="empty">No patrons found</td></tr>';
}

async function addUser() {
  const name  = document.getElementById('au-name').value.trim();
  const email = document.getElementById('au-email').value.trim();
  if (!name || !email) { showAlert('Name and email are required.', 'error'); return; }
  const { error } = await db.from('patrons').insert({ name, email });
  if (error) { showAlert('Error: ' + error.message, 'error'); return; }
  closeModal('add-user');
  ['au-name','au-email'].forEach(id => document.getElementById(id).value = '');
  renderUsers();
  showAlert(`Patron "${name}" added.`);
}

function openEditUser(id, name, email) {
  document.getElementById('eu-id').value    = id;
  document.getElementById('eu-name').value  = name;
  document.getElementById('eu-email').value = email;
  openModal('edit-user');
}
async function saveUser() {
  const id    = parseInt(document.getElementById('eu-id').value);
  const name  = document.getElementById('eu-name').value.trim();
  const email = document.getElementById('eu-email').value.trim();
  const { error } = await db.from('patrons').update({ name, email }).eq('id', id);
  if (error) { showAlert('Error: ' + error.message, 'error'); return; }
  closeModal('edit-user'); renderUsers();
}

async function removeUser(id, name) {
  const { data: out } = await db.from('books').select('id').eq('checked_out_by', id);
  if (out && out.length > 0) { showAlert('Cannot remove a patron with checked-out books.', 'error'); return; }
  if (!confirm(`Remove patron "${name}"?`)) return;
  await db.from('books').update({ hold_by: null }).eq('hold_by', id);
  const { error } = await db.from('patrons').delete().eq('id', id);
  if (error) { showAlert('Error: ' + error.message, 'error'); return; }
  renderUsers();
}

// ── Checkout ─────────────────────────────────────────────────────────────────
async function populateCheckout() {
  const [{ data: avail }, { data: patrons }, { data: checked }] = await Promise.all([
    db.from('books').select('id, title, author').eq('status', 'available').order('title'),
    db.from('patrons').select('*').order('name'),
    db.from('books').select('checked_out_by').eq('status', 'checked')
  ]);

  const countMap = {};
  (checked || []).forEach(b => { countMap[b.checked_out_by] = (countMap[b.checked_out_by] || 0) + 1; });

  document.getElementById('co-book').innerHTML = (avail || []).length
    ? (avail || []).map(b => `<option value="${b.id}">${b.title} — ${b.author}</option>`).join('')
    : '<option value="">No available books</option>';

  document.getElementById('co-user').innerHTML = (patrons || []).map(u => {
    const c = countMap[u.id] || 0;
    return `<option value="${u.id}" data-count="${c}">${u.name} (${c}/${MAX_CHECKOUT}${c >= MAX_CHECKOUT ? ' — AT LIMIT' : ''})`;
  }).join('');

  const d = new Date(); d.setDate(d.getDate() + 14);
  document.getElementById('co-due').value = d.toISOString().split('T')[0];
  updateUserLimitUI();
}

function updateUserLimitUI() {
  const sel = document.getElementById('co-user');
  const opt = sel.options[sel.selectedIndex];
  if (!opt) return;
  const count = parseInt(opt.dataset.count || 0);
  const name  = opt.text.split(' (')[0];
  const r = MAX_CHECKOUT - count;
  const el = document.getElementById('co-limit-info');
  if (r <= 0) {
    el.innerHTML = `<span style="color:var(--red);font-weight:700">⚠ ${name} is at the ${MAX_CHECKOUT}-book limit.</span>`;
  } else {
    el.innerHTML = `<span style="color:var(--text2)">${name}: ${count}/${MAX_CHECKOUT} — ${r} slot${r===1?'':'s'} remaining.</span>`;
  }
}

async function doCheckout() {
  const bid = parseInt(document.getElementById('co-book').value);
  const uid = parseInt(document.getElementById('co-user').value);
  const due = document.getElementById('co-due').value;
  if (!bid || !uid || !due) { showAlert('Please fill all required fields.', 'error'); return; }

  const { data: checked } = await db.from('books').select('id').eq('checked_out_by', uid).eq('status', 'checked');
  if ((checked || []).length >= MAX_CHECKOUT) {
    showAlert(`This patron is at the ${MAX_CHECKOUT}-book limit.`, 'error'); return;
  }

  const { data: book } = await db.from('books').select('title').eq('id', bid).single();
  const { data: patron } = await db.from('patrons').select('name').eq('id', uid).single();

  const { error } = await db.from('books').update({
    status: 'checked', checked_out_by: uid,
    checked_out_date: today(), due_date: due
  }).eq('id', bid);
  if (error) { showAlert('Error: ' + error.message, 'error'); return; }

  showAlert(`✓ "${book.title}" checked out to ${patron.name}. Due ${due}.`);
  populateCheckout(); updateNavBadge();
}

// ── Check In ─────────────────────────────────────────────────────────────────
async function populateCheckin() {
  const { data: out } = await db.from('books')
    .select('id, title, due_date, checked_out_patron:patrons!books_checked_out_by_fkey(name)')
    .eq('status', 'checked').order('title');
  document.getElementById('ci-book').innerHTML = (out || []).length
    ? (out || []).map(b =>
        `<option value="${b.id}">${b.title} — ${b.checked_out_patron?.name || '?'}${isOverdue(b.due_date) ? ' (OVERDUE)' : ''}</option>`
      ).join('')
    : '<option value="">No books checked out</option>';
}

async function doCheckin() {
  const bid = parseInt(document.getElementById('ci-book').value);
  if (!bid) return;

  const { data: book } = await db.from('books')
    .select('*, checked_out_patron:patrons!books_checked_out_by_fkey(name), hold_patron:patrons!books_hold_by_fkey(name)')
    .eq('id', bid).single();

  const borrower = book.checked_out_patron?.name || '?';
  const holdUser = book.hold_patron?.name || null;

  const { error } = await db.from('books').update({
    status: 'available', checked_out_by: null,
    checked_out_date: null, due_date: null, hold_by: null
  }).eq('id', bid);
  if (error) { showAlert('Error: ' + error.message, 'error'); return; }

  delete sentEmails[bid];
  let msg = `✓ "${book.title}" returned by ${borrower}.`;
  if (holdUser) msg += ` <strong>🔔 ${holdUser} has this book on hold — please notify them!</strong>`;
  showAlert(msg, holdUser ? 'hold' : 'success');
  populateCheckin(); renderDash();
}

// ── Checked Out tab ──────────────────────────────────────────────────────────
async function renderCheckedOut() {
  setLoading('checkedout-table', 7);
  const { data: books } = await db.from('books')
    .select('*, checked_out_patron:patrons!books_checked_out_by_fkey(name,email), hold_patron:patrons!books_hold_by_fkey(name)')
    .eq('status', 'checked').order('due_date');

  document.getElementById('co-tab-count').textContent =
    `${(books||[]).length} book${(books||[]).length===1?'':'s'} currently checked out`;

  const rows = (books || []).map(b => `<tr>
    <td><strong>${b.title}</strong></td><td>${b.author}</td>
    <td>${b.checked_out_patron?.name || '—'}</td>
    <td style="color:var(--text2)">${b.checked_out_patron?.email || '—'}</td>
    <td style="color:var(--text2)">${b.checked_out_date || '—'}</td>
    <td>${b.due_date || '—'}</td>
    <td>${b.hold_patron ? `<span class="bdg bdg-hold">${b.hold_patron.name}</span>` : '—'}</td>
  </tr>`).join('');
  document.getElementById('checkedout-table').innerHTML = rows ||
    '<tr><td colspan="7" class="empty">No books currently checked out</td></tr>';
}

// ── Overdue tab ──────────────────────────────────────────────────────────────
async function renderOverdue() {
  updateNavBadge();
  setLoading('overdue-table', 7);
  const { data: books } = await db.from('books')
    .select('*, checked_out_patron:patrons!books_checked_out_by_fkey(name,email)')
    .eq('status', 'checked');

  const od = (books || [])
    .filter(b => isOverdue(b.due_date))
    .sort((a, b) => daysOverdue(b.due_date) - daysOverdue(a.due_date));

  const btn = document.getElementById('email-all-btn');
  btn.style.display = od.length ? '' : 'none';
  document.getElementById('overdue-tab-count').textContent = od.length
    ? `${od.length} overdue book${od.length===1?'':'s'} — sorted by most overdue`
    : 'No overdue books';

  const rows = od.map((b, i) => {
    const days = daysOverdue(b.due_date);
    const sent = sentEmails[b.id] || 0;
    const bg   = i < Math.ceil(od.length / 2) ? 'background:rgba(220,50,50,.07)' : '';
    return `<tr style="${bg}">
      <td><span class="overdue-days">${days}d</span></td>
      <td><strong>${b.title}</strong></td><td>${b.author}</td>
      <td>${b.checked_out_patron?.name || '—'}</td>
      <td style="color:var(--text2)">${b.checked_out_patron?.email || '—'}</td>
      <td>${b.due_date}</td>
      <td style="text-align:right;white-space:nowrap">
        ${sent ? `<span class="sent-tag">✓ Sent ×${sent}</span>` : ''}
        <button class="btn email" onclick="openEmailModal(${b.id})">✉ Reminder</button>
      </td>
    </tr>`;
  }).join('');
  document.getElementById('overdue-table').innerHTML = rows ||
    '<tr><td colspan="7" class="empty" style="color:var(--green)">All books are on time!</td></tr>';
}

// ── Holds tab ─────────────────────────────────────────────────────────────────
async function renderHolds() {
  setLoading('holds-table', 6);
  const { data: books } = await db.from('books')
    .select('*, checked_out_patron:patrons!books_checked_out_by_fkey(name), hold_patron:patrons!books_hold_by_fkey(name)')
    .not('hold_by', 'is', null);

  const rows = (books || []).map(b => `<tr>
    <td><strong>${b.title}</strong></td><td>${b.author}</td>
    <td>${b.checked_out_patron?.name || 'Available'}</td>
    <td>${b.due_date || '—'}</td>
    <td><span class="bdg bdg-hold">${b.hold_patron?.name || '—'}</span></td>
    <td style="text-align:right">
      <button class="btn danger sm" onclick="removeHold(${b.id},'${escHtml(b.title)}')">Remove hold</button>
    </td>
  </tr>`).join('');
  document.getElementById('holds-table').innerHTML = rows ||
    '<tr><td colspan="6" class="empty">No holds currently placed</td></tr>';
}

async function populateHoldModal() {
  const [{ data: books }, { data: patrons }] = await Promise.all([
    db.from('books').select('id, title, checked_out_patron:patrons!books_checked_out_by_fkey(name)')
      .eq('status', 'checked').is('hold_by', null).order('title'),
    db.from('patrons').select('*').order('name')
  ]);
  document.getElementById('ah-book').innerHTML = (books || []).length
    ? (books || []).map(b => `<option value="${b.id}">${b.title} — ${b.checked_out_patron?.name || '?'}</option>`).join('')
    : '<option value="">No eligible books</option>';
  document.getElementById('ah-user').innerHTML = (patrons || [])
    .map(u => `<option value="${u.id}">${u.name}</option>`).join('');
}

async function addHold() {
  const bid = parseInt(document.getElementById('ah-book').value);
  const uid = parseInt(document.getElementById('ah-user').value);
  if (!bid || !uid) { showAlert('Please select a book and patron.', 'error'); return; }
  const { data: book } = await db.from('books').select('checked_out_by, title').eq('id', bid).single();
  if (book.checked_out_by === uid) {
    showAlert('A patron cannot hold a book they currently have.', 'error'); return;
  }
  const { error } = await db.from('books').update({ hold_by: uid }).eq('id', bid);
  if (error) { showAlert('Error: ' + error.message, 'error'); return; }
  closeModal('add-hold'); renderHolds();
  showAlert(`Hold placed on "${book.title}".`);
}

async function removeHold(id, title) {
  if (!confirm(`Remove hold on "${title}"?`)) return;
  const { error } = await db.from('books').update({ hold_by: null }).eq('id', id);
  if (error) { showAlert('Error: ' + error.message, 'error'); return; }
  renderHolds();
}

// ── Email ─────────────────────────────────────────────────────────────────────
async function openEmailModal(bookId) {
  const { data: b } = await db.from('books')
    .select('*, checked_out_patron:patrons!books_checked_out_by_fkey(name,email)')
    .eq('id', bookId).single();
  const days    = daysOverdue(b.due_date);
  const name    = b.checked_out_patron?.name  || '?';
  const email   = b.checked_out_patron?.email || '?';
  const subject = `Library overdue notice — "${b.title}"`;
  const body    = buildEmailBody(name, b.title, b.due_date, days);

  document.getElementById('em-sub').textContent    = `"${b.title}" — ${days} day${days===1?'':'s'} overdue`;
  document.getElementById('em-to').value           = email;
  document.getElementById('em-subject').value      = subject;
  document.getElementById('em-body').value         = body;
  document.getElementById('em-preview').textContent = `To: ${email}\nSubject: ${subject}\n\n${body}`;

  const refreshPreview = () => {
    document.getElementById('em-preview').textContent =
      `To: ${email}\nSubject: ${document.getElementById('em-subject').value}\n\n${document.getElementById('em-body').value}`;
  };
  document.getElementById('em-body').oninput    = refreshPreview;
  document.getElementById('em-subject').oninput = refreshPreview;

  emailPendingIds = [bookId];
  openModal('email');
}

async function sendEmail() {
  for (const bid of emailPendingIds) {
    sentEmails[bid] = (sentEmails[bid] || 0) + 1;
    const { data: b } = await db.from('books').select('checked_out_by').eq('id', bid).single();
    await db.from('email_log').insert({ book_id: bid, patron_id: b.checked_out_by });
  }
  const to = document.getElementById('em-to').value;
  closeModal('email');
  renderOverdue();
  showAlert(`✉ Reminder logged for ${to}.`, 'email');
}

async function emailAll() {
  const { data: books } = await db.from('books')
    .select('*, checked_out_patron:patrons!books_checked_out_by_fkey(name,email)')
    .eq('status', 'checked');
  const od = (books || [])
    .filter(b => isOverdue(b.due_date))
    .sort((a, b) => daysOverdue(b.due_date) - daysOverdue(a.due_date));
  if (!od.length) { showAlert('No overdue books.', 'error'); return; }

  const listHtml = od.map(b =>
    `<div>• <strong>${b.checked_out_patron?.name || '?'}</strong> <span style="color:var(--text2)">(${b.checked_out_patron?.email || ''})</span> — "${b.title}" <span class="bdg bdg-overdue">${daysOverdue(b.due_date)}d overdue</span></div>`
  ).join('');

  document.getElementById('ea-sub').textContent    = `${od.length} reminder${od.length===1?'':'s'} will be sent`;
  document.getElementById('ea-list').innerHTML     = listHtml;
  document.getElementById('ea-preview').textContent = buildEmailBody('[Patron Name]', '[Book Title]', '[Due Date]', '[N]');
  emailPendingIds = od.map(b => b.id);
  openModal('email-all');
}

async function confirmSendAll() {
  for (const bid of emailPendingIds) {
    sentEmails[bid] = (sentEmails[bid] || 0) + 1;
    const { data: b } = await db.from('books').select('checked_out_by').eq('id', bid).single();
    await db.from('email_log').insert({ book_id: bid, patron_id: b.checked_out_by });
  }
  const count = emailPendingIds.length;
  closeModal('email-all');
  renderOverdue();
  showAlert(`✉ ${count} overdue reminder${count===1?'':'s'} logged.`, 'email');
}

// ── Hold modal trigger ────────────────────────────────────────────────────────
function openHoldModal() {
  populateHoldModal().then(() => openModal('add-hold'));
}

// ── Boot ──────────────────────────────────────────────────────────────────────
checkAuth();
