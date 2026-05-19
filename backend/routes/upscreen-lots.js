// COTS Upscreening Workflows
//
// Deep feature for electronics-in-space audit.
// Models the NewSpace upscreening pipeline used by SpaceX, Planet, Capella to
// take automotive-grade COTS silicon to space-qualified lots. Steps follow
// MIL-STD-883 test methods (TM2009 visual, TM2012 X-ray, TM2020 PIND,
// TM1014 fine-leak, TM1015 burn-in, TM1019 rad-screen).
//
// Endpoints:
//   GET    /api/upscreen-lots                    list lots
//   GET    /api/upscreen-lots/:id                lot + step trail
//   POST   /api/upscreen-lots                    create lot
//   PUT    /api/upscreen-lots/:id                update lot
//   DELETE /api/upscreen-lots/:id                delete
//   POST   /api/upscreen-lots/:id/steps          add a screening step
//   POST   /api/upscreen-lots/:id/advance        run next step (auto step_order, applies yield)
//   GET    /api/upscreen-lots/:id/cumulative-yield   end-to-end yield report
//
// JWT-protected.

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const pool = require('../db');

router.use(verifyToken);

// Default screening pipeline for COTS lots (used by /advance)
const DEFAULT_PIPELINE = [
  { step_name: 'incoming-visual',          standard_ref: 'MIL-STD-883 TM2009', duration_hours: 0.5,   temp: 25,  v: null,  yield: 0.998 },
  { step_name: 'X-ray',                    standard_ref: 'MIL-STD-883 TM2012', duration_hours: 1.0,   temp: 25,  v: null,  yield: 0.995 },
  { step_name: 'PIND',                     standard_ref: 'MIL-STD-883 TM2020', duration_hours: 2.0,   temp: 25,  v: null,  yield: 0.99  },
  { step_name: 'fine-leak',                standard_ref: 'MIL-STD-883 TM1014', duration_hours: 1.0,   temp: 25,  v: null,  yield: 0.997 },
  { step_name: 'electrical-25C',           standard_ref: 'datasheet ATE',      duration_hours: 0.25,  temp: 25,  v: 1.8,   yield: 0.99  },
  { step_name: 'burn-in-240hr',            standard_ref: 'MIL-STD-883 TM1015', duration_hours: 240.0, temp: 125, v: 2.0,   yield: 0.985 },
  { step_name: 'post-burn-in-electrical',  standard_ref: 'datasheet ATE',      duration_hours: 0.25,  temp: 25,  v: 1.8,   yield: 0.99  },
  { step_name: 'rad-screen-30krad',        standard_ref: 'MIL-STD-883 TM1019', duration_hours: 8.0,   temp: 25,  v: 1.8,   yield: 0.992 },
];

