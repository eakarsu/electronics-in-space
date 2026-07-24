-- Destructive demo bootstrap only. Production startup uses backend/migrate.js.
DROP TABLE IF EXISTS quality_events CASCADE;
DROP TABLE IF EXISTS part_change_orders CASCADE;
DROP TABLE IF EXISTS plan_overrides CASCADE;
DROP TABLE IF EXISTS lot_approvals CASCADE;
DROP TABLE IF EXISTS lot_exceptions CASCADE;
DROP TABLE IF EXISTS lot_inspections CASCADE;
DROP TABLE IF EXISTS quality_lots CASCADE;
DROP TABLE IF EXISTS bom_requirements CASCADE;
DROP TABLE IF EXISTS qualified_parts CASCADE;
DROP TABLE IF EXISTS qualified_suppliers CASCADE;
DROP TABLE IF EXISTS audit_history CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS schema_migrations CASCADE;
DROP TABLE IF EXISTS research_papers CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS chip_deployments CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS chips CASCADE;
DROP TABLE IF EXISTS manufacturers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(80) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  tenant_id INT REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE manufacturers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  country VARCHAR(100),
  specialization VARCHAR(255),
  certifications TEXT,
  founded_year INTEGER,
  chip_count INTEGER DEFAULT 0,
  website VARCHAR(255)
);

CREATE TABLE chips (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  manufacturer VARCHAR(255),
  process_node_nm INTEGER,
  tdp_watts DECIMAL,
  mass_grams DECIMAL,
  rad_hardening_level INTEGER,
  operating_temp_min INTEGER,
  operating_temp_max INTEGER,
  ops_per_second BIGINT,
  status VARCHAR(30),
  first_launch DATE
);

CREATE TABLE missions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  mission_type VARCHAR(50),
  orbit_km INTEGER,
  radiation_level VARCHAR(30),
  duration_days INTEGER,
  launch_date DATE,
  status VARCHAR(30),
  agency VARCHAR(100),
  budget_millions DECIMAL,
  success_probability DECIMAL
);

CREATE TABLE chip_deployments (
  id SERIAL PRIMARY KEY,
  chip_id INT REFERENCES chips,
  mission_id INT REFERENCES missions,
  performance_score DECIMAL,
  sei_rate DECIMAL,
  thermal_ok BOOLEAN,
  power_consumed_w DECIMAL,
  status VARCHAR(30),
  deployed_at DATE,
  notes TEXT
);

CREATE TABLE tests (
  id SERIAL PRIMARY KEY,
  chip_id INT REFERENCES chips,
  test_type VARCHAR(50),
  environment VARCHAR(50),
  result VARCHAR(20),
  temperature_c INTEGER,
  radiation_dose_krad INTEGER,
  test_date DATE,
  lab VARCHAR(255),
  pass BOOLEAN,
  failure_mode TEXT
);

CREATE TABLE research_papers (
  id SERIAL PRIMARY KEY,
  title TEXT,
  authors TEXT,
  focus_area VARCHAR(100),
  findings TEXT,
  published_date DATE,
  citations INTEGER DEFAULT 0,
  journal VARCHAR(255),
  doi VARCHAR(255)
);

-- =====================================================================
-- Audit feature: Radiation Test Campaigns
-- Models real space-grade test programs (MIL-STD-883 TM1019, JESD57)
-- =====================================================================
DROP TABLE IF EXISTS rad_test_runs CASCADE;
DROP TABLE IF EXISTS rad_test_campaigns CASCADE;

