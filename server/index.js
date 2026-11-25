/* Print Haus backend: accounts (email + password), artwork uploads, orders, admin. */
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 3000;
const PROD = process.env.NODE_ENV === 'production';
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 50);
const SESSION_DAYS = 30;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !/localhost|127\.0\.0\.1|\/tmp/.test(process.env.DATABASE_URL) ? { rejectUnauthorized: false } : false
});
const q = (text, params) => pool.query(text, params);

async function migrate() {
  await q(`
    create table if not exists users (
      id serial primary key, name text not null, email text not null unique, phone text,
      password_hash text, google_id text unique, created_at timestamptz default now());
    create table if not exists sessions (
      token text primary key, user_id int not null references users(id) on delete cascade,
      expires_at timestamptz not null);
    create table if not exists password_resets (
      token text primary key, user_id int not null references users(id) on delete cascade,
      expires_at timestamptz not null);
    create table if not exists uploads (
      id text primary key, user_id int references users(id) on delete set null, anon_id text,
      filename text not null, mime text, size int not null, data bytea not null,
      created_at timestamptz default now());
    create table if not exists orders (
      id text primary key, user_id int references users(id) on delete set null, anon_id text,
      customer jsonb not null, items jsonb not null, totals jsonb not null,
      ship text, payment text, status text not null default 'Awaiting proof',
      created_at timestamptz default now());
    create index if not exists orders_user on orders(user_id);
  `);
}

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());

// ---- helpers ----
const token = (n = 32) => crypto.randomBytes(n).toString('hex');
const cookieOpts = (days) => ({ httpOnly: true, sameSite: 'lax', secure: PROD, maxAge: days * 864e5, path: '/' });
const cleanEmail = (e) => String(e || '').trim().toLowerCase();
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const publicUser = (u) => u && { id: u.id, name: u.name, email: u.email, phone: u.phone };

// anonymous visitor id so uploads made before sign-in can be attached to the order
app.use((req, res, next) => {
  if (!req.cookies.ph_anon) { req.cookies.ph_anon = token(16); res.cookie('ph_anon', req.cookies.ph_anon, cookieOpts(90)); }
  next();
});
// session user
app.use(async (req, res, next) => {
  req.user = null;
  const t = req.cookies.ph_session;
  if (t) {
    try {
      const r = await q('select u.* from sessions s join users u on u.id = s.user_id where s.token = $1 and s.expires_at > now()', [t]);
      req.user = r.rows[0] || null;
    } catch (e) { /* db down: treat as signed out */ }
  }
  next();
});
async function startSession(res, userId) {
  const t = token();
  await q(`insert into sessions(token, user_id, expires_at) values ($1, $2, now() + interval '${SESSION_DAYS} days')`, [t, userId]);
  res.cookie('ph_session', t, cookieOpts(SESSION_DAYS));
}
const needUser = (req, res, next) => req.user ? next() : res.status(401).json({ error: 'Please sign in.' });

// simple brute-force limiter for auth routes
const hits = new Map();
function limit(key, max = 10, windowMs = 15 * 60e3) {
  const now = Date.now(); const h = (hits.get(key) || []).filter((t) => now - t < windowMs);
  h.push(now); hits.set(key, h); return h.length > max;
}