router.get('/', async (req, res) => {
  try {
    const { chip_id, status, customer } = req.query;
    const params = [];
    const where = [];
    if (chip_id)  { params.push(chip_id);          where.push(`l.chip_id = $${params.length}`); }
    if (status)   { params.push(status);           where.push(`l.status = $${params.length}`); }
    if (customer) { params.push(`%${customer}%`);  where.push(`l.customer ILIKE $${params.length}`); }
    const sql = `
      SELECT l.*, c.name AS chip_name, c.manufacturer AS chip_manufacturer,
             (SELECT COUNT(*)::int FROM upscreen_steps s WHERE s.lot_id = l.id) AS step_count,
             CASE WHEN l.parts_received > 0
                  THEN ROUND((l.parts_accepted::numeric / l.parts_received) * 100, 1)
                  ELSE NULL END AS final_yield_pct
        FROM upscreen_lots l
        LEFT JOIN chips c ON c.id = l.chip_id
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY l.start_date DESC NULLS LAST, l.id DESC
    `;
    const r = await pool.query(sql, params);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const lot = await pool.query(
      `SELECT l.*, c.name AS chip_name, c.manufacturer AS chip_manufacturer, c.rad_hardening_level
         FROM upscreen_lots l LEFT JOIN chips c ON c.id = l.chip_id WHERE l.id = $1`,
      [req.params.id]
    );
    if (!lot.rows[0]) return res.status(404).json({ error: 'Lot not found' });
    const steps = await pool.query(
      'SELECT * FROM upscreen_steps WHERE lot_id = $1 ORDER BY step_order, id',
      [req.params.id]
    );
    res.json({ lot: lot.rows[0], steps: steps.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const {
      chip_id, lot_code, date_code, parts_received, upscreen_class,
      customer, start_date, complete_date, status, notes
    } = req.body || {};
    if (!chip_id || !lot_code) return res.status(400).json({ error: 'chip_id and lot_code required' });
    const r = await pool.query(
      `INSERT INTO upscreen_lots
       (chip_id, lot_code, date_code, parts_received, parts_accepted, parts_rejected,
        upscreen_class, customer, start_date, complete_date, status, notes)
       VALUES ($1,$2,$3,$4,$4,0,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [chip_id, lot_code, date_code, parts_received || 0, upscreen_class, customer,
       start_date || null, complete_date || null, status || 'in-progress', notes]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const {
      chip_id, lot_code, date_code, parts_received, parts_accepted, parts_rejected,
      upscreen_class, customer, start_date, complete_date, status, notes
    } = req.body || {};
    const r = await pool.query(
      `UPDATE upscreen_lots SET
         chip_id=$1, lot_code=$2, date_code=$3, parts_received=$4, parts_accepted=$5,
         parts_rejected=$6, upscreen_class=$7, customer=$8, start_date=$9,
         complete_date=$10, status=$11, notes=$12
       WHERE id=$13 RETURNING *`,
      [chip_id, lot_code, date_code, parts_received, parts_accepted, parts_rejected,
       upscreen_class, customer, start_date || null, complete_date || null, status, notes,
       req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Lot not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM upscreen_lots WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Append a custom step
router.post('/:id/steps', async (req, res) => {
  try {
    const lot = await pool.query('SELECT id, parts_received FROM upscreen_lots WHERE id = $1', [req.params.id]);
    if (!lot.rows[0]) return res.status(404).json({ error: 'Lot not found' });
    const last = await pool.query(
      'SELECT COALESCE(MAX(step_order),0) AS n FROM upscreen_steps WHERE lot_id = $1',
      [req.params.id]
    );
    const step_order = Number(last.rows[0].n) + 1;
    const {
      step_name, standard_ref, duration_hours, temperature_c, voltage_stress_v,
      parts_in, parts_pass, parts_fail, observations
    } = req.body || {};
    if (!step_name) return res.status(400).json({ error: 'step_name required' });
    const _pin  = Number(parts_in);
    const _pp   = Number(parts_pass);
    const _yld  = _pin > 0 ? +((_pp / _pin) * 100).toFixed(2) : null;
    const r = await pool.query(
      `INSERT INTO upscreen_steps
       (lot_id, step_order, step_name, standard_ref, duration_hours, temperature_c,
        voltage_stress_v, parts_in, parts_pass, parts_fail, yield_pct, observations)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [req.params.id, step_order, step_name, standard_ref, duration_hours, temperature_c,
       voltage_stress_v, parts_in, parts_pass, parts_fail, _yld, observations]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Auto-advance: applies next step from DEFAULT_PIPELINE with expected yield.
router.post('/:id/advance', async (req, res) => {
  try {
    const lot = await pool.query('SELECT * FROM upscreen_lots WHERE id = $1', [req.params.id]);
    if (!lot.rows[0]) return res.status(404).json({ error: 'Lot not found' });
    const stepsRes = await pool.query(
      'SELECT step_name, parts_pass FROM upscreen_steps WHERE lot_id = $1 ORDER BY step_order',
      [req.params.id]
    );
    const done = stepsRes.rows.length;
    if (done >= DEFAULT_PIPELINE.length) return res.status(409).json({ error: 'Pipeline complete' });
    const cfg = DEFAULT_PIPELINE[done];
    const partsIn = done === 0
      ? Number(lot.rows[0].parts_received)
      : Number(stepsRes.rows[stepsRes.rows.length - 1].parts_pass);
    const partsPass = Math.floor(partsIn * cfg.yield);
    const partsFail = partsIn - partsPass;
    const yld = partsIn > 0 ? +((partsPass / partsIn) * 100).toFixed(2) : null;
    const r = await pool.query(
      `INSERT INTO upscreen_steps
       (lot_id, step_order, step_name, standard_ref, duration_hours, temperature_c,
        voltage_stress_v, parts_in, parts_pass, parts_fail, yield_pct, observations)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [req.params.id, done + 1, cfg.step_name, cfg.standard_ref, cfg.duration_hours,
       cfg.temp, cfg.v, partsIn, partsPass, partsFail, yld,
       `Auto-advance: applied default yield ${(cfg.yield*100).toFixed(1)}%`]
    );
    // After the final step, update lot totals.
    if (done + 1 === DEFAULT_PIPELINE.length) {
      await pool.query(
        `UPDATE upscreen_lots SET parts_accepted=$1, parts_rejected=$2, status='complete', complete_date=CURRENT_DATE WHERE id=$3`,
        [partsPass, Number(lot.rows[0].parts_received) - partsPass, req.params.id]
      );
    }
    res.status(201).json({ step: r.rows[0], steps_done: done + 1, pipeline_total: DEFAULT_PIPELINE.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/cumulative-yield', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT step_order, step_name, parts_in, parts_pass, parts_fail, yield_pct FROM upscreen_steps WHERE lot_id = $1 ORDER BY step_order',
      [req.params.id]
    );
    if (r.rows.length === 0) return res.json({ cumulative_yield_pct: 100, steps: [] });
    const first = Number(r.rows[0].parts_in) || 0;
    const last  = Number(r.rows[r.rows.length - 1].parts_pass) || 0;
    res.json({
      cumulative_yield_pct: first > 0 ? +((last / first) * 100).toFixed(2) : null,
      steps: r.rows
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
