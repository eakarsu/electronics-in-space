const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { search } = req.query;
    let q = 'SELECT d.*, c.name as chip_name, m.name as mission_name FROM chip_deployments d LEFT JOIN chips c ON d.chip_id=c.id LEFT JOIN missions m ON d.mission_id=m.id WHERE 1=1';
    const p = [];
    if (search) { p.push(`%${search}%`); q += ` AND (c.name ILIKE $${p.length} OR m.name ILIKE $${p.length})`; }
    q += ' ORDER BY d.deployed_at DESC';
    res.json((await pool.query(q, p)).rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
  const r = await pool.query('SELECT * FROM chip_deployments WHERE id=$1', [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { chip_id, mission_id, performance_score, sei_rate, thermal_ok, power_consumed_w, status, deployed_at, notes } = req.body;
    const r = await pool.query('INSERT INTO chip_deployments (chip_id,mission_id,performance_score,sei_rate,thermal_ok,power_consumed_w,status,deployed_at,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *', [chip_id,mission_id,performance_score,sei_rate,thermal_ok,power_consumed_w,status,deployed_at,notes]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { chip_id, mission_id, performance_score, sei_rate, thermal_ok, power_consumed_w, status, deployed_at, notes } = req.body;
    const r = await pool.query('UPDATE chip_deployments SET chip_id=$1,mission_id=$2,performance_score=$3,sei_rate=$4,thermal_ok=$5,power_consumed_w=$6,status=$7,deployed_at=$8,notes=$9 WHERE id=$10 RETURNING *', [chip_id,mission_id,performance_score,sei_rate,thermal_ok,power_consumed_w,status,deployed_at,notes,req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  await pool.query('DELETE FROM chip_deployments WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

module.exports = router;
