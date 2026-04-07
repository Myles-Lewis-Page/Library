/* ============================================================
   LIBRARY MANAGER — styles.css
   ============================================================ */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #ffffff;
  --bg2:      #f4f7fb;
  --bg3:      #eaf0f8;
  --text:     #1a1a1a;
  --text2:    #555;
  --text3:    #999;
  --border:   #d0d8e4;
  --border2:  #b0bfce;
  --blue:     #185FA5;
  --blue2:    #0C447C;
  --blue-bg:  #e6f1fb;
  --green:    #3B6D11;
  --green-bg: #EAF3DE;
  --red:      #A32D2D;
  --red-bg:   #FCEBEB;
  --amber:    #854F0B;
  --amber-bg: #FAEEDA;
  --purple:   #3C3489;
  --purple-bg:#EEEDFE;
  --radius:   8px;
  --radius-lg:12px;
  --shadow:   0 1px 4px rgba(0,0,0,.09);
}

body {
  font-family: Arial, sans-serif;
  font-size: 14px;
  color: var(--text);
  background: var(--bg2);
  min-height: 100vh;
}

/* ── Login screen ────────────────────────────────────────────── */
#login-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0C447C 0%, #185FA5 60%, #2579c9 100%);
}
.login-card {
  background: var(--bg);
  border-radius: var(--radius-lg);
  padding: 36px 32px 28px;
  width: min(380px, 95vw);
  box-shadow: 0 8px 32px rgba(0,0,0,.22);
}
.login-logo {
  text-align: center;
  font-size: 38px;
  margin-bottom: 6px;
}
.login-card h1 {
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: var(--blue);
  margin-bottom: 4px;
}
.login-card p {
  text-align: center;
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 24px;
}
.login-card .form-group { margin-bottom: 14px; }
.login-card .form-group label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: .04em;
  margin-bottom: 5px;
}
.login-card .form-group input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 14px;
  font-family: Arial, sans-serif;
  color: var(--text);
  background: var(--bg);
  transition: border-color .15s;
}
.login-card .form-group input:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(24,95,165,.12);
}
.login-btn-full {
  width: 100%;
  padding: 10px;
  background: var(--blue);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: Arial, sans-serif;
  margin-top: 6px;
  transition: background .15s;
}
.login-btn-full:hover { background: var(--blue2); }
.login-btn-full:disabled { opacity: .6; cursor: default; }
#login-error {
  color: var(--red);
  font-size: 12px;
  text-align: center;
  min-height: 18px;
  margin-top: 10px;
}

/* ── App screen ──────────────────────────────────────────────── */
#app-screen { display: none; }

.topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: var(--blue);
  color: #fff;
  flex-wrap: wrap;
  box-shadow: 0 2px 8px rgba(0,0,0,.18);
}
.topbar h1 { font-size: 17px; font-weight: 700; flex: 1; min-width: 100px; }
.topbar-right { display: flex; align-items: center; gap: 10px; }
#user-email { font-size: 12px; color: rgba(255,255,255,.8); }
.logout-btn {
  padding: 5px 12px;
  background: rgba(255,255,255,.15);
  border: 1px solid rgba(255,255,255,.35);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 12px;
  color: #fff;
  font-family: Arial, sans-serif;
}
.logout-btn:hover { background: rgba(255,255,255,.28); }

nav { display: flex; gap: 3px; flex-wrap: wrap; }
nav button {
  padding: 5px 10px;
  border: 1px solid rgba(255,255,255,.3);
  border-radius: var(--radius);
  background: rgba(255,255,255,.1);
  cursor: pointer;
  font-size: 12px;
  color: rgba(255,255,255,.85);
  transition: all .15s;
  position: relative;
  font-family: Arial, sans-serif;
}
nav button.active {
  background: rgba(255,255,255,.9);
  color: var(--blue);
  font-weight: 700;
  border-color: #fff;
}
nav button:hover:not(.active) { background: rgba(255,255,255,.25); }
.badge-nav {
  display: inline-block;
  background: #e24b4a;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 10px;
  padding: 1px 5px;
  margin-left: 4px;
  vertical-align: middle;
}

/* ── Content ─────────────────────────────────────────────────── */
.content { padding: 14px; max-width: 1400px; margin: 0 auto; }
.panel { display: none; }
.panel.active { display: block; }

/* ── Toolbar ─────────────────────────────────────────────────── */
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; align-items: center; }
.toolbar input {
  flex: 1; min-width: 150px;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text);
  font-size: 13px;
  font-family: Arial, sans-serif;
}
.toolbar input:focus { outline: none; border-color: var(--blue); }

