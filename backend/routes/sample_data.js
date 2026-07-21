// Sample Data routes — domain-realistic seeders for SpaceLab entities.
// Mounted at /api/admin → POST /api/admin/sample-data/:entity (JWT-protected).
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireRole, verifyToken } = require('../middleware/auth');

// ------------------------------- sample data ----------------------------------
const MANUFACTURERS = [
  { name: 'Texas Instruments', country: 'USA', specialization: 'Rad-hard MSP430 / data converters', certifications: 'MIL-PRF-38535 QML-V, ESCC', founded_year: 1930, website: 'https://www.ti.com/space' },
  { name: 'BAE Systems', country: 'USA', specialization: 'RAD750 / RAD5500 SBCs', certifications: 'MIL-STD-883 Class S', founded_year: 1999, website: 'https://www.baesystems.com/space' },
  { name: 'Honeywell Aerospace', country: 'USA', specialization: 'IMUs, rad-hard SoCs', certifications: 'AS9100D, MIL-PRF-38535', founded_year: 1906, website: 'https://aerospace.honeywell.com' },
  { name: 'Microchip / Microsemi', country: 'USA', specialization: 'Rad-tolerant FPGAs (RTG4, PolarFire)', certifications: 'QML-V, ESCC 9000', founded_year: 1989, website: 'https://www.microchip.com/space' },
  { name: 'STMicroelectronics', country: 'Switzerland', specialization: 'Rad-hard ASICs / ADCs', certifications: 'ESCC, QML-V', founded_year: 1987, website: 'https://www.st.com/space' },
  { name: 'Cobham Gaisler', country: 'Sweden', specialization: 'LEON / NOEL-V SPARC/RISC-V cores', certifications: 'ESCC', founded_year: 2001, website: 'https://www.gaisler.com' },
  { name: 'Infineon Technologies', country: 'Germany', specialization: 'Rad-hard power MOSFETs', certifications: 'ESCC 5000', founded_year: 1999, website: 'https://www.infineon.com/space' },
  { name: 'Renesas Electronics', country: 'Japan', specialization: 'Rad-tolerant memories & MCUs', certifications: 'QML-Q', founded_year: 2010, website: 'https://www.renesas.com/space' },
];

const CHIPS = [
  { name: 'RAD750', manufacturer: 'BAE Systems', process_node_nm: 250, tdp_watts: 5, mass_grams: 12, rad_hardening_level: 3, operating_temp_min: -55, operating_temp_max: 125, ops_per_second: 266000000, status: 'active', first_launch: '2005-08-12' },
  { name: 'RAD5545', manufacturer: 'BAE Systems', process_node_nm: 45, tdp_watts: 20, mass_grams: 25, rad_hardening_level: 3, operating_temp_min: -55, operating_temp_max: 125, ops_per_second: 5600000000, status: 'active', first_launch: '2018-04-02' },
  { name: 'LEON3FT', manufacturer: 'Cobham Gaisler', process_node_nm: 180, tdp_watts: 1.5, mass_grams: 8, rad_hardening_level: 3, operating_temp_min: -55, operating_temp_max: 125, ops_per_second: 100000000, status: 'active', first_launch: '2010-06-15' },
  { name: 'NOEL-V', manufacturer: 'Cobham Gaisler', process_node_nm: 65, tdp_watts: 2, mass_grams: 9, rad_hardening_level: 2, operating_temp_min: -40, operating_temp_max: 105, ops_per_second: 250000000, status: 'development', first_launch: '2024-01-10' },
  { name: 'RTG4 FPGA', manufacturer: 'Microchip / Microsemi', process_node_nm: 65, tdp_watts: 3, mass_grams: 30, rad_hardening_level: 3, operating_temp_min: -55, operating_temp_max: 125, ops_per_second: 1500000000, status: 'active', first_launch: '2017-03-20' },
  { name: 'PolarFire SoC', manufacturer: 'Microchip / Microsemi', process_node_nm: 28, tdp_watts: 4, mass_grams: 22, rad_hardening_level: 2, operating_temp_min: -40, operating_temp_max: 100, ops_per_second: 4000000000, status: 'active', first_launch: '2022-11-05' },
  { name: 'MSP430FR5969-SP', manufacturer: 'Texas Instruments', process_node_nm: 130, tdp_watts: 0.1, mass_grams: 2, rad_hardening_level: 2, operating_temp_min: -55, operating_temp_max: 125, ops_per_second: 16000000, status: 'active', first_launch: '2016-09-08' },
  { name: 'HXRHPPC', manufacturer: 'Honeywell Aerospace', process_node_nm: 350, tdp_watts: 4, mass_grams: 14, rad_hardening_level: 3, operating_temp_min: -55, operating_temp_max: 125, ops_per_second: 200000000, status: 'legacy', first_launch: '1999-07-23' },
];

