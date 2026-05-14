const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

let initialized = false;
async function ensureTable() {
  if (initialized) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      user_email VARCHAR(255),
      action VARCHAR(120) NOT NULL,
      details JSONB,
      ip VARCHAR(64),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  initialized = true;
}

async function writeAudit(req, action, details) {
  try {
    await ensureTable();
    const u = req.user || {};
    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().slice(0, 60);
    await pool.query(
      'INSERT INTO audit_log (user_id, user_email, action, details, ip) VALUES ($1,$2,$3,$4,$5)',
      [u.id || null, u.email || null, action, details ? JSON.stringify(details).slice(0, 4000) : null, ip]
    );
  } catch (e) {
    // never let audit break the main request
    console.warn('audit write failed:', e.message);
  }
}

router.get('/', verifyToken, async (req, res) => {
  try {
    await ensureTable();
    const { search, action, user_email, limit } = req.query;
    let q = 'SELECT id, user_id, user_email, action, details, ip, created_at FROM audit_log WHERE 1=1';
    const p = [];
    if (search) { p.push(`%${search}%`); q += ` AND (action ILIKE $${p.length} OR user_email ILIKE $${p.length} OR COALESCE(details::text,'') ILIKE $${p.length})`; }
    if (action) { p.push(action); q += ` AND action = $${p.length}`; }
    if (user_email) { p.push(user_email); q += ` AND user_email = $${p.length}`; }
    p.push(Math.min(parseInt(limit) || 200, 1000));
    q += ` ORDER BY created_at DESC LIMIT $${p.length}`;
    res.json((await pool.query(q, p)).rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { action, details } = req.body || {};
    if (!action) return res.status(400).json({ error: 'action required' });
    await writeAudit(req, action, details);
    res.status(201).json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/actions', verifyToken, async (req, res) => {
  try {
    await ensureTable();
    const r = await pool.query('SELECT action, COUNT(*)::int AS count FROM audit_log GROUP BY action ORDER BY count DESC');
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
module.exports.writeAudit = writeAudit;
module.exports.ensureTable = ensureTable;
