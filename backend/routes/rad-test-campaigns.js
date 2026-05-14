// Radiation Test Campaigns
//
// Deep feature for electronics-in-space audit.
// Models space-grade radiation qualification programs per MIL-STD-883 TM1019
// (TID), JESD57 (heavy-ion SEE), ESCC 22900/25100. Real facilities included
// in seed data: BNL NSRL, TAMU K500, LBNL 88", RADEF Jyvaskyla, UC Davis CNL.
//
// Endpoints:
//   GET    /api/rad-test-campaigns                              list + chip-aware filter
//   GET    /api/rad-test-campaigns/:id                          detail w/ runs
//   POST   /api/rad-test-campaigns                              create campaign
//   PUT    /api/rad-test-campaigns/:id                          update campaign
//   DELETE /api/rad-test-campaigns/:id                          delete
//   POST   /api/rad-test-campaigns/:id/runs                     append run
//   GET    /api/rad-test-campaigns/:id/cross-section-curve      Weibull-style fit
//   GET    /api/rad-test-campaigns/summary/by-effect            roll-up by effect type
//
// All routes JWT-protected via verifyToken (destructured - correct export).

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const pool = require('../db');

router.use(verifyToken);

// ---------- list ----------
router.get('/', async (req, res) => {
  try {
    const { chip_id, status, facility } = req.query;
    const where = [];
    const params = [];
    if (chip_id)  { params.push(chip_id);          where.push(`c.chip_id = $${params.length}`); }
    if (status)   { params.push(status);           where.push(`c.campaign_status = $${params.length}`); }
    if (facility) { params.push(`%${facility}%`);  where.push(`c.facility ILIKE $${params.length}`); }
    const sql = `
      SELECT c.*, ch.name AS chip_name, ch.manufacturer AS chip_manufacturer,
             (SELECT COUNT(*)::int FROM rad_test_runs r WHERE r.campaign_id = c.id) AS run_count,
             (SELECT COUNT(*)::int FROM rad_test_runs r WHERE r.campaign_id = c.id AND r.pass = false) AS fail_count
      FROM rad_test_campaigns c
      LEFT JOIN chips ch ON ch.id = c.chip_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY c.start_date DESC NULLS LAST, c.id DESC
    `;
    const r = await pool.query(sql, params);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- detail w/ runs ----------
router.get('/:id', async (req, res) => {
  try {
    const cmp = await pool.query(
      `SELECT c.*, ch.name AS chip_name, ch.manufacturer AS chip_manufacturer, ch.rad_hardening_level
         FROM rad_test_campaigns c
         LEFT JOIN chips ch ON ch.id = c.chip_id
         WHERE c.id = $1`,
      [req.params.id]
    );
    if (!cmp.rows[0]) return res.status(404).json({ error: 'Campaign not found' });
    const runs = await pool.query(
      'SELECT * FROM rad_test_runs WHERE campaign_id = $1 ORDER BY effect_type, let_mev_cm2_mg NULLS LAST, cumulative_tid_krad NULLS LAST',
      [req.params.id]
    );
    res.json({ campaign: cmp.rows[0], runs: runs.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- create ----------
router.post('/', async (req, res) => {
  try {
    const {
      chip_id, campaign_name, test_standard, facility, beam_type,
      campaign_status, total_tid_target_krad, dose_rate_rad_per_sec,
      start_date, end_date, pi_engineer, notes
    } = req.body || {};
    if (!chip_id || !campaign_name) {
      return res.status(400).json({ error: 'chip_id and campaign_name required' });
    }
    const r = await pool.query(
      `INSERT INTO rad_test_campaigns
       (chip_id, campaign_name, test_standard, facility, beam_type, campaign_status,
        total_tid_target_krad, dose_rate_rad_per_sec, start_date, end_date, pi_engineer, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [chip_id, campaign_name, test_standard, facility, beam_type, campaign_status || 'planned',
       total_tid_target_krad, dose_rate_rad_per_sec, start_date || null, end_date || null, pi_engineer, notes]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- update ----------
router.put('/:id', async (req, res) => {
  try {
    const {
      chip_id, campaign_name, test_standard, facility, beam_type,
      campaign_status, total_tid_target_krad, dose_rate_rad_per_sec,
      start_date, end_date, pi_engineer, notes
    } = req.body || {};
    const r = await pool.query(
      `UPDATE rad_test_campaigns SET
         chip_id=$1, campaign_name=$2, test_standard=$3, facility=$4, beam_type=$5,
         campaign_status=$6, total_tid_target_krad=$7, dose_rate_rad_per_sec=$8,
         start_date=$9, end_date=$10, pi_engineer=$11, notes=$12
       WHERE id=$13 RETURNING *`,
      [chip_id, campaign_name, test_standard, facility, beam_type, campaign_status,
       total_tid_target_krad, dose_rate_rad_per_sec, start_date || null, end_date || null,
       pi_engineer, notes, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Campaign not found' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- delete ----------
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM rad_test_campaigns WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- append run ----------
router.post('/:id/runs', async (req, res) => {
  try {
    const cmp = await pool.query('SELECT id FROM rad_test_campaigns WHERE id = $1', [req.params.id]);
    if (!cmp.rows[0]) return res.status(404).json({ error: 'Campaign not found' });
    const {
      run_label, effect_type, let_mev_cm2_mg, fluence_particles_cm2, cumulative_tid_krad,
      errors_observed, cross_section_cm2, saturation_xs_cm2, threshold_let,
      current_uA, vdd_voltage, pass, observations
    } = req.body || {};
    if (!effect_type) return res.status(400).json({ error: 'effect_type required (TID/SEU/SEL/SEFI/SET/DDD)' });
    // Auto-compute cross-section if fluence + errors present and not provided
    let xs = cross_section_cm2;
    if ((xs === undefined || xs === null) && Number(fluence_particles_cm2) > 0 && Number(errors_observed) >= 0) {
      xs = Number(errors_observed) / Number(fluence_particles_cm2);
    }
    const r = await pool.query(
      `INSERT INTO rad_test_runs
       (campaign_id, run_label, effect_type, let_mev_cm2_mg, fluence_particles_cm2,
        cumulative_tid_krad, errors_observed, cross_section_cm2, saturation_xs_cm2,
        threshold_let, current_uA, vdd_voltage, pass, observations)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [req.params.id, run_label, effect_type, let_mev_cm2_mg, fluence_particles_cm2,
       cumulative_tid_krad, errors_observed, xs, saturation_xs_cm2, threshold_let,
       current_uA, vdd_voltage, pass, observations]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- cross-section vs LET curve ----------
// Returns the (LET, XS) points for SEE runs in this campaign, plus a simple
// Weibull-style summary (LET_th, saturation XS) derived from the data.
router.get('/:id/cross-section-curve', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT effect_type, let_mev_cm2_mg, cross_section_cm2, fluence_particles_cm2,
              errors_observed, threshold_let, saturation_xs_cm2
         FROM rad_test_runs
         WHERE campaign_id = $1 AND effect_type IN ('SEU','SEL','SEFI','SET')
           AND let_mev_cm2_mg IS NOT NULL
         ORDER BY effect_type, let_mev_cm2_mg`,
      [req.params.id]
    );
    const points = r.rows.map(x => ({
      effect: x.effect_type,
      let: Number(x.let_mev_cm2_mg),
      xs: Number(x.cross_section_cm2 || 0)
    }));
    // Empirical: LET threshold = lowest LET with errors > 0; sat XS = max observed.
    const byEffect = {};
    for (const p of points) {
      const e = (byEffect[p.effect] = byEffect[p.effect] || { points: [], let_th: null, sat_xs: 0 });
      e.points.push({ let: p.let, xs: p.xs });
      if (p.xs > 0 && (e.let_th === null || p.let < e.let_th)) e.let_th = p.let;
      if (p.xs > e.sat_xs) e.sat_xs = p.xs;
    }
    res.json({ campaign_id: Number(req.params.id), curve: byEffect });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- summary by effect type across all campaigns ----------
router.get('/summary/by-effect', async (_req, res) => {
  try {
    const r = await pool.query(`
      SELECT effect_type,
             COUNT(*)::int AS run_count,
             SUM(errors_observed)::int AS total_errors,
             AVG(cross_section_cm2)::float AS avg_xs,
             MAX(cumulative_tid_krad)::float AS max_tid
        FROM rad_test_runs
       GROUP BY effect_type
       ORDER BY effect_type
    `);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
