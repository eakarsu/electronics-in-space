const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, status, mission_type } = req.query;
    let q = 'SELECT * FROM missions WHERE 1=1';
    const p = [];
    if (search) { p.push(`%${search}%`); q += ` AND (name ILIKE $${p.length} OR agency ILIKE $${p.length})`; }
    if (status) { p.push(status); q += ` AND status = $${p.length}`; }
    if (mission_type) { p.push(mission_type); q += ` AND mission_type = $${p.length}`; }
    q += ' ORDER BY launch_date DESC';
    res.json((await pool.query(q, p)).rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
  const r = await pool.query('SELECT * FROM missions WHERE id=$1', [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, mission_type, orbit_km, radiation_level, duration_days, launch_date, status, agency, budget_millions, success_probability } = req.body;
    const r = await pool.query('INSERT INTO missions (name,mission_type,orbit_km,radiation_level,duration_days,launch_date,status,agency,budget_millions,success_probability) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *', [name,mission_type,orbit_km,radiation_level,duration_days,launch_date,status,agency,budget_millions,success_probability]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, mission_type, orbit_km, radiation_level, duration_days, launch_date, status, agency, budget_millions, success_probability } = req.body;
    const r = await pool.query('UPDATE missions SET name=$1,mission_type=$2,orbit_km=$3,radiation_level=$4,duration_days=$5,launch_date=$6,status=$7,agency=$8,budget_millions=$9,success_probability=$10 WHERE id=$11 RETURNING *', [name,mission_type,orbit_km,radiation_level,duration_days,launch_date,status,agency,budget_millions,success_probability,req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  await pool.query('DELETE FROM missions WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

module.exports = router;