// ---- auth ----
app.post('/api/auth/signup', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = cleanEmail(req.body.email);
  const phone = String(req.body.phone || '').trim();
  const password = String(req.body.password || '');
  if (!name) return res.status(400).json({ error: 'Please enter your name.' });
  if (!validEmail(email)) return res.status(400).json({ error: 'Please enter a valid email.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  if (limit('signup:' + req.ip, 20)) return res.status(429).json({ error: 'Too many attempts. Try again later.' });
  const exists = await q('select id, password_hash from users where email = $1', [email]);
  if (exists.rows[0]) return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
  const hash = await bcrypt.hash(password, 11);
  const r = await q('insert into users(name, email, phone, password_hash) values ($1,$2,$3,$4) returning *', [name, email, phone, hash]);
  const user = r.rows[0];
  await q('update uploads set user_id = $1 where anon_id = $2 and user_id is null', [user.id, req.cookies.ph_anon]);
  await q('update orders set user_id = $1 where anon_id = $2 and user_id is null', [user.id, req.cookies.ph_anon]);
  await startSession(res, user.id);
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const email = cleanEmail(req.body.email);
  const password = String(req.body.password || '');
  if (limit('login:' + req.ip + ':' + email, 10)) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  const r = await q('select * from users where email = $1', [email]);
  const user = r.rows[0];
  if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  await q('update uploads set user_id = $1 where anon_id = $2 and user_id is null', [user.id, req.cookies.ph_anon]);
  await q('update orders set user_id = $1 where anon_id = $2 and user_id is null', [user.id, req.cookies.ph_anon]);
  await startSession(res, user.id);
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', async (req, res) => {
  if (req.cookies.ph_session) await q('delete from sessions where token = $1', [req.cookies.ph_session]);
  res.clearCookie('ph_session', { path: '/' });
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => res.json({ user: publicUser(req.user) }));

app.patch('/api/auth/me', needUser, async (req, res) => {
  const name = String(req.body.name || req.user.name).trim();
  const phone = String(req.body.phone ?? req.user.phone ?? '').trim();
  const r = await q('update users set name = $1, phone = $2 where id = $3 returning *', [name, phone, req.user.id]);
  res.json({ user: publicUser(r.rows[0]) });
});

app.post('/api/auth/change-password', needUser, async (req, res) => {
  const { current, next: nextPw } = req.body;
  if (String(nextPw || '').length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  if (req.user.password_hash && !(await bcrypt.compare(String(current || ''), req.user.password_hash))) return res.status(401).json({ error: 'Current password is incorrect.' });
  await q('update users set password_hash = $1 where id = $2', [await bcrypt.hash(String(nextPw), 11), req.user.id]);
  res.json({ ok: true });
});

// Password reset — emails a link through Brevo when BREVO_API_KEY and MAIL_FROM are set.
app.post('/api/auth/forgot', async (req, res) => {
  const email = cleanEmail(req.body.email);
  if (limit('forgot:' + req.ip, 5)) return res.status(429).json({ error: 'Too many attempts. Try again later.' });
  if (!process.env.BREVO_API_KEY || !process.env.MAIL_FROM) return res.status(501).json({ error: 'Password reset by email is not set up yet. Please contact us on WhatsApp.' });
  const r = await q('select * from users where email = $1', [email]);
  if (r.rows[0]) {
    const t = token();
    await q(`insert into password_resets(token, user_id, expires_at) values ($1, $2, now() + interval '1 hour')`, [t, r.rows[0].id]);
    const base = SITE_URL || (req.protocol + '://' + req.get('host'));
    const link = `${base}/login.html?reset=${t}`;
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST', headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { email: process.env.MAIL_FROM, name: process.env.MAIL_FROM_NAME || 'Print Haus' },
        to: [{ email, name: r.rows[0].name }], subject: 'Reset your password',
        htmlContent: `<p>Hi ${r.rows[0].name.replace(/[<>&]/g, '')},</p><p>Reset your password using this link (valid for 1 hour):</p><p><a href="${link}">${link}</a></p><p>If you didn't ask for this, ignore this email.</p>`
      })
    }).catch(() => {});
  }
  res.json({ ok: true }); // same answer whether or not the email exists
});

