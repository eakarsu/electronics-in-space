DROP TABLE IF EXISTS research_papers CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS chip_deployments CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS chips CASCADE;
DROP TABLE IF EXISTS manufacturers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
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
