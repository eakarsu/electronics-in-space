const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

// Cross-resource search & filter. Returns matched rows from each resource.
// Query params: q (text), resources (csv), status, manufacturer, mission_type, radiation_level, limit
router.get('/', verifyToken, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit) || 25, 200);
    const requested = (req.query.resources || 'chips,missions,deployments,tests,manufacturers,research')
      .split(',').map(s => s.trim()).filter(Boolean);
    const status = req.query.status || null;
    const manufacturer = req.query.manufacturer || null;
    const mission_type = req.query.mission_type || null;
    const radiation_level = req.query.radiation_level || null;
    const result = {};
    const like = `%${q}%`;

    async function run(name, sql, params) {
      try { result[name] = (await pool.query(sql, params)).rows; }
      catch (e) { result[name] = { error: e.message }; }
    }

    if (requested.includes('chips')) {
      const params = [];
      let where = '1=1';
      if (q) { params.push(like); where += ` AND (name ILIKE $${params.length} OR manufacturer ILIKE $${params.length})`; }
      if (status) { params.push(status); where += ` AND status = $${params.length}`; }
      if (manufacturer) { params.push(manufacturer); where += ` AND manufacturer = $${params.length}`; }
      params.push(limit);
      await run('chips', `SELECT id,name,manufacturer,status,rad_hardening_level,tdp_watts FROM chips WHERE ${where} ORDER BY rad_hardening_level DESC LIMIT $${params.length}`, params);
    }

    if (requested.includes('missions')) {
      const params = [];
      let where = '1=1';
      if (q) { params.push(like); where += ` AND (name ILIKE $${params.length} OR agency ILIKE $${params.length})`; }
      if (status) { params.push(status); where += ` AND status = $${params.length}`; }
      if (mission_type) { params.push(mission_type); where += ` AND mission_type = $${params.length}`; }
      if (radiation_level) { params.push(radiation_level); where += ` AND radiation_level = $${params.length}`; }
      params.push(limit);
      await run('missions', `SELECT id,name,mission_type,status,agency,radiation_level,duration_days FROM missions WHERE ${where} ORDER BY launch_date DESC LIMIT $${params.length}`, params);
    }

    if (requested.includes('deployments')) {
      const params = [];
      let where = '1=1';
      if (q) { params.push(like); where += ` AND (notes ILIKE $${params.length} OR status ILIKE $${params.length})`; }
      if (status) { params.push(status); where += ` AND status = $${params.length}`; }
      params.push(limit);
      await run('deployments', `SELECT id,chip_id,mission_id,status,performance_score,deployed_at FROM chip_deployments WHERE ${where} ORDER BY deployed_at DESC NULLS LAST LIMIT $${params.length}`, params);
    }

    if (requested.includes('tests')) {
      const params = [];
      let where = '1=1';
      if (q) { params.push(like); where += ` AND (test_type ILIKE $${params.length} OR lab ILIKE $${params.length} OR failure_mode ILIKE $${params.length})`; }
      params.push(limit);
      await run('tests', `SELECT id,chip_id,test_type,environment,result,pass,test_date FROM tests WHERE ${where} ORDER BY test_date DESC NULLS LAST LIMIT $${params.length}`, params);
    }

    if (requested.includes('manufacturers')) {
      const params = [];
      let where = '1=1';
      if (q) { params.push(like); where += ` AND (name ILIKE $${params.length} OR specialization ILIKE $${params.length} OR country ILIKE $${params.length})`; }
      params.push(limit);
      await run('manufacturers', `SELECT id,name,country,specialization,founded_year,chip_count FROM manufacturers WHERE ${where} ORDER BY chip_count DESC LIMIT $${params.length}`, params);
    }

    if (requested.includes('research')) {
      const params = [];
      let where = '1=1';
      if (q) { params.push(like); where += ` AND (title ILIKE $${params.length} OR authors ILIKE $${params.length} OR findings ILIKE $${params.length})`; }
      params.push(limit);
      await run('research', `SELECT id,title,authors,focus_area,journal,citations,published_date FROM research_papers WHERE ${where} ORDER BY citations DESC LIMIT $${params.length}`, params);
    }

    res.json({ q, filters: { status, manufacturer, mission_type, radiation_level }, results: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
