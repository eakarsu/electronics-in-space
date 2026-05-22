const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const pool = require('../db');

// TODO: configure credentials (OPENROUTER_API_KEY) in .env
// Feature: Thermal Envelope Solver (gap-ai) — auto-scaffolded from audit gap.
// Project: electronics-in-space

router.use(verifyToken);

async function ensureTable() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS gap_features (
      id SERIAL PRIMARY KEY,
      feature_slug TEXT NOT NULL,
      user_id INTEGER,
      input JSONB,
      output TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
  } catch (e) { /* swallow */ }
}

async function callAI(userPrompt, systemPrompt = '') {
  if (!process.env.OPENROUTER_API_KEY) return null;
  try {
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost',
        'X-Title': 'Thermal Envelope Solver'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: userPrompt }
        ]
      })
    });
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || 'AI unavailable';
  } catch (e) {
    return `AI error: ${e.message}`;
  }
}

function solveThermalEnvelope(body) {
  const component = body.component || body.part_number || 'space electronics assembly';
  const dissipatedW = Number(body.power_w || body.dissipated_w || body.heat_w || 8);
  const sinkTempC = Number(body.sink_temp_c || body.radiator_temp_c || body.ambient_c || 35);
  const thermalResistance = Number(body.thermal_resistance_c_per_w || body.theta_ca || 4.5);
  const maxJunctionC = Number(body.max_junction_c || body.limit_c || 125);
  const dutyCycle = Math.min(1, Math.max(0.05, Number(body.duty_cycle || 1)));
  const effectivePower = dissipatedW * dutyCycle;
  const estimatedJunctionC = sinkTempC + effectivePower * thermalResistance;
  const marginC = maxJunctionC - estimatedJunctionC;
  const status = marginC >= 20 ? 'green' : marginC >= 5 ? 'watch' : 'red';

  return [
    `Thermal envelope for ${component}: estimated junction temperature ${estimatedJunctionC.toFixed(1)}C against a ${maxJunctionC.toFixed(1)}C limit.`,
    `Status: ${status}; thermal margin ${marginC.toFixed(1)}C using ${effectivePower.toFixed(2)}W effective load and ${thermalResistance.toFixed(2)}C/W path.`,
    `Recommendations: ${marginC < 5 ? 'increase radiator area, lower duty cycle, or improve conduction path before qualification.' : 'keep current design but verify worst-case hot orbit and aging assumptions.'}`,
    `Data to collect: TVAC hot-case telemetry, board-level thermal map, mounting interface resistance, and radiation-induced power drift.`,
    'Caveat: deterministic fallback uses first-order thermal resistance math; configure OPENROUTER_API_KEY for narrative engineering review.',
  ].join('\n');
}

router.post('/', async (req, res) => {
  try {
    await ensureTable();
    const body = req.body || {};
    const systemPrompt = `You are an expert assistant for the "Thermal Envelope Solver" feature in the electronics-in-space platform. Provide actionable, specific, structured output.`;
    const userPrompt = `Feature: Thermal Envelope Solver
Kind: gap-ai
Context:
${JSON.stringify(body, null, 2)}

Please produce:
1. Summary of what this feature should do given the input.
2. Specific recommendations or computed outputs (3-7 bullets).
3. Suggested next steps or data the operator should collect.
4. Risk / caveat callouts.`;
    const result = await callAI(userPrompt, systemPrompt) || solveThermalEnvelope(body);
    try {
      await pool.query(
        'INSERT INTO gap_features (feature_slug, user_id, input, output) VALUES ($1,$2,$3,$4)',
        ['thermal-envelope-solver', req.user?.id || null, body, result]
      );
    } catch (e) { /* persistence optional */ }
    res.json({ feature: 'Thermal Envelope Solver', kind: 'gap-ai', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    await ensureTable();
    const r = await pool.query(
      'SELECT id, input, output, created_at FROM gap_features WHERE feature_slug=$1 ORDER BY created_at DESC LIMIT 25',
      ['thermal-envelope-solver']
    );
    res.json({ history: r.rows });
  } catch (err) {
    res.json({ history: [] });
  }
});

module.exports = router;