const MISSIONS = [
  { name: 'James Webb Space Telescope', mission_type: 'observatory', orbit_km: 1500000, radiation_level: 'high', duration_days: 7300, launch_date: '2021-12-25', status: 'active', agency: 'NASA/ESA/CSA', budget_millions: 10000, success_probability: 0.99 },
  { name: 'Artemis II', mission_type: 'crewed_lunar', orbit_km: 384400, radiation_level: 'high', duration_days: 10, launch_date: '2026-04-01', status: 'planned', agency: 'NASA', budget_millions: 4100, success_probability: 0.92 },
  { name: 'Artemis III', mission_type: 'crewed_lunar_landing', orbit_km: 384400, radiation_level: 'high', duration_days: 30, launch_date: '2027-09-01', status: 'planned', agency: 'NASA', budget_millions: 7000, success_probability: 0.85 },
  { name: 'Europa Clipper', mission_type: 'planetary', orbit_km: 628000000, radiation_level: 'extreme', duration_days: 4015, launch_date: '2024-10-14', status: 'active', agency: 'NASA/JPL', budget_millions: 5200, success_probability: 0.9 },
  { name: 'Starlink Gen2 v3', mission_type: 'commsat', orbit_km: 550, radiation_level: 'low', duration_days: 1800, launch_date: '2024-02-12', status: 'active', agency: 'SpaceX', budget_millions: 50, success_probability: 0.97 },
  { name: 'GOES-U', mission_type: 'weather', orbit_km: 35786, radiation_level: 'medium', duration_days: 5475, launch_date: '2024-06-25', status: 'active', agency: 'NOAA/NASA', budget_millions: 11700, success_probability: 0.95 },
  { name: 'Mars Sample Return', mission_type: 'planetary', orbit_km: 225000000, radiation_level: 'high', duration_days: 2555, launch_date: '2030-07-15', status: 'planned', agency: 'NASA/ESA', budget_millions: 11000, success_probability: 0.78 },
  { name: 'PACE', mission_type: 'earth_observation', orbit_km: 676, radiation_level: 'medium', duration_days: 1095, launch_date: '2024-02-08', status: 'active', agency: 'NASA', budget_millions: 964, success_probability: 0.96 },
];

const RESEARCH_PAPERS = [
  { title: 'Single-Event Effects in 28nm SoCs Under Heavy-Ion Irradiation', authors: 'Smith, J.; Tanaka, R.; Mueller, K.', focus_area: 'radiation_effects', findings: 'SEU cross-section scales sub-linearly below LET 20 MeV·cm^2/mg; TMR mitigates 99.7% of upsets.', published_date: '2024-03-12', citations: 47, journal: 'IEEE Trans. Nuclear Science', doi: '10.1109/TNS.2024.0011' },
  { title: 'RAD750 Flight Heritage on Mars Reconnaissance Orbiter: 18-Year Telemetry Review', authors: 'Patel, A.; Gomez, L.', focus_area: 'flight_heritage', findings: 'Zero hard failures over 18 years; 3 SEU-induced reboots, all recovered by watchdog.', published_date: '2024-08-20', citations: 23, journal: 'Acta Astronautica', doi: '10.1016/j.actaastro.2024.07.022' },
  { title: 'PolarFire SoC Radiation Characterization for LEO Constellations', authors: 'Nguyen, P.; Bauer, S.', focus_area: 'rad_qualification', findings: 'TID tolerance 100 krad(Si); SEL immune to LET 75; suitable for 5-year LEO lifetimes.', published_date: '2025-01-09', citations: 12, journal: 'IEEE Aerospace Conf.', doi: '10.1109/AERO.2025.0044' },
  { title: 'Triple Modular Redundancy vs Lockstep on RISC-V for CubeSats', authors: 'Andersson, J.; Liu, W.', focus_area: 'fault_tolerance', findings: 'TMR adds 210% area but 9x MTBF; lockstep adds 105% area but 3x MTBF.', published_date: '2024-11-04', citations: 31, journal: 'ACM TECS', doi: '10.1145/3677001' },
  { title: 'Thermal Cycling of Rad-Hard FPGAs for JWST Sunshield Electronics', authors: 'O’Brien, M.; Zhao, Y.', focus_area: 'thermal', findings: 'No solder-joint failures after 5000 cycles −180/+125 °C with underfill.', published_date: '2023-09-30', citations: 58, journal: 'J. Spacecraft & Rockets', doi: '10.2514/1.A35421' },
  { title: 'Machine Learning Anomaly Detection on Satellite Bus Telemetry', authors: 'Kowalski, R.; Iyer, S.', focus_area: 'telemetry_analytics', findings: 'LSTM autoencoder beats threshold rules with 88% F1 across 12 GEO satellites.', published_date: '2025-02-18', citations: 6, journal: 'IEEE Access', doi: '10.1109/ACCESS.2025.0177' },
  { title: 'Total Ionizing Dose Effects on COTS NAND Flash for Smallsats', authors: 'Chen, H.; Vidal, F.', focus_area: 'radiation_effects', findings: 'TLC NAND bit-error onset at 15 krad; ECC raises usable dose to 50 krad.', published_date: '2024-05-22', citations: 19, journal: 'Microelectronics Reliability', doi: '10.1016/j.microrel.2024.114321' },
];

