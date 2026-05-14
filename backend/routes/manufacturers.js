const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { search } = req.query;
    let q = 'SELECT * FROM manufacturers WHERE 1=1';
    const p = [];
    if (search) { p.push(`%${search}%`); q += ` AND (name ILIKE $${p.length} OR country ILIKE $${p.length} OR specialization ILIKE $${p.length})`; }
    q += ' ORDER BY chip_count DESC';
    res.json((await pool.query(q, p)).rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
  const r = await pool.query('SELECT * FROM manufacturers WHERE id=$1', [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, country, specialization, certifications, founded_year, website } = req.body;
    const r = await pool.query('INSERT INTO manufacturers (name,country,specialization,certifications,founded_year,website) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [name,country,specialization,certifications,founded_year,website]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, country, specialization, certifications, founded_year, website } = req.body;
    const r = await pool.query('UPDATE manufacturers SET name=$1,country=$2,specialization=$3,certifications=$4,founded_year=$5,website=$6 WHERE id=$7 RETURNING *', [name,country,specialization,certifications,founded_year,website,req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  await pool.query('DELETE FROM manufacturers WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

module.exports = router;
