const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const { writeAudit } = require('./audit');

const TABLES = {
  chips: 'chips',
  missions: 'missions',
  deployments: 'chip_deployments',
  tests: 'tests',
  manufacturers: 'manufacturers',
  research: 'research_papers',
};

function toCsv(rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = cols.join(',');
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(',')).join('\n');
  return head + '\n' + body + '\n';
}

router.get('/:resource.csv', verifyToken, async (req, res) => {
  try {
    const tbl = TABLES[req.params.resource];
    if (!tbl) return res.status(404).json({ error: 'Unknown resource' });
    const r = await pool.query(`SELECT * FROM ${tbl} ORDER BY id`);
    const csv = toCsv(r.rows);
    writeAudit(req, 'export.csv', { resource: req.params.resource, rows: r.rows.length }).catch(() => {});
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.resource}.csv"`);
    res.send(csv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', verifyToken, async (req, res) => {
  res.json({ resources: Object.keys(TABLES), format: 'csv', usage: 'GET /api/exports/<resource>.csv' });
});

module.exports = router;
