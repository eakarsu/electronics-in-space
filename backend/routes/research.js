const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, focus_area } = req.query;
    let q = 'SELECT * FROM research_papers WHERE 1=1';
    const p = [];
    if (search) { p.push(`%${search}%`); q += ` AND (title ILIKE $${p.length} OR authors ILIKE $${p.length} OR findings ILIKE $${p.length})`; }
    if (focus_area) { p.push(focus_area); q += ` AND focus_area = $${p.length}`; }
    q += ' ORDER BY citations DESC, published_date DESC';
    res.json((await pool.query(q, p)).rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
  const r = await pool.query('SELECT * FROM research_papers WHERE id=$1', [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, authors, focus_area, findings, published_date, citations, journal, doi } = req.body;
    const r = await pool.query('INSERT INTO research_papers (title,authors,focus_area,findings,published_date,citations,journal,doi) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [title,authors,focus_area,findings,published_date,citations,journal,doi]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, authors, focus_area, findings, published_date, citations, journal, doi } = req.body;
    const r = await pool.query('UPDATE research_papers SET title=$1,authors=$2,focus_area=$3,findings=$4,published_date=$5,citations=$6,journal=$7,doi=$8 WHERE id=$9 RETURNING *', [title,authors,focus_area,findings,published_date,citations,journal,doi,req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  await pool.query('DELETE FROM research_papers WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

module.exports = router;
