const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, status } = req.query;
    let q = 'SELECT * FROM chips WHERE 1=1';
    const p = [];
    if (search) { p.push(`%${search}%`); q += ` AND (name ILIKE $${p.length} OR manufacturer ILIKE $${p.length})`; }
    if (status) { p.push(status); q += ` AND status = $${p.length}`; }
    q += ' ORDER BY rad_hardening_level DESC, ops_per_second DESC';
    res.json((await pool.query(q, p)).rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
  const r = await pool.query('SELECT * FROM chips WHERE id=$1', [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, manufacturer, process_node_nm, tdp_watts, mass_grams, rad_hardening_level, operating_temp_min, operating_temp_max, ops_per_second, status, first_launch } = req.body;
    const r = await pool.query('INSERT INTO chips (name,manufacturer,process_node_nm,tdp_watts,mass_grams,rad_hardening_level,operating_temp_min,operating_temp_max,ops_per_second,status,first_launch) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *', [name,manufacturer,process_node_nm,tdp_watts,mass_grams,rad_hardening_level,operating_temp_min,operating_temp_max,ops_per_second,status,first_launch]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, manufacturer, process_node_nm, tdp_watts, mass_grams, rad_hardening_level, operating_temp_min, operating_temp_max, ops_per_second, status, first_launch } = req.body;
    const r = await pool.query('UPDATE chips SET name=$1,manufacturer=$2,process_node_nm=$3,tdp_watts=$4,mass_grams=$5,rad_hardening_level=$6,operating_temp_min=$7,operating_temp_max=$8,ops_per_second=$9,status=$10,first_launch=$11 WHERE id=$12 RETURNING *', [name,manufacturer,process_node_nm,tdp_watts,mass_grams,rad_hardening_level,operating_temp_min,operating_temp_max,ops_per_second,status,first_launch,req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  await pool.query('DELETE FROM chips WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

module.exports = router;
