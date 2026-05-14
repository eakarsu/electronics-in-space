const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { writeAudit } = require('./audit');

async function callAI(userPrompt, systemPrompt = '') {
  if (!process.env.OPENROUTER_API_KEY) {
    const err = new Error('AI service not configured (OPENROUTER_API_KEY missing)');
    err.status = 503;
    throw err;
  }
  let resp;
  try {
    resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost', 'X-Title': 'SpaceLab' },
      body: JSON.stringify({ model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5', messages: [...(systemPrompt ? [{role:'system',content:systemPrompt}] : []), {role:'user',content:userPrompt}] })
    });
  } catch (e) {
    const err = new Error('AI provider unreachable');
    err.status = 503;
    throw err;
  }
  if (!resp.ok) {
    const err = new Error(`AI provider error (${resp.status})`);
    err.status = 503;
    throw err;
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || 'AI unavailable';
}

function aiHandler(systemPrompt, buildUserPrompt, action) {
  return async (req, res) => {
    try {
      const userPrompt = buildUserPrompt(req.body || {});
      const result = await callAI(userPrompt, systemPrompt);
      writeAudit(req, action, req.body).catch(() => {});
      res.json({ result });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  };
}

router.post('/chip-recommendation', verifyToken, aiHandler(
  'You are a space electronics expert specializing in radiation-hardened processors. Recommend specific chips (real products like RAD750, Leon3-FT, GR740, RAD5500, etc.) with justification for the given mission constraints. Include performance specs, radiation tolerance, power consumption, and mass. Discuss tradeoffs.',
  ({ mission_type, radiation_level, power_budget, mass_budget }) =>
    `Mission: ${mission_type}\nRadiation level: ${radiation_level}\nPower budget: ${power_budget}W\nMass budget: ${mass_budget}g`,
  'ai.chip-recommendation'
));

router.post('/performance-prediction', verifyToken, aiHandler(
  'You are a space systems performance analyst. Predict chip performance metrics including: expected SEU rate, total ionizing dose degradation over mission lifetime, thermal cycling effects, expected MTTF, performance degradation curve, and anomaly probability. Base predictions on typical space environment data.',
  ({ chip_id, mission_id, chip_name, orbit_km, duration_days }) =>
    `Chip: ${chip_name || chip_id}\nMission: ${mission_id || ''}\nOrbit: ${orbit_km || ''} km\nDuration: ${duration_days || ''} days`,
  'ai.performance-prediction'
));

router.post('/failure-risk', verifyToken, aiHandler(
  'You are a reliability engineer for space electronics. Assess failure probability and risk factors including: single event upset probability, latch-up risk, total ionizing dose failure threshold, displacement damage effects, failure mode analysis, and recommended mitigation strategies.',
  ({ chip_id, chip_name, mission_duration, mission_type, radiation_dose, radiation_dose_krad }) =>
    `Chip: ${chip_name || chip_id}\nMission type: ${mission_type || ''}\nMission duration: ${mission_duration || ''} days\nExpected radiation dose: ${radiation_dose || radiation_dose_krad || ''} krad`,
  'ai.failure-risk'
));

router.post('/mission-analysis', verifyToken, aiHandler(
  'You are a space mission electronics architect. Provide comprehensive electronics requirements analysis including: compute requirements, memory architecture, power management, thermal management, radiation tolerance requirements, redundancy strategies, data handling, communication systems, and technology readiness levels needed.',
  ({ mission_id, mission_name, orbit_km, duration_days }) =>
    `Mission: ${mission_name || mission_id}\nOrbit: ${orbit_km || ''} km\nDuration: ${duration_days || ''} days`,
  'ai.mission-analysis'
));

// === New AI features ===

router.post('/radiation-tolerance', verifyToken, aiHandler(
  'You are a radiation effects specialist for space-grade silicon. Given a chip and mission orbit/duration, predict total ionizing dose (TID) accumulated, expected SEU/SEL rates, displacement damage dose, the safety margin to spec, and a quantitative tolerance verdict (pass/marginal/fail). Provide numeric estimates with units (krad-Si, errors/bit-day, krad threshold).',
  ({ chip_name, manufacturer, orbit_km, mission_type, duration_days, shielding_mm }) =>
    `Chip: ${chip_name || ''}\nManufacturer: ${manufacturer || ''}\nOrbit: ${orbit_km || ''} km\nMission type: ${mission_type || ''}\nDuration: ${duration_days || ''} days\nShielding: ${shielding_mm || '2'} mm Al`,
  'ai.radiation-tolerance'
));

router.post('/telemetry-anomaly', verifyToken, aiHandler(
  'You are a spacecraft telemetry anomaly detector. Given a stream of telemetry samples (CSV-style or comma-separated values for temperature, current, voltage, SEU counters, error rates), identify anomalies, classify them (spike, drift, dropout, latch-up signature), assign severity (low/med/high/critical), and recommend operator actions. Produce a structured findings list.',
  ({ chip_name, telemetry, window_minutes }) =>
    `Chip: ${chip_name || 'unknown'}\nWindow: ${window_minutes || '60'} minutes\nTelemetry samples:\n${telemetry || ''}`,
  'ai.telemetry-anomaly'
));

router.post('/bom-optimizer', verifyToken, aiHandler(
  'You are a Bill-of-Materials optimizer for space electronics. Given a target subsystem and candidate parts, propose an optimized BOM that balances cost, mass, power, and reliability (rad-hard rating, MTTF). Output a table of selected parts with qty, unit cost, total cost, mass, power, reliability score, and a final summary of total cost vs. baseline and trade-offs taken.',
  ({ subsystem, parts, cost_target_usd, reliability_target }) =>
    `Subsystem: ${subsystem || ''}\nCandidate parts:\n${parts || ''}\nCost target: $${cost_target_usd || 'n/a'}\nReliability target: ${reliability_target || 'high'}`,
  'ai.bom-optimizer'
));

router.post('/redundancy-strategy', verifyToken, aiHandler(
  'You are a space-systems redundancy architect. Recommend a redundancy strategy (cold spare, warm spare, hot spare, TMR, dual-string, watchdog scrub, EDAC) for the given subsystem and criticality. Justify with FIT-rate math, mission phase coverage, mass/power overhead, and failure mode coverage. Output: chosen scheme, alternatives considered, and an implementation checklist.',
  ({ subsystem, criticality, mission_duration_days, mass_overhead_grams, power_overhead_w }) =>
    `Subsystem: ${subsystem || ''}\nCriticality: ${criticality || 'mission-critical'}\nMission duration: ${mission_duration_days || ''} days\nMass overhead allowed: ${mass_overhead_grams || ''} g\nPower overhead allowed: ${power_overhead_w || ''} W`,
  'ai.redundancy-strategy'
));

router.post('/mission-success', verifyToken, aiHandler(
  'You are a mission assurance analyst. Estimate the probability of mission success given the electronics architecture, environment, and design margins. Provide a numeric estimate (0-1) with confidence range, the top contributing risk drivers, and the highest-leverage mitigations that would raise the probability.',
  ({ mission_name, mission_type, orbit_km, duration_days, radiation_level, redundancy, key_components }) =>
    `Mission: ${mission_name || ''}\nType: ${mission_type || ''}\nOrbit: ${orbit_km || ''} km\nDuration: ${duration_days || ''} days\nRadiation: ${radiation_level || ''}\nRedundancy: ${redundancy || 'unspecified'}\nKey components: ${key_components || 'unspecified'}`,
  'ai.mission-success'
));

module.exports = router;
