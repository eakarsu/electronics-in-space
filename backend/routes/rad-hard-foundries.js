// Rad-Hard Foundry Registry (Tier-2 process tracking)
//
// Deep feature for electronics-in-space audit.
// Catalogs real radiation-hardened semiconductor fabs and processes:
//   - BAE Manassas (150nm RH SOI) — RAD750/RAD5500
//   - GlobalFoundries 32SOI / 22FDX RH — Trusted Foundry
//   - SkyWater Trusted Foundry (S130/RH90)
//   - Microchip Colorado Springs (180nm)
//   - ST Crolles C65SPACE (ESA sovereign)
//   - Tower TS18 RH SOI (Vorago HARDSIL)
//   - onsemi Pocatello (RH analog)
//   - Microsemi/Microchip RTG4 65nm flash-FPGA
//   - TSMC N7 automotive (NewSpace COTS-upscreen)
//
// Endpoints:
//   GET    /api/rad-hard-foundries                 list w/ filters
//   GET    /api/rad-hard-foundries/:id             detail
//   POST   /api/rad-hard-foundries                 create
//   PUT    /api/rad-hard-foundries/:id             update
//   DELETE /api/rad-hard-foundries/:id             delete
//   POST   /api/rad-hard-foundries/match           match foundries to chip target
//   GET    /api/rad-hard-foundries/summary/by-country  capacity roll-up
//
// JWT-protected.

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const pool = require('../db');

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const { country, itar_status, status, min_tid_krad } = req.query;
    const params = [];
    const where = [];
    if (country)      { params.push(country);      where.push(`country = $${params.length}`); }
    if (itar_status)  { params.push(itar_status);  where.push(`itar_status = $${params.length}`); }
    if (status)       { params.push(status);       where.push(`status = $${params.length}`); }
    if (min_tid_krad) { params.push(min_tid_krad); where.push(`tid_capability_krad >= $${params.length}`); }
    const sql = `
      SELECT * FROM rad_hard_foundries
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY tid_capability_krad DESC NULLS LAST, fab_name
    `;
    const r = await pool.query(sql, params);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM rad_hard_foundries WHERE id = $1', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Foundry not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const {
      fab_name, operator, location, country, process_name, process_node_nm,
      rh_technique, tid_capability_krad, sel_let_threshold, itar_status,
      qml_certification, monthly_capacity_wafers, status, customers, notes
    } = req.body || {};
    if (!fab_name) return res.status(400).json({ error: 'fab_name required' });
    const r = await pool.query(
      `INSERT INTO rad_hard_foundries
       (fab_name, operator, location, country, process_name, process_node_nm,
        rh_technique, tid_capability_krad, sel_let_threshold, itar_status,
        qml_certification, monthly_capacity_wafers, status, customers, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [fab_name, operator, location, country, process_name, process_node_nm,
       rh_technique, tid_capability_krad, sel_let_threshold, itar_status,
       qml_certification, monthly_capacity_wafers, status || 'active', customers, notes]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const {
      fab_name, operator, location, country, process_name, process_node_nm,
      rh_technique, tid_capability_krad, sel_let_threshold, itar_status,
      qml_certification, monthly_capacity_wafers, status, customers, notes
    } = req.body || {};
    const r = await pool.query(
      `UPDATE rad_hard_foundries SET
         fab_name=$1, operator=$2, location=$3, country=$4, process_name=$5,
         process_node_nm=$6, rh_technique=$7, tid_capability_krad=$8,
         sel_let_threshold=$9, itar_status=$10, qml_certification=$11,
         monthly_capacity_wafers=$12, status=$13, customers=$14, notes=$15
       WHERE id=$16 RETURNING *`,
      [fab_name, operator, location, country, process_name, process_node_nm,
       rh_technique, tid_capability_krad, sel_let_threshold, itar_status,
       qml_certification, monthly_capacity_wafers, status, customers, notes,
       req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Foundry not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM rad_hard_foundries WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Match foundries against a chip target spec.
// Body: { process_node_nm, tid_target_krad, sel_let_min, country, itar_required }
router.post('/match', async (req, res) => {
  try {
    const {
      process_node_nm, tid_target_krad, sel_let_min, country, itar_required, exclude_legacy = true
    } = req.body || {};
    const params = [];
    const where = [];
    if (exclude_legacy)       { where.push(`status <> 'legacy'`); }
    if (tid_target_krad)      { params.push(tid_target_krad); where.push(`tid_capability_krad >= $${params.length}`); }
    if (sel_let_min)          { params.push(sel_let_min);     where.push(`sel_let_threshold >= $${params.length}`); }
    if (country)              { params.push(country);         where.push(`country = $${params.length}`); }
    if (itar_required === true)  { where.push(`itar_status ILIKE '%ITAR%'`); }
    const sql = `
      SELECT *,
             CASE
               WHEN $${params.length + 1}::int IS NULL THEN 0
               ELSE ABS(process_node_nm - $${params.length + 1}::int)
             END AS node_distance
      FROM rad_hard_foundries
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY node_distance, tid_capability_krad DESC NULLS LAST
      LIMIT 10
    `;
    params.push(process_node_nm || null);
    const r = await pool.query(sql, params);
    const recommendations = r.rows.map(row => {
      const score =
        (Number(row.tid_capability_krad || 0) / 100) +
        (Number(row.sel_let_threshold || 0) / 10) -
        (Number(row.node_distance || 0) / 100);
      return { ...row, fit_score: +score.toFixed(2) };
    });
    res.json({
      criteria: { process_node_nm, tid_target_krad, sel_let_min, country, itar_required },
      recommendations
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/summary/by-country', async (_req, res) => {
  try {
    const r = await pool.query(`
      SELECT country,
             COUNT(*)::int AS foundry_count,
             SUM(monthly_capacity_wafers)::int AS total_capacity_wafers,
             AVG(tid_capability_krad)::float AS avg_tid_krad
        FROM rad_hard_foundries
        WHERE status <> 'legacy'
        GROUP BY country
        ORDER BY foundry_count DESC
    `);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