CREATE TABLE rad_test_campaigns (
  id SERIAL PRIMARY KEY,
  chip_id INT REFERENCES chips(id) ON DELETE CASCADE,
  campaign_name VARCHAR(255) NOT NULL,
  test_standard VARCHAR(100),         -- MIL-STD-883 TM1019, JESD57, ESCC 22900
  facility VARCHAR(255),              -- Brookhaven, TAMU Cyclotron, UC Davis, LBNL, RADEF
  beam_type VARCHAR(50),              -- heavy-ion, proton, gamma-Co60, laser
  campaign_status VARCHAR(30) DEFAULT 'planned',  -- planned, in-progress, complete, failed
  total_tid_target_krad DECIMAL,
  dose_rate_rad_per_sec DECIMAL,
  start_date DATE,
  end_date DATE,
  pi_engineer VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rad_test_runs (
  id SERIAL PRIMARY KEY,
  campaign_id INT REFERENCES rad_test_campaigns(id) ON DELETE CASCADE,
  run_label VARCHAR(100),
  effect_type VARCHAR(30),            -- TID, SEU, SEL, SEFI, SET, DDD
  let_mev_cm2_mg DECIMAL,             -- Linear Energy Transfer for SEE
  fluence_particles_cm2 DECIMAL,
  cumulative_tid_krad DECIMAL,
  errors_observed INTEGER DEFAULT 0,
  cross_section_cm2 DECIMAL,          -- errors/fluence
  saturation_xs_cm2 DECIMAL,
  threshold_let DECIMAL,
  current_uA DECIMAL,
  vdd_voltage DECIMAL,
  pass BOOLEAN,
  run_at TIMESTAMP DEFAULT NOW(),
  observations TEXT
);

-- =====================================================================
-- Audit feature: Orbit Environment Profiles
-- Models AP9/AE9 trapped radiation + GCR/CREME96 backgrounds per orbit
-- =====================================================================
DROP TABLE IF EXISTS orbit_dose_curves CASCADE;
DROP TABLE IF EXISTS orbit_profiles CASCADE;

CREATE TABLE orbit_profiles (
  id SERIAL PRIMARY KEY,
  profile_name VARCHAR(255) NOT NULL,
  orbit_class VARCHAR(50),            -- LEO, MEO, GEO, GTO, lunar, deep-space
  altitude_km INTEGER,
  inclination_deg DECIMAL,
  eccentricity DECIMAL,
  trapped_proton_model VARCHAR(50),   -- AP9 v1.5, AP8-MIN, AP8-MAX
  trapped_electron_model VARCHAR(50), -- AE9 v1.5, AE8-MIN
  gcr_model VARCHAR(50),              -- CREME96, ISO15390, CREME-MC
  solar_activity VARCHAR(30),         -- solar-min, solar-max, worst-case
  annual_tid_krad DECIMAL,            -- behind 100 mils Al
  shield_thickness_mm_al DECIMAL DEFAULT 2.54,
  peak_let_mev_cm2_mg DECIMAL,
  notes TEXT
);

CREATE TABLE orbit_dose_curves (
  id SERIAL PRIMARY KEY,
  profile_id INT REFERENCES orbit_profiles(id) ON DELETE CASCADE,
  shield_thickness_mm DECIMAL,
  cumulative_dose_year_krad DECIMAL,
  proton_flux_per_cm2_s DECIMAL,
  electron_flux_per_cm2_s DECIMAL,
  notes VARCHAR(255)
);

-- =====================================================================
-- Audit feature: COTS Upscreening Workflows (NewSpace pattern)
-- Tracks per-lot screening steps: burn-in, PIND, X-ray, DPA, fine-leak
-- =====================================================================
DROP TABLE IF EXISTS upscreen_steps CASCADE;
DROP TABLE IF EXISTS upscreen_lots CASCADE;

CREATE TABLE upscreen_lots (
  id SERIAL PRIMARY KEY,
  chip_id INT REFERENCES chips(id) ON DELETE CASCADE,
  lot_code VARCHAR(100) NOT NULL,
  date_code VARCHAR(20),
  parts_received INTEGER,
  parts_accepted INTEGER DEFAULT 0,
  parts_rejected INTEGER DEFAULT 0,
  upscreen_class VARCHAR(50),         -- AEC-Q100 + rad-screen, MIL-883 Class B equiv, customer-spec
  customer VARCHAR(255),
  start_date DATE,
  complete_date DATE,
  status VARCHAR(30) DEFAULT 'in-progress',
  notes TEXT
);

CREATE TABLE upscreen_steps (
  id SERIAL PRIMARY KEY,
  lot_id INT REFERENCES upscreen_lots(id) ON DELETE CASCADE,
  step_order INTEGER,
  step_name VARCHAR(100),             -- visual, X-ray, PIND, fine-leak, gross-leak, burn-in, electrical, rad-screen, DPA
  standard_ref VARCHAR(100),          -- MIL-STD-883 TM2009, TM1014, TM1015
  duration_hours DECIMAL,
  temperature_c INTEGER,
  voltage_stress_v DECIMAL,
  parts_in INTEGER,
  parts_pass INTEGER,
  parts_fail INTEGER,
  yield_pct DECIMAL,
  performed_at TIMESTAMP DEFAULT NOW(),
  observations TEXT
);

-- =====================================================================
-- Audit feature: Mission Mass/Power Budgets per subsystem
-- =====================================================================
DROP TABLE IF EXISTS subsystem_budgets CASCADE;

CREATE TABLE subsystem_budgets (
  id SERIAL PRIMARY KEY,
  mission_id INT REFERENCES missions(id) ON DELETE CASCADE,
  subsystem VARCHAR(100),             -- C&DH, EPS, ADCS, TT&C, payload, propulsion, thermal, structure
  mass_allocated_g DECIMAL,
  mass_used_g DECIMAL DEFAULT 0,
  power_avg_allocated_w DECIMAL,
  power_avg_used_w DECIMAL DEFAULT 0,
  power_peak_w DECIMAL,
  derate_factor DECIMAL DEFAULT 0.8,  -- per MIL-STD-1547
  margin_required_pct DECIMAL DEFAULT 25.0,
  chip_id INT REFERENCES chips(id),
  notes TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================================
-- Audit feature: Rad-Hard Foundries (Tier-2 process registry)
-- =====================================================================
DROP TABLE IF EXISTS rad_hard_foundries CASCADE;

CREATE TABLE rad_hard_foundries (
  id SERIAL PRIMARY KEY,
  fab_name VARCHAR(255) NOT NULL,
  operator VARCHAR(255),
  location VARCHAR(255),
  country VARCHAR(100),
  process_name VARCHAR(255),          -- 7HP SOI, 22FDX RFSOI, RH150, RHBD-90
  process_node_nm INTEGER,
  rh_technique VARCHAR(100),          -- RHBP, RHBD, RHBSP, SOI
  tid_capability_krad DECIMAL,
  sel_let_threshold DECIMAL,
  itar_status VARCHAR(50),            -- ITAR, EAR, dual-use
  qml_certification VARCHAR(100),
  monthly_capacity_wafers INTEGER,
  status VARCHAR(30) DEFAULT 'active',
  customers TEXT,
  notes TEXT
);