app.post('/api/auth/reset', async (req, res) => {
  const t = String(req.body.token || '');
  const pw = String(req.body.password || '');
  if (pw.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  const r = await q('delete from password_resets where token = $1 and expires_at > now() returning user_id', [t]);
  if (!r.rows[0]) return res.status(400).json({ error: 'This reset link has expired. Please request a new one.' });
  await q('update users set password_hash = $1 where id = $2', [await bcrypt.hash(pw, 11), r.rows[0].user_id]);
  await q('delete from sessions where user_id = $1', [r.rows[0].user_id]);
  await startSession(res, r.rows[0].user_id);
  res.json({ ok: true });
});

// ---- uploads ----
const ALLOWED = /\.(pdf|ai|eps|cdr|psd|svg|png|jpe?g|tiff?|zip|docx?|pptx?)$/i;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => cb(null, ALLOWED.test(file.originalname))
});
app.post('/api/uploads', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? `File is larger than ${MAX_UPLOAD_MB} MB. Please compress it or WhatsApp us.` : 'Upload failed.' });
    if (!req.file) return res.status(400).json({ error: 'Please choose a PDF, AI, CDR, PSD, PNG, JPG, TIFF or ZIP file.' });
    if (limit('upload:' + req.cookies.ph_anon, 40, 60 * 60e3)) return res.status(429).json({ error: 'Too many uploads. Try again later.' });
    const id = crypto.randomUUID();
    const name = path.basename(req.file.originalname).slice(0, 200);
    await q('insert into uploads(id, user_id, anon_id, filename, mime, size, data) values ($1,$2,$3,$4,$5,$6,$7)',
      [id, req.user ? req.user.id : null, req.cookies.ph_anon, name, req.file.mimetype, req.file.size, req.file.buffer]);
    res.json({ id, filename: name, size: req.file.size });
  });
});
const ownsUpload = (u, req) => (req.user && u.user_id === req.user.id) || u.anon_id === req.cookies.ph_anon;
function sendFile(res, u) {
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${u.filename.replace(/["\\\r\n]/g, '_')}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.send(u.data);
}
app.get('/api/uploads/:id', async (req, res) => {
  const r = await q('select * from uploads where id = $1', [req.params.id]);
  const u = r.rows[0];
  if (!u || !ownsUpload(u, req)) return res.status(404).json({ error: 'Not found' });
  sendFile(res, u);
});

// ---- orders ----
app.post('/api/orders', async (req, res) => {
  const { customer, items, totals, ship, payment } = req.body || {};
  if (!customer || !Array.isArray(items) || !items.length || !totals) return res.status(400).json({ error: 'Order is incomplete.' });
  if (items.length > 50) return res.status(400).json({ error: 'Too many items.' });
  // only allow attaching uploads that belong to this visitor
  const ids = items.map((i) => i.uploadId).filter(Boolean);
  if (ids.length) {
    const r = await q('select id, user_id, anon_id from uploads where id = any($1)', [ids]);
    const ok = new Set(r.rows.filter((u) => ownsUpload(u, req)).map((u) => u.id));
    items.forEach((i) => { if (i.uploadId && !ok.has(i.uploadId)) { delete i.uploadId; delete i.uploadName; } });
  }
  const id = 'PH' + Date.now().toString().slice(-7) + crypto.randomInt(10, 99);
  await q('insert into orders(id, user_id, anon_id, customer, items, totals, ship, payment) values ($1,$2,$3,$4,$5,$6,$7,$8)',
    [id, req.user ? req.user.id : null, req.cookies.ph_anon, customer, JSON.stringify(items), totals, String(ship || ''), String(payment || '')]);
  res.json({ id });
});
app.get('/api/orders', needUser, async (req, res) => {
  const r = await q('select id, items, totals, ship, payment, status, created_at from orders where user_id = $1 order by created_at desc limit 100', [req.user.id]);
  res.json({ orders: r.rows });
});

// ---- admin (header x-admin-key or ?key= for downloads) ----
const needAdmin = (req, res, next) => {
  const k = req.get('x-admin-key') || req.query.key;
  if (!ADMIN_KEY || !k || k.length !== ADMIN_KEY.length || !crypto.timingSafeEqual(Buffer.from(k), Buffer.from(ADMIN_KEY))) return res.status(401).json({ error: 'Admin key required' });
  next();
};
app.get('/api/admin/orders', needAdmin, async (req, res) => {
  const r = await q(`select o.*, u.email as account_email from orders o left join users u on u.id = o.user_id order by o.created_at desc limit 300`);
  res.json({ orders: r.rows });
});
app.patch('/api/admin/orders/:id', needAdmin, async (req, res) => {
  const status = String(req.body.status || '').slice(0, 60);
  await q('update orders set status = $1 where id = $2', [status, req.params.id]);
  res.json({ ok: true });
});
app.get('/api/admin/uploads/:id', needAdmin, async (req, res) => {
  const r = await q('select * from uploads where id = $1', [req.params.id]);
  if (!r.rows[0]) return res.status(404).end();
  sendFile(res, r.rows[0]);
});
app.get('/api/admin/stats', needAdmin, async (req, res) => {
  const r = await q(`select (select count(*) from users) users, (select count(*) from orders) orders, (select count(*) from uploads) uploads, (select coalesce(sum(size),0) from uploads) upload_bytes`);
  res.json(r.rows[0]);
});

app.get('/api/health', async (req, res) => { try { await q('select 1'); res.json({ ok: true }); } catch (e) { res.status(500).json({ ok: false }); } });
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// ---- static site (never serve server code, scripts or config) ----
app.use((req, res, next) => {
  if (/^\/(server|scripts|node_modules|\.git)(\/|$)|^\/(package(-lock)?\.json|wrangler\.jsonc|render\.yaml|README\.md|\.\w+)$/i.test(req.path)) return res.status(404).sendFile(path.join(ROOT, '404.html'));
  next();
});
app.use(express.static(ROOT, { extensions: ['html'], maxAge: PROD ? '1h' : 0 }));
app.use((req, res) => res.status(404).sendFile(path.join(ROOT, '404.html')));

// errors → JSON for API
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Something went wrong. Please try again.' }); });

migrate().then(() => app.listen(PORT, () => console.log('Print Haus running on :' + PORT))).catch((e) => { console.error('DB migration failed', e); process.exit(1); });
