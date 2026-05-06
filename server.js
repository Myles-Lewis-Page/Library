const express = require('express');
const { Pool } = require('pg');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 7*24*60*60*1000 }
}));

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      isbn TEXT,
      genre TEXT,
      page_count INTEGER,
      copies INTEGER DEFAULT 1,
      cover_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS patrons (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS checkouts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      book_id UUID REFERENCES books(id) ON DELETE CASCADE,
      patron_id UUID REFERENCES patrons(id) ON DELETE CASCADE,
      checkout_type TEXT,
      checked_out_date DATE,
      due_date DATE,
      returned_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS holds (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      book_id UUID REFERENCES books(id) ON DELETE CASCADE,
      patron_id UUID REFERENCES patrons(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS email_log (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      checkout_id UUID,
      patron_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('DB ready');
}

function requireAdmin(req, res, next) {
  if (req.session?.isAdmin) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// AUTH
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
app.post('/api/auth/logout', (req, res) => { req.session.destroy(); res.json({ ok: true }); });
app.get('/api/auth/me', (req, res) => { res.json({ isAdmin: !!req.session?.isAdmin }); });

// BOOKS
app.get('/api/books', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM books ORDER BY title');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/books', requireAdmin, async (req, res) => {
  try {
    const { title, author, isbn, genre, page_count, copies, cover_url } = req.body;
    const r = await pool.query(
      'INSERT INTO books (title,author,isbn,genre,page_count,copies,cover_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [title, author, isbn||null, genre||null, page_count||null, copies||1, cover_url||null]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/books/:id', requireAdmin, async (req, res) => {
  try {
    const { title, author, isbn, genre, page_count, copies, cover_url } = req.body;
    const r = await pool.query(
      'UPDATE books SET title=$1,author=$2,isbn=$3,genre=$4,page_count=$5,copies=$6,cover_url=$7 WHERE id=$8 RETURNING *',
      [title, author, isbn||null, genre||null, page_count||null, copies||1, cover_url||null, req.params.id]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/books/:id', requireAdmin, async (req, res) => {
  try {
    const active = await pool.query('SELECT id FROM checkouts WHERE book_id=$1 AND returned_at IS NULL', [req.params.id]);
    if (active.rows.length) return res.status(400).json({ error: 'Book has active checkouts' });
    await pool.query('DELETE FROM books WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PATRONS
app.get('/api/patrons', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM patrons ORDER BY name');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/patrons/:id', requireAdmin, async (req, res) => {
  try {
    const patron = await pool.query('SELECT * FROM patrons WHERE id=$1', [req.params.id]);
    if (!patron.rows.length) return res.status(404).json({ error: 'Not found' });
    const checkouts = await pool.query(
      `SELECT c.*, b.title, b.author, b.genre, b.page_count, b.cover_url
       FROM checkouts c JOIN books b ON c.book_id=b.id
       WHERE c.patron_id=$1 ORDER BY c.checked_out_date DESC`,
      [req.params.id]
    );
    res.json({ patron: patron.rows[0], checkouts: checkouts.rows });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/patrons', requireAdmin, async (req, res) => {
  try {
    const { name, email } = req.body;
    const r = await pool.query('INSERT INTO patrons (name,email) VALUES ($1,$2) RETURNING *', [name, email||null]);
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/patrons/:id', requireAdmin, async (req, res) => {
  try {
    const { name, email } = req.body;
    const r = await pool.query('UPDATE patrons SET name=$1,email=$2 WHERE id=$3 RETURNING *', [name, email||null, req.params.id]);
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/patrons/:id', requireAdmin, async (req, res) => {
  try {
    const active = await pool.query('SELECT id FROM checkouts WHERE patron_id=$1 AND returned_at IS NULL', [req.params.id]);
    if (active.rows.length) return res.status(400).json({ error: 'Patron has active checkouts' });
    await pool.query('DELETE FROM holds WHERE patron_id=$1', [req.params.id]);
    await pool.query('DELETE FROM patrons WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// CHECKOUTS
app.get('/api/checkouts', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT c.*, b.title AS book_title, b.author AS book_author,
              b.genre AS book_genre, b.page_count AS book_page_count, b.copies AS book_copies,
              p.name AS student_name
       FROM checkouts c
       JOIN books b ON c.book_id=b.id
       JOIN patrons p ON c.patron_id=p.id
       ORDER BY c.due_date ASC`
    );
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/checkouts/active', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT c.*, b.title AS book_title, b.author AS book_author,
              b.genre AS book_genre, b.page_count AS book_page_count, b.copies AS book_copies,
              p.name AS student_name, p.email AS student_email
       FROM checkouts c
       JOIN books b ON c.book_id=b.id
       JOIN patrons p ON c.patron_id=p.id
       WHERE c.returned_at IS NULL ORDER BY c.due_date ASC`
    );
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/checkouts/due-dates', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query('SELECT due_date FROM checkouts WHERE returned_at IS NULL');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/checkouts/:id', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT c.*, b.title AS book_title, b.author AS book_author,
              p.name AS student_name, p.email AS student_email
       FROM checkouts c
       JOIN books b ON c.book_id=b.id
       JOIN patrons p ON c.patron_id=p.id
       WHERE c.id=$1`,
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/checkouts', requireAdmin, async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [req.body];
    const results = [];
    for (const row of rows) {
      const { book_id, patron_id, checkout_type, checked_out_date, due_date } = row;
      const r = await pool.query(
        'INSERT INTO checkouts (book_id,patron_id,checkout_type,checked_out_date,due_date) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [book_id, patron_id, checkout_type||null, checked_out_date||null, due_date||null]
      );
      results.push(r.rows[0]);
    }
    res.json(results.length === 1 ? results[0] : results);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/checkouts/:id/return', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      'UPDATE checkouts SET returned_at=$1 WHERE id=$2 RETURNING *',
      [new Date().toISOString(), req.params.id]
    );
    // Check for holds on this book
    const co = r.rows[0];
    const holds = await pool.query(
      'SELECT p.name FROM holds h JOIN patrons p ON h.patron_id=p.id WHERE h.book_id=$1 LIMIT 1',
      [co.book_id]
    );
    res.json({ checkout: co, nextHold: holds.rows[0] || null });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DASHBOARD STATS
app.get('/api/dashboard', requireAdmin, async (req, res) => {
  try {
    const [books, activeCheckouts, patrons, holds] = await Promise.all([
      pool.query('SELECT id, copies FROM books'),
      pool.query(`SELECT c.*, b.title AS book_title, b.author AS book_author,
                  p.name AS student_name FROM checkouts c
                  JOIN books b ON c.book_id=b.id JOIN patrons p ON c.patron_id=p.id
                  WHERE c.returned_at IS NULL ORDER BY c.due_date`),
      pool.query('SELECT id FROM patrons'),
      pool.query('SELECT id FROM holds'),
    ]);
    res.json({
      books: books.rows,
      activeCheckouts: activeCheckouts.rows,
      patrons: patrons.rows,
      holds: holds.rows,
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// CHECKOUT PAGE DATA
app.get('/api/checkout-page', requireAdmin, async (req, res) => {
  try {
    const [books, patrons, activeCheckouts] = await Promise.all([
      pool.query('SELECT * FROM books ORDER BY title'),
      pool.query('SELECT * FROM patrons ORDER BY name'),
      pool.query('SELECT book_id, patron_id, checkout_type FROM checkouts WHERE returned_at IS NULL'),
    ]);
    res.json({ books: books.rows, patrons: patrons.rows, activeCheckouts: activeCheckouts.rows });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// HOLDS
app.get('/api/holds', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT h.*, b.title AS book_title, b.author AS book_author,
              p.name AS student_name
       FROM holds h JOIN books b ON h.book_id=b.id JOIN patrons p ON h.patron_id=p.id
       ORDER BY h.created_at`
    );
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/holds', requireAdmin, async (req, res) => {
  try {
    const { book_id, patron_id } = req.body;
    const r = await pool.query('INSERT INTO holds (book_id,patron_id) VALUES ($1,$2) RETURNING *', [book_id, patron_id]);
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/holds/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM holds WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// EMAIL LOG
app.post('/api/email-log', requireAdmin, async (req, res) => {
  try {
    const { checkout_id, patron_id } = req.body;
    await pool.query('INSERT INTO email_log (checkout_id,patron_id) VALUES ($1,$2)', [checkout_id, patron_id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// REPORTS
app.get('/api/reports', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT c.*, b.id AS book_id, b.title AS book_title, b.author AS book_author,
              b.genre AS book_genre, b.page_count AS book_page_count, b.copies AS book_copies
       FROM checkouts c JOIN books b ON c.book_id=b.id ORDER BY c.created_at DESC`
    );
    res.json(r.rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

initDB().then(() => {
  app.listen(PORT, () => console.log(`Library running on port ${PORT}`));
}).catch(err => { console.error('DB init failed:', err); process.exit(1); });
