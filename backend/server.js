require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/chips', require('./routes/chips'));
app.use('/api/missions', require('./routes/missions'));
app.use('/api/deployments', require('./routes/deployments'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/manufacturers', require('./routes/manufacturers'));
app.use('/api/research', require('./routes/research'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/exports', require('./routes/exports'));
app.use('/api/search', require('./routes/search'));
app.use('/api/admin', require('./routes/sample_data'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Best-effort: ensure audit_log table exists at startup
try { require('./routes/audit').ensureTable().catch(() => {}); } catch (e) {}

app.use('/api/gap-ai-thermal-envelope-solver', require('./routes/gap-ai-thermal-envelope-solver'));
app.use('/api/gap-ai-mass-budget-optimizer', require('./routes/gap-ai-mass-budget-optimizer'));
app.use('/api/gap-ai-single-event-upset', require('./routes/gap-ai-single-event-upset'));
app.use('/api/gap-ai-derating-advisor', require('./routes/gap-ai-derating-advisor'));
app.use('/api/gap-ai-test-coverage-gap', require('./routes/gap-ai-test-coverage-gap'));
app.use('/api/gap-nonai-eda-cad-upload', require('./routes/gap-nonai-eda-cad-upload'));
app.use('/api/gap-nonai-tier2-suppliers', require('./routes/gap-nonai-tier2-suppliers'));
app.use('/api/gap-nonai-itar-flags', require('./routes/gap-nonai-itar-flags'));
app.use('/api/gap-nonai-chamber-scheduling', require('./routes/gap-nonai-chamber-scheduling'));
app.use('/api/gap-nonai-orbit-telemetry-ingest', require('./routes/gap-nonai-orbit-telemetry-ingest'));
app.use('/api/cf-chip-digital-twin', require('./routes/cf-chip-digital-twin'));
app.use('/api/cf-itar-collaboration', require('./routes/cf-itar-collaboration'));
app.use('/api/cf-rad-test-plan-gen', require('./routes/cf-rad-test-plan-gen'));
app.use('/api/cf-mission-derating', require('./routes/cf-mission-derating'));
app.use('/api/cf-rad-hard-marketplace', require('./routes/cf-rad-hard-marketplace'));

// === Audit deep-feature implementations (2026-05-14) ===
app.use('/api/rad-test-campaigns',  require('./routes/rad-test-campaigns'));
app.use('/api/orbit-environments',  require('./routes/orbit-environments'));
app.use('/api/upscreen-lots',       require('./routes/upscreen-lots'));
app.use('/api/subsystem-budgets',   require('./routes/subsystem-budgets'));
app.use('/api/rad-hard-foundries',  require('./routes/rad-hard-foundries'));

// Health
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'electronics-in-space', ts: new Date().toISOString() }));

// Custom Views (mounted BEFORE 404/error handlers)
app.use('/api/custom-views', require('./routes/customViews'));

// 404 catch-all for unknown /api routes (must be AFTER all mounts)
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found', path: req.originalUrl }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => console.log(`SpaceLab backend running on port ${PORT}`));
