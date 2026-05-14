// Orbit Environment Profiles
//
// Deep feature for electronics-in-space audit.
// Encodes radiation environment per orbit (AP9/AE9 trapped belts, CREME96 GCR,
// Jovian GIRE-2 for Europa, etc.) with shielding-thickness dose curves.
//
// Endpoints:
//   GET    /api/orbit-environments                          list profiles
//   GET    /api/orbit-environments/:id                      profile + dose curve
//   POST   /api/orbit-environments                          create profile
//   PUT    /api/orbit-environments/:id                      update profile
//   DELETE /api/orbit-environments/:id                      delete
//   POST   /api/orbit-environments/:id/curve                add (shield,dose) point
//   GET    /api/orbit-environments/:id/dose-at-shield       interp dose at thickness
//   POST   /api/orbit-environments/match-chip               recommend orbits for chip
//
// JWT-protected.

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const pool = require('../db');

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const { orbit_class } = req.query;
    const params = [];
    let sql = 'SELECT * FROM orbit_profiles';
    if (orbit_class) { params.push(orbit_class); sql += ` WHERE orbit_class = $${params.length}`; }
    sql += ' ORDER BY annual_tid_krad NULLS LAST';
    const r = await pool.query(sql, params);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const p = await pool.query('SELECT * FROM orbit_profiles WHERE id = $1', [req.params.id]);
    if (!p.rows[0]) return res.status(404).json({ error: 'Profile not found' });
    const c = await pool.query(
      'SELECT * FROM orbit_dose_curves WHERE profile_id = $1 ORDER BY shield_thickness_mm',
      [req.params.id]
    );
    res.json({ profile: p.rows[0], curve: c.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const {
      profile_name, orbit_class, altitude_km, inclination_deg, eccentricity,
      trapped_proton_model, trapped_electron_model, gcr_model, solar_activity,
      annual_tid_krad, shield_thickness_mm_al, peak_let_mev_cm2_mg, notes
    } = req.body || {};
    if (!profile_name) return res.status(400).json({ error: 'profile_name required' });
    const r = await pool.query(
      `INSERT INTO orbit_profiles
       (profile_name, orbit_class, altitude_km, inclination_deg, eccentricity,
        trapped_proton_model, trapped_electron_model, gcr_model, solar_activity,
        annual_tid_krad, shield_thickness_mm_al, peak_let_mev_cm2_mg, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [profile_name, orbit_class, altitude_km, inclination_deg, eccentricity,
       trapped_proton_model, trapped_electron_model, gcr_model, solar_activity,
       annual_tid_krad, shield_thickness_mm_al || 2.54, peak_let_mev_cm2_mg, notes]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const {
      profile_name, orbit_class, altitude_km, inclination_deg, eccentricity,
      trapped_proton_model, trapped_electron_model, gcr_model, solar_activity,
      annual_tid_krad, shield_thickness_mm_al, peak_let_mev_cm2_mg, notes
    } = req.body || {};
    const r = await pool.query(
      `UPDATE orbit_profiles SET
         profile_name=$1, orbit_class=$2, altitude_km=$3, inclination_deg=$4, eccentricity=$5,
         trapped_proton_model=$6, trapped_electron_model=$7, gcr_model=$8, solar_activity=$9,
         annual_tid_krad=$10, shield_thickness_mm_al=$11, peak_let_mev_cm2_mg=$12, notes=$13
       WHERE id=$14 RETURNING *`,
      [profile_name, orbit_class, altitude_km, inclination_deg, eccentricity,
       trapped_proton_model, trapped_electron_model, gcr_model, solar_activity,
       annual_tid_krad, shield_thickness_mm_al, peak_let_mev_cm2_mg, notes, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Profile not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM orbit_profiles WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/curve', async (req, res) => {
  try {
    const prof = await pool.query('SELECT id FROM orbit_profiles WHERE id = $1', [req.params.id]);
    if (!prof.rows[0]) return res.status(404).json({ error: 'Profile not found' });
    const { shield_thickness_mm, cumulative_dose_year_krad, proton_flux_per_cm2_s, electron_flux_per_cm2_s, notes } = req.body || {};
    if (shield_thickness_mm === undefined || cumulative_dose_year_krad === undefined) {
      return res.status(400).json({ error: 'shield_thickness_mm and cumulative_dose_year_krad required' });
    }
    const r = await pool.query(
      `INSERT INTO orbit_dose_curves (profile_id, shield_thickness_mm, cumulative_dose_year_krad, proton_flux_per_cm2_s, electron_flux_per_cm2_s, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.id, shield_thickness_mm, cumulative_dose_year_krad, proton_flux_per_cm2_s, electron_flux_per_cm2_s, notes]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Linear interpolation in log10(dose) vs shield_mm
router.get('/:id/dose-at-shield', async (req, res) => {
  try {
    const shield = Number(req.query.shield_mm);
    if (!isFinite(shield) || shield <= 0) return res.status(400).json({ error: 'shield_mm > 0 required' });
    const r = await pool.query(
      'SELECT shield_thickness_mm, cumulative_dose_year_krad FROM orbit_dose_curves WHERE profile_id=$1 ORDER BY shield_thickness_mm',
      [req.params.id]
    );
    const pts = r.rows.map(x => ({ s: Number(x.shield_thickness_mm), d: Number(x.cumulative_dose_year_krad) }))
                       .filter(x => isFinite(x.s) && x.d > 0);
    if (pts.length === 0) return res.status(404).json({ error: 'No dose curve for this profile' });
    if (pts.length === 1) return res.json({ shield_mm: shield, dose_year_krad: pts[0].d, method: 'single-point' });
    // bracket
    let lo = pts[0], hi = pts[pts.length - 1];
    for (let i = 0; i < pts.length - 1; i++) {
      if (pts[i].s <= shield && pts[i+1].s >= shield) { lo = pts[i]; hi = pts[i+1]; break; }
    }
    if (shield <= lo.s) {
      return res.json({ shield_mm: shield, dose_year_krad: lo.d, method: 'extrapolated-low' });
    }
    if (shield >= hi.s) {
      return res.json({ shield_mm: shield, dose_year_krad: hi.d, method: 'extrapolated-high' });
    }
    const t = (shield - lo.s) / (hi.s - lo.s);
    const logd = Math.log10(lo.d) + t * (Math.log10(hi.d) - Math.log10(lo.d));
    res.json({
      shield_mm: shield,
      dose_year_krad: Math.pow(10, logd),
      method: 'log-linear',
      bracket: { low: lo, high: hi }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Given a chip rad_hardening_level (0-10 scale), recommend feasible orbits at default shielding.
// Mapping: level N -> tolerated annual_tid ~ 10 + 10*N krad. Mission_years applied to thr.
router.post('/match-chip', async (req, res) => {
  try {
    const { chip_id, mission_years = 1 } = req.body || {};
    if (!chip_id) return res.status(400).json({ error: 'chip_id required' });
    const c = await pool.query('SELECT id, name, rad_hardening_level FROM chips WHERE id = $1', [chip_id]);
    if (!c.rows[0]) return res.status(404).json({ error: 'Chip not found' });
    const level = Number(c.rows[0].rad_hardening_level || 0);
    const toleratedKrad = 10 + level * 10;   // simple model
    const o = await pool.query('SELECT id, profile_name, orbit_class, annual_tid_krad FROM orbit_profiles ORDER BY annual_tid_krad');
    const matches = o.rows.map(row => {
      const mission_tid = Number(row.annual_tid_krad || 0) * Number(mission_years);
      const margin = toleratedKrad - mission_tid;
      let verdict;
      if (margin > toleratedKrad * 0.5) verdict = 'pass-with-margin';
      else if (margin > 0)              verdict = 'marginal';
      else                              verdict = 'fail';
      return {
        profile_id: row.id,
        profile_name: row.profile_name,
        orbit_class: row.orbit_class,
        annual_tid_krad: Number(row.annual_tid_krad),
        mission_tid_krad: mission_tid,
        chip_tolerated_krad: toleratedKrad,
        margin_krad: +margin.toFixed(2),
        verdict
      };
    });
    res.json({ chip: c.rows[0], mission_years, recommendations: matches });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