// ----------------------------- helper inserters -------------------------------
async function insertManufacturers() {
  const rows = MANUFACTURERS;
  for (const m of rows) {
    await pool.query(
      `INSERT INTO manufacturers (name, country, specialization, certifications, founded_year, chip_count, website)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [m.name, m.country, m.specialization, m.certifications, m.founded_year, 0, m.website]
    );
  }
  return rows.length;
}

async function insertChips() {
  const rows = CHIPS;
  for (const c of rows) {
    await pool.query(
      `INSERT INTO chips (name, manufacturer, process_node_nm, tdp_watts, mass_grams, rad_hardening_level, operating_temp_min, operating_temp_max, ops_per_second, status, first_launch)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [c.name, c.manufacturer, c.process_node_nm, c.tdp_watts, c.mass_grams, c.rad_hardening_level, c.operating_temp_min, c.operating_temp_max, c.ops_per_second, c.status, c.first_launch]
    );
  }
  return rows.length;
}

async function insertMissions() {
  const rows = MISSIONS;
  for (const m of rows) {
    await pool.query(
      `INSERT INTO missions (name, mission_type, orbit_km, radiation_level, duration_days, launch_date, status, agency, budget_millions, success_probability)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [m.name, m.mission_type, m.orbit_km, m.radiation_level, m.duration_days, m.launch_date, m.status, m.agency, m.budget_millions, m.success_probability]
    );
  }
  return rows.length;
}

async function insertDeployments() {
  // Pair existing chips with missions; gracefully degrade if either is empty.
  const chips = (await pool.query('SELECT id, name FROM chips ORDER BY id DESC LIMIT 25')).rows;
  const missions = (await pool.query('SELECT id, name FROM missions ORDER BY id DESC LIMIT 25')).rows;
  if (!chips.length || !missions.length) {
    const err = new Error('Insert chips and missions before deployments');
    err.status = 400;
    throw err;
  }
  const samples = [
    { perf: 0.97, sei: 0.0001, thermal: true,  power: 4.8,  status: 'nominal',     notes: 'Primary flight computer; TMR voting active.' },
    { perf: 0.93, sei: 0.0008, thermal: true,  power: 18.2, status: 'nominal',     notes: 'Onboard image processor for science payload.' },
    { perf: 0.88, sei: 0.0042, thermal: false, power: 2.1,  status: 'degraded',    notes: 'Thermal spike at perigee; reduced clock applied.' },
    { perf: 0.99, sei: 0.00005,thermal: true,  power: 3.4,  status: 'nominal',     notes: 'Cold-redundant spare; weekly health check.' },
    { perf: 0.95, sei: 0.0011, thermal: true,  power: 5.0,  status: 'nominal',     notes: 'AOCS controller; nominal Kalman residuals.' },
    { perf: 0.81, sei: 0.012,  thermal: true,  power: 1.6,  status: 'fault',       notes: 'SEL latch-up cleared by power cycle.' },
    { perf: 0.9,  sei: 0.0005, thermal: true,  power: 19.4, status: 'nominal',     notes: 'JWST FGS-NIRISS data handling unit.' },
    { perf: 0.87, sei: 0.003,  thermal: true,  power: 0.09, status: 'nominal',     notes: 'CubeSat housekeeping MCU.' },
  ];
  let inserted = 0;
  for (let i = 0; i < samples.length; i++) {
    const chip = chips[i % chips.length];
    const mission = missions[i % missions.length];
    const s = samples[i];
    const deployedAt = new Date(Date.now() - (30 + i * 45) * 86400000).toISOString().slice(0, 10);
    await pool.query(
      `INSERT INTO chip_deployments (chip_id, mission_id, performance_score, sei_rate, thermal_ok, power_consumed_w, status, deployed_at, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [chip.id, mission.id, s.perf, s.sei, s.thermal, s.power, s.status, deployedAt, `[${chip.name} on ${mission.name}] ${s.notes}`]
    );
    inserted++;
  }
  return inserted;
}

async function insertTests() {
  const chips = (await pool.query('SELECT id, name FROM chips ORDER BY id DESC LIMIT 25')).rows;
  if (!chips.length) {
    const err = new Error('Insert chips before tests');
    err.status = 400;
    throw err;
  }
  const samples = [
    { test_type: 'TID',          environment: 'Co-60 chamber',  result: 'pass',     temp: 25,  rad: 100, lab: 'NASA GSFC REF',                     pass: true,  failure_mode: null },
    { test_type: 'SEU',          environment: 'heavy-ion beam', result: 'pass',     temp: 25,  rad: 50,  lab: 'TAMU Cyclotron Institute',           pass: true,  failure_mode: null },
    { test_type: 'SEL',          environment: 'heavy-ion beam', result: 'fail',     temp: 85,  rad: 60,  lab: 'LBNL 88-Inch Cyclotron',             pass: false, failure_mode: 'Latch-up at LET 62 MeV·cm^2/mg' },
    { test_type: 'thermal_vac',  environment: 'TVAC chamber',   result: 'pass',     temp: -55, rad: 0,   lab: 'JPL Environmental Test Lab',         pass: true,  failure_mode: null },
    { test_type: 'vibration',    environment: 'shaker table',   result: 'pass',     temp: 25,  rad: 0,   lab: 'ESTEC ESA Vibration Facility',       pass: true,  failure_mode: null },
    { test_type: 'EMI/EMC',      environment: 'anechoic chamber', result: 'pass',   temp: 25,  rad: 0,   lab: 'NTS Albuquerque',                    pass: true,  failure_mode: null },
    { test_type: 'proton',       environment: 'proton beam',    result: 'marginal', temp: 25,  rad: 30,  lab: 'TRIUMF Proton Irradiation Facility', pass: true,  failure_mode: 'Elevated SEU above 60 MeV protons' },
    { test_type: 'burn-in',      environment: 'oven',           result: 'pass',     temp: 125, rad: 0,   lab: 'Honeywell Plymouth QA Lab',          pass: true,  failure_mode: null },
  ];
  let inserted = 0;
  for (let i = 0; i < samples.length; i++) {
    const chip = chips[i % chips.length];
    const s = samples[i];
    const date = new Date(Date.now() - (10 + i * 30) * 86400000).toISOString().slice(0, 10);
    await pool.query(
      `INSERT INTO tests (chip_id, test_type, environment, result, temperature_c, radiation_dose_krad, test_date, lab, pass, failure_mode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [chip.id, s.test_type, s.environment, s.result, s.temp, s.rad, date, s.lab, s.pass, s.failure_mode]
    );
    inserted++;
  }
  return inserted;
}

async function insertResearch() {
  const rows = RESEARCH_PAPERS;
  for (const r of rows) {
    await pool.query(
      `INSERT INTO research_papers (title, authors, focus_area, findings, published_date, citations, journal, doi)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [r.title, r.authors, r.focus_area, r.findings, r.published_date, r.citations, r.journal, r.doi]
    );
  }
  return rows.length;
}

const HANDLERS = {
  manufacturers: insertManufacturers,
  chips: insertChips,
  missions: insertMissions,
  deployments: insertDeployments,
  tests: insertTests,
  research: insertResearch,
};

router.post('/sample-data/:entity', verifyToken, requireRole('admin'), async (req, res) => {
  const entity = String(req.params.entity || '').toLowerCase();
  const handler = HANDLERS[entity];
  if (!handler) {
    return res.status(400).json({ error: `Unknown entity '${entity}'`, allowed: Object.keys(HANDLERS) });
  }
  try {
    const inserted = await handler();
    return res.json({ inserted, entity });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message });
  }
});

module.exports = router;
