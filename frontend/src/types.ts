export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface Chip {
  id: number;
  name: string;
  manufacturer: string;
  process_node_nm: number;
  tdp_watts: number;
  mass_grams: number;
  rad_hardening_level: number;
  operating_temp_min: number;
  operating_temp_max: number;
  ops_per_second: number;
  status: string;
  first_launch: string;
}

export interface Mission {
  id: number;
  name: string;
  mission_type: string;
  orbit_km: number;
  radiation_level: string;
  duration_days: number;
  launch_date: string;
  status: string;
  agency: string;
  budget_millions: number;
  success_probability: number;
}

export interface ChipDeployment {
  id: number;
  chip_id: number;
  mission_id: number;
  chip_name?: string;
  mission_name?: string;
  performance_score: number;
  sei_rate: number;
  thermal_ok: boolean;
  power_consumed_w: number;
  status: string;
  deployed_at: string;
  notes: string;
}

export interface Test {
  id: number;
  chip_id: number;
  chip_name?: string;
  test_type: string;
  environment: string;
  result: string;
  temperature_c: number;
  radiation_dose_krad: number;
  test_date: string;
  lab: string;
  pass: boolean;
  failure_mode: string;
}

export interface Manufacturer {
  id: number;
  name: string;
  country: string;
  specialization: string;
  certifications: string;
  founded_year: number;
  chip_count: number;
  website: string;
}

export interface ResearchPaper {
  id: number;
  title: string;
  authors: string;
  focus_area: string;
  findings: string;
  published_date: string;
  citations: number;
  journal: string;
  doi: string;
}
