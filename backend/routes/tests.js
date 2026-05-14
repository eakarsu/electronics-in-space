const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, test_type } = req.query;
    let q = 'SELECT t.*, c.name as chip_name FROM tests t LEFT JOIN chips c ON t.chip_id=c.id WHERE 1=1';
    const p = [];
    if (search) { p.push(`%${search}%`); q += ` AND (c.name ILIKE $${p.length} OR t.lab ILIKE $${p.length})`; }
    if (test_type) { p.push(test_type); q += ` AND t.test_type = $${p.length}`; }
    q += ' ORDER BY t.test_date DESC';
    res.json((await pool.query(q, p)).rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
  const r = await pool.query('SELECT * FROM tests WHERE id=$1', [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { chip_id, test_type, environment, result, temperature_c, radiation_dose_krad, test_date, lab, pass, failure_mode } = req.body;
    const r = await pool.query('INSERT INTO tests (chip_id,test_type,environment,result,temperature_c,radiation_dose_krad,test_date,lab,pass,failure_mode) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *', [chip_id,test_type,environment,result,temperature_c,radiation_dose_krad,test_date,lab,pass,failure_mode]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { chip_id, test_type, environment, result, temperature_c, radiation_dose_krad, test_date, lab, pass, failure_mode } = req.body;
    const r = await pool.query('UPDATE tests SET chip_id=$1,test_type=$2,environment=$3,result=$4,temperature_c=$5,radiation_dose_krad=$6,test_date=$7,lab=$8,pass=$9,failure_mode=$10 WHERE id=$11 RETURNING *', [chip_id,test_type,environment,result,temperature_c,radiation_dose_krad,test_date,lab,pass,failure_mode,req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  await pool.query('DELETE FROM tests WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

module.exports = router;
