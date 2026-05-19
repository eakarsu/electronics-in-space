// Mission Mass & Power Budgets per Subsystem
//
// Deep feature for electronics-in-space audit.
// Tracks mass+power allocations per spacecraft subsystem (C&DH, EPS, ADCS,
// TT&C, payload, propulsion, thermal, structure) with derating per
// MIL-STD-1547 (typical 0.7-0.85 per part class) and required margin per
// NASA-STD-1000 (25-30%).
//
// Endpoints:
//   GET    /api/subsystem-budgets                          list with mission filter
//   GET    /api/subsystem-budgets/:id                      detail
//   POST   /api/subsystem-budgets                          create
//   PUT    /api/subsystem-budgets/:id                      update
//   DELETE /api/subsystem-budgets/:id                      delete
//   GET    /api/subsystem-budgets/mission/:mission_id      mission roll-up
//   POST   /api/subsystem-budgets/:id/consume              record actual usage
//   POST   /api/subsystem-budgets/validate-margins         check NASA margin rules
//
// JWT-protected.

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const pool = require('../db');

router.use(verifyToken);

function compute(row) {
  const massAllocG = Number(row.mass_allocated_g || 0);
  const massUseG   = Number(row.mass_used_g || 0);
  const pAlloc     = Number(row.power_avg_allocated_w || 0);
  const pUse       = Number(row.power_avg_used_w || 0);
  const derate     = Number(row.derate_factor || 0.8);
  const reqMargin  = Number(row.margin_required_pct || 25);
  // derated power budget = allocation * derate_factor (per MIL-STD-1547)
  const pDerated   = pAlloc * derate;
  // headroom and margin
  const massMarginPct  = massAllocG > 0 ? +((massAllocG - massUseG) / massAllocG * 100).toFixed(2) : null;
  const powerMarginPct = pAlloc > 0   ? +((pAlloc - pUse) / pAlloc * 100).toFixed(2) : null;
  const meetsMassMargin  = massMarginPct === null  ? null : massMarginPct  >= reqMargin;
  const meetsPowerMargin = powerMarginPct === null ? null : powerMarginPct >= reqMargin;
  return {
    ...row,
    power_derated_w: +pDerated.toFixed(3),
    mass_margin_pct: massMarginPct,
    power_margin_pct: powerMarginPct,
    meets_mass_margin: meetsMassMargin,
    meets_power_margin: meetsPowerMargin
  };
}

