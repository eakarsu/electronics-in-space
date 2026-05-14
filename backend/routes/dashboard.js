const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

async function safeCount(query, params = []) {
  try {
    const r = await pool.query(query, params);
    return parseInt(r.rows[0]?.count || 0, 10);
  } catch (e) {
    return 0;
  }
}

router.get('/stats', verifyToken, async (req, res) => {
  try {
    const [
      chipsTotal,
      chipsRadHard,
      missionsTotal,
      missionsActive,
      deploymentsActive,
      testsInProgress,
      manufacturersTotal,
    ] = await Promise.all([
      safeCount('SELECT COUNT(*)::int AS count FROM chips'),
      safeCount('SELECT COUNT(*)::int AS count FROM chips WHERE rad_hardening_level >= 2'),
      safeCount('SELECT COUNT(*)::int AS count FROM missions'),
      safeCount("SELECT COUNT(*)::int AS count FROM missions WHERE status IN ('active','operational','launched')"),
      safeCount("SELECT COUNT(*)::int AS count FROM chip_deployments WHERE status IN ('active','operational','deployed')"),
      safeCount("SELECT COUNT(*)::int AS count FROM tests WHERE result IN ('pending','running','in_progress') OR pass IS NULL"),
      safeCount('SELECT COUNT(*)::int AS count FROM manufacturers'),
    ]);

    let recent = [];
    try {
      const r = await pool.query(
        'SELECT id, user_email, action, details, created_at FROM audit_log ORDER BY created_at DESC LIMIT 10'
      );
      recent = r.rows;
    } catch (e) {
      recent = [];
    }

    res.json({
      kpis: {
        chips_rad_hard: chipsRadHard,
        chips_total: chipsTotal,
        missions_tracked: missionsTotal,
        missions_active: missionsActive,
        deployments_active: deploymentsActive,
        tests_in_progress: testsInProgress,
        manufacturers: manufacturersTotal,
      },
      recent_activity: recent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