/* ── Buttons ─────────────────────────────────────────────────── */
.btn {
  padding: 7px 13px;
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  background: var(--bg);
  cursor: pointer;
  font-size: 12px;
  color: var(--text);
  white-space: nowrap;
  font-family: Arial, sans-serif;
  transition: background .12s;
}
.btn:hover { background: var(--bg3); }
.btn.sm { font-size: 11px; padding: 3px 9px; }
.btn.primary  { background: var(--blue);   color: #fff; border-color: var(--blue);   }
.btn.primary:hover  { background: var(--blue2); }
.btn.danger   { background: var(--red);    color: #fff; border-color: var(--red);    }
.btn.danger:hover   { background: #791F1F; }
.btn.success  { background: var(--green);  color: #fff; border-color: var(--green);  }
.btn.success:hover  { background: #27500A; }
.btn.warn     { background: var(--amber);  color: #fff; border-color: var(--amber);  }
.btn.warn:hover     { background: #633806; }
.btn.email    { background: var(--purple); color: #fff; border-color: var(--purple); font-size: 11px; padding: 4px 9px; }
.btn.email:hover    { background: #26215C; }
.btn.email-all{ background: var(--purple); color: #fff; border-color: var(--purple); }
.btn.email-all:hover{ background: #26215C; }

/* ── Table ───────────────────────────────────────────────────── */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  background: var(--bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow);
}
th {
  text-align: left;
  padding: 9px 10px;
  background: var(--blue);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
}
td { padding: 8px 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
tr:last-child td { border-bottom: none; }
tr:nth-child(even) td { background: var(--bg2); }
.empty { text-align: center; padding: 32px; color: var(--text3); font-size: 13px; }

/* ── Badges ──────────────────────────────────────────────────── */
.bdg { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; margin: 1px; }
.bdg-available { background: var(--green-bg); color: var(--green); }
.bdg-checked   { background: var(--amber-bg); color: var(--amber); }
.bdg-overdue   { background: var(--red-bg);   color: var(--red);   }
.bdg-hold      { background: var(--blue-bg);  color: var(--blue);  }
.overdue-days  { font-size: 12px; font-weight: 700; color: var(--red); }
.sent-tag      { font-size: 11px; color: var(--purple); background: var(--purple-bg); padding: 2px 7px; border-radius: 20px; margin-right: 6px; }

/* ── Stat cards ──────────────────────────────────────────────── */
.summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 10px; margin-bottom: 16px; }
.stat-card { background: var(--bg); border-radius: var(--radius); padding: 12px; text-align: center; border: 1px solid var(--border); box-shadow: var(--shadow); }
.stat-card .num { font-size: 26px; font-weight: 700; }
.stat-card .lbl { font-size: 11px; color: var(--text2); margin-top: 3px; }

/* ── Limit pips ──────────────────────────────────────────────── */
.limit-bar { display: flex; gap: 3px; margin-top: 3px; }
.limit-pip { width: 11px; height: 11px; border-radius: 2px; }
.pip-used  { background: var(--amber); }
.pip-empty { background: var(--border); }
.pip-over  { background: var(--red); }

/* ── Form panels ─────────────────────────────────────────────── */
.section-head { font-size: 15px; font-weight: 700; margin-bottom: 12px; color: var(--blue); }
.co-form {
  max-width: 480px;
  background: var(--bg);
  padding: 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

/* ── Modals ──────────────────────────────────────────────────── */
.modal-bg {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 200;
}
.modal {
  background: var(--bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  padding: 20px;
  width: min(480px, 95vw);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,.2);
}
.modal h2 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.modal-sub { font-size: 12px; color: var(--text2); margin-bottom: 16px; }
.form-group { margin-bottom: 12px; }
.form-group label {
  display: block;
  font-size: 11px;
  color: var(--text2);
  margin-bottom: 4px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .03em;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text);
  font-size: 13px;
  font-family: Arial, sans-serif;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { outline: none; border-color: var(--blue); }
.form-group textarea { resize: vertical; min-height: 100px; line-height: 1.5; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }

/* ── Alerts ──────────────────────────────────────────────────── */
.alert { padding: 10px 14px; border-radius: var(--radius); margin-bottom: 12px; font-size: 13px; border: 1px solid; line-height: 1.5; }
.alert-hold    { background: var(--blue-bg);   color: var(--blue);   border-color: #b5d4f4; }
.alert-success { background: var(--green-bg);  color: var(--green);  border-color: #c0dd97; }
.alert-error   { background: var(--red-bg);    color: var(--red);    border-color: #f7c1c1; }
.alert-email   { background: var(--purple-bg); color: var(--purple); border-color: #cecbf6; }

/* ── Email preview ───────────────────────────────────────────── */
.email-preview {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 10px;
}