router.get('/', async (req, res) => {
  try {
    const { mission_id, subsystem } = req.query;
    const params = [];
    const where = [];
    if (mission_id) { params.push(mission_id); where.push(`b.mission_id = $${params.length}`); }
    if (subsystem)  { params.push(subsystem);  where.push(`b.subsystem = $${params.length}`); }
    const sql = `
      SELECT b.*, m.name AS mission_name, m.mission_type, m.orbit_km,
             c.name AS chip_name, c.manufacturer AS chip_manufacturer
        FROM subsystem_budgets b
        LEFT JOIN missions m ON m.id = b.mission_id
        LEFT JOIN chips c    ON c.id = b.chip_id
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY b.mission_id, b.subsystem
    `;
    const r = await pool.query(sql, params);
    res.json(r.rows.map(compute));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT b.*, m.name AS mission_name, c.name AS chip_name
         FROM subsystem_budgets b
         LEFT JOIN missions m ON m.id = b.mission_id
         LEFT JOIN chips c    ON c.id = b.chip_id
         WHERE b.id = $1`,
      [req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Budget not found' });
    res.json(compute(r.rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const {
      mission_id, subsystem, mass_allocated_g, mass_used_g, power_avg_allocated_w,
      power_avg_used_w, power_peak_w, derate_factor, margin_required_pct,
      chip_id, notes
    } = req.body || {};
    if (!mission_id || !subsystem) return res.status(400).json({ error: 'mission_id and subsystem required' });
    const r = await pool.query(
      `INSERT INTO subsystem_budgets
       (mission_id, subsystem, mass_allocated_g, mass_used_g, power_avg_allocated_w,
        power_avg_used_w, power_peak_w, derate_factor, margin_required_pct, chip_id, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [mission_id, subsystem, mass_allocated_g, mass_used_g || 0, power_avg_allocated_w,
       power_avg_used_w || 0, power_peak_w, derate_factor || 0.8, margin_required_pct || 25, chip_id, notes]
    );
    res.status(201).json(compute(r.rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const {
      mission_id, subsystem, mass_allocated_g, mass_used_g, power_avg_allocated_w,
      power_avg_used_w, power_peak_w, derate_factor, margin_required_pct,
      chip_id, notes
    } = req.body || {};
    const r = await pool.query(
      `UPDATE subsystem_budgets SET
         mission_id=$1, subsystem=$2, mass_allocated_g=$3, mass_used_g=$4,
         power_avg_allocated_w=$5, power_avg_used_w=$6, power_peak_w=$7,
         derate_factor=$8, margin_required_pct=$9, chip_id=$10, notes=$11,
         updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [mission_id, subsystem, mass_allocated_g, mass_used_g, power_avg_allocated_w,
       power_avg_used_w, power_peak_w, derate_factor, margin_required_pct, chip_id, notes,
       req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Budget not found' });
    res.json(compute(r.rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM subsystem_budgets WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Mission-level roll-up
router.get('/mission/:mission_id', async (req, res) => {
  try {
    const mission = await pool.query('SELECT id, name, mission_type, orbit_km FROM missions WHERE id = $1', [req.params.mission_id]);
    if (!mission.rows[0]) return res.status(404).json({ error: 'Mission not found' });
    const r = await pool.query(
      `SELECT b.*, c.name AS chip_name
         FROM subsystem_budgets b
         LEFT JOIN chips c ON c.id = b.chip_id
         WHERE b.mission_id = $1
         ORDER BY b.subsystem`,
      [req.params.mission_id]
    );
    const rows = r.rows.map(compute);
    const totals = rows.reduce((acc, x) => ({
      mass_allocated_g: acc.mass_allocated_g + Number(x.mass_allocated_g || 0),
      mass_used_g:      acc.mass_used_g + Number(x.mass_used_g || 0),
      power_allocated_w: acc.power_allocated_w + Number(x.power_avg_allocated_w || 0),
      power_used_w:      acc.power_used_w + Number(x.power_avg_used_w || 0),
      power_peak_w:      acc.power_peak_w + Number(x.power_peak_w || 0),
      power_derated_w:   acc.power_derated_w + Number(x.power_derated_w || 0)
    }), { mass_allocated_g: 0, mass_used_g: 0, power_allocated_w: 0, power_used_w: 0, power_peak_w: 0, power_derated_w: 0 });

    res.json({
      mission: mission.rows[0],
      subsystems: rows,
      totals: {
        ...totals,
        mass_margin_pct:  totals.mass_allocated_g > 0
          ? +((totals.mass_allocated_g - totals.mass_used_g) / totals.mass_allocated_g * 100).toFixed(2)
          : null,
        power_margin_pct: totals.power_allocated_w > 0
          ? +((totals.power_allocated_w - totals.power_used_w) / totals.power_allocated_w * 100).toFixed(2)
          : null
      }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/consume', async (req, res) => {
  try {
    const { delta_mass_g = 0, delta_power_w = 0, note } = req.body || {};
    const r = await pool.query(
      `UPDATE subsystem_budgets SET
         mass_used_g = COALESCE(mass_used_g,0) + $1,
         power_avg_used_w = COALESCE(power_avg_used_w,0) + $2,
         notes = CASE WHEN $3 = '' OR $3 IS NULL THEN notes
                      ELSE COALESCE(notes,'') || E'\n' || $3 END,
         updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [delta_mass_g, delta_power_w, note, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Budget not found' });
    res.json(compute(r.rows[0]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/validate-margins', async (req, res) => {
  try {
    const { mission_id } = req.body || {};
    if (!mission_id) return res.status(400).json({ error: 'mission_id required' });
    const r = await pool.query(
      'SELECT * FROM subsystem_budgets WHERE mission_id = $1 ORDER BY subsystem',
      [mission_id]
    );
    const findings = r.rows.map(compute).map(row => {
      const issues = [];
      if (row.meets_mass_margin === false)  issues.push(`mass margin ${row.mass_margin_pct}% < required ${row.margin_required_pct}%`);
      if (row.meets_power_margin === false) issues.push(`power margin ${row.power_margin_pct}% < required ${row.margin_required_pct}%`);
      if (row.power_derated_w && row.power_avg_used_w && Number(row.power_avg_used_w) > row.power_derated_w) {
        issues.push(`power use ${row.power_avg_used_w}W exceeds derated budget ${row.power_derated_w}W`);
      }
      return { subsystem: row.subsystem, status: issues.length ? 'fail' : 'pass', issues };
    });
    res.json({ mission_id: Number(mission_id), findings });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
