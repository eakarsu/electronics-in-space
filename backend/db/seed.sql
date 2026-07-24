INSERT INTO users (email, password_hash, name, role) VALUES
('admin@demo.com', '$2b$10$e4dPQpe3XIDluCZCv3b3iu/H/3f816tgim6l5ly5k7pChHG235Dey', 'Admin User', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO manufacturers (name, country, specialization, certifications, founded_year, chip_count, website) VALUES
('BAE Systems Electronic Systems', 'USA', 'Radiation-hardened processors and ASICs for space applications', 'MIL-STD-883, DO-254 DAL-A, DSCC QML-V', 1987, 12, 'https://www.baesystems.com'),
('Aeroflex/Cobham', 'USA', 'Mixed-signal ICs, FPGAs, memories for space', 'QML-Q, QML-V, MIL-PRF-38535', 1994, 8, 'https://www.cobham.com'),
('Atmel/Microchip', 'USA', 'Rad-hard microcontrollers and flash memory', 'QML-Q, ESA QPL, MIL-STD-883', 1984, 15, 'https://www.microchip.com'),
('Xilinx/AMD', 'USA', 'FPGAs including space-grade Virtex series', 'QML-Q, QML-V, DSCC Class V', 1984, 6, 'https://www.xilinx.com'),
('STMicroelectronics', 'Switzerland/France', 'Power management, SRAMs, logic for space', 'ESA QPL, ECSS-Q-60', 1987, 10, 'https://www.st.com'),
('Vorago Technologies', 'USA', 'ARM Cortex-based space processors', 'MIL-STD-883, QML-Q', 2012, 4, 'https://www.voragotech.com'),
('GreenArrays (for heritage Inmos)', 'USA', 'Parallel computing architectures', 'Custom space qualification', 2008, 2, 'https://www.greenarraychips.com'),
('Gaisler Research/Cobham Gaisler', 'Sweden', 'LEON processor cores and SoCs', 'ESA QPL, QML-Q', 1999, 7, 'https://www.gaisler.com'),
('Radiation Assured Devices', 'USA', 'Re-radiation-screened COTS devices', 'MIL-STD-750, ELDRS testing', 2005, 25, 'https://www.radassured.com'),
('Texas Instruments Space', 'USA', 'Analog, mixed-signal, power for space', 'QML-Q, QML-V, MIL-STD-883', 1951, 20, 'https://www.ti.com/space'),
('IBM/Honeywell Space', 'USA', 'Radiation-hardened bulk CMOS processors', 'MIL-STD-883, QML-V', 1968, 5, 'https://www.honeywell.com'),
('SpaceX Custom Silicon', 'USA', 'Custom automotive-grade COTS for StarShip', 'Custom automotive + radiation screening', 2015, 3, 'https://www.spacex.com'),
('Frontgrade Technologies', 'USA', 'Complete rad-hard product portfolio', 'QML-Q, QML-V, ESA QPL', 2022, 18, 'https://www.frontgrade.com'),
('SiTime Corp', 'USA', 'MEMS timing solutions for space', 'AEC-Q100, custom space qualification', 2004, 6, 'https://www.sitime.com'),
('Renesas Space', 'Japan', 'Mixed-signal ICs and microcontrollers for space', 'ESA QPL, JERG qualification', 1988, 9, 'https://www.renesas.com')
ON CONFLICT DO NOTHING;

INSERT INTO chips (name, manufacturer, process_node_nm, tdp_watts, mass_grams, rad_hardening_level, operating_temp_min, operating_temp_max, ops_per_second, status, first_launch) VALUES
('RAD750', 'BAE Systems', 150, 5.5, 18.5, 9, -55, 125, 400000000, 'flight-proven', '2000-01-01'),
('Leon3-FT', 'Cobham Gaisler', 90, 1.2, 3.2, 7, -55, 125, 200000000, 'flight-proven', '2008-01-01'),
('GR740', 'Cobham Gaisler', 65, 2.8, 4.1, 8, -55, 125, 1200000000, 'flight-proven', '2019-01-01'),
('RAD5500', 'BAE Systems', 45, 14.0, 28.0, 10, -55, 125, 1500000000, 'flight-proven', '2020-01-01'),
('SpaceCube Mini', 'NASA GSFC', 28, 4.5, 12.0, 8, -40, 85, 2000000000, 'flight-proven', '2021-01-01'),
('UT699 LEON3-FT', 'Aeroflex/Cobham', 180, 1.5, 6.8, 7, -55, 125, 100000000, 'flight-proven', '2012-01-01'),
('XQR Virtex-5QV', 'Xilinx', 65, 8.5, 15.0, 8, -55, 125, 5000000000, 'flight-proven', '2015-01-01'),
('VORAGO VA10820', 'Vorago Technologies', 130, 0.08, 0.5, 7, -55, 125, 60000000, 'in-production', '2022-01-01'),
('AT697F LEON2-FT', 'Atmel/Microchip', 180, 2.5, 8.9, 7, -55, 125, 100000000, 'legacy', '2005-01-01'),
('SAMRH71', 'Microchip/Atmel', 65, 0.5, 1.2, 8, -55, 125, 300000000, 'in-production', '2023-01-01'),
('RAD-Hard ARM Cortex-R5', 'ARM/Custom', 40, 0.8, 2.1, 6, -40, 125, 1000000000, 'in-production', '2023-01-01'),
('NEXT-Gen LEAP Processor', 'NASA/JPL', 14, 8.0, 10.0, 9, -55, 125, 10000000000, 'development', NULL),
('UT8R512K32', 'Aeroflex SRAM', 250, 0.3, 2.0, 9, -55, 125, 100000000, 'flight-proven', '2003-01-01'),
('SCS750', 'Space Micro', 90, 12.0, 45.0, 8, -55, 125, 3000000000, 'flight-proven', '2016-01-01'),
('SpaceX FSD-Space', 'SpaceX Custom', 7, 36.0, 120.0, 4, -20, 85, 144000000000, 'experimental', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO missions (name, mission_type, orbit_km, radiation_level, duration_days, launch_date, status, agency, budget_millions, success_probability) VALUES
('Starlink Gen2 Batch 7', 'LEO', 550, 'low', 1825, '2024-03-15', 'active', 'SpaceX', 12.5, 0.97),
('Artemis III Lunar Surface', 'lunar', 0, 'high', 14, '2026-09-01', 'planning', 'NASA', 4200.0, 0.85),
('Europa Clipper', 'deep_space', 0, 'extreme', 4015, '2024-10-14', 'launched', 'NASA/JPL', 5200.0, 0.91),
('Lunar Gateway PPE', 'lunar', 70000, 'high', 3650, '2025-11-01', 'approved', 'NASA/ESA', 890.0, 0.88),
('Mars Sample Return Orbiter', 'mars', 400, 'high', 3650, '2028-07-01', 'planning', 'NASA/ESA', 10000.0, 0.78),
('OneWeb Batch 19', 'LEO', 1200, 'medium', 2555, '2024-06-20', 'active', 'OneWeb/Arianespace', 45.0, 0.96),
('BepiColombo Mercury Orbit', 'deep_space', 480, 'extreme', 2920, '2018-10-20', 'active', 'ESA/JAXA', 1650.0, 0.92),
('Psyche Asteroid', 'asteroid', 0, 'medium', 2190, '2023-10-13', 'launched', 'NASA', 985.0, 0.89),
('Chandrayaan-4 Lunar Sample', 'lunar', 100, 'high', 365, '2027-03-01', 'planning', 'ISRO', 230.0, 0.83),
('Starship Polar Orbit Demo', 'LEO', 400, 'low', 7, '2025-06-01', 'planning', 'SpaceX', 50.0, 0.72),
('James Webb ST L2', 'deep_space', 1500000, 'low', 3650, '2021-12-25', 'active', 'NASA/ESA/CSA', 9700.0, 0.97),
('Sentinel-6B Oceanography', 'LEO', 1336, 'medium', 2555, '2025-11-01', 'approved', 'ESA/NASA', 340.0, 0.94),
('LunaH-Map Polar Water Ice', 'lunar', 20, 'high', 60, '2024-01-01', 'active', 'NASA/ASU', 32.5, 0.79),
('JUICE Jupiter Icy Moons', 'deep_space', 200, 'extreme', 3285, '2023-04-14', 'launched', 'ESA', 1600.0, 0.90),
('Starlink Direct-to-Cell V2', 'LEO', 550, 'low', 2555, '2024-08-01', 'active', 'SpaceX', 8.0, 0.98)
ON CONFLICT DO NOTHING;

INSERT INTO chip_deployments (chip_id, mission_id, performance_score, sei_rate, thermal_ok, power_consumed_w, status, deployed_at, notes) VALUES
(1, 3, 0.94, 0.0023, true, 5.1, 'nominal', '2024-10-14', 'RAD750 performing nominally in Jupiter radiation environment'),
(3, 1, 0.98, 0.0008, true, 2.6, 'nominal', '2024-03-15', 'GR740 in Starlink Gen2 flight computer, excellent performance'),
(7, 11, 0.99, 0.0001, true, 7.8, 'nominal', '2021-12-25', 'Virtex-5QV in JWST NIRCam processor - perfect performance'),
(5, 8, 0.96, 0.0015, true, 4.2, 'nominal', '2023-10-13', 'SpaceCube Mini in Psyche science payload processing'),
(2, 7, 0.91, 0.0045, true, 1.1, 'nominal', '2018-10-20', 'Leon3-FT managing MPO instrument control'),
(1, 14, 0.89, 0.0089, true, 5.4, 'degraded', '2023-04-14', 'Slight performance degradation from Jupiter radiation belt pass'),
(9, 6, 0.97, 0.0003, true, 2.3, 'nominal', '2024-06-20', 'AT697F proven heritage processor in OneWeb ADCS'),
(4, 2, 0.95, 0.0012, true, 13.5, 'nominal', '2026-09-01', 'RAD5500 planned for Artemis III habitat computer'),
(10, 12, 0.98, 0.0004, true, 0.48, 'nominal', '2025-11-01', 'SAMRH71 in Sentinel-6B microcontroller cluster'),
(3, 13, 0.87, 0.0067, false, 2.9, 'degraded', '2024-01-01', 'Thermal anomaly detected at lunar polar temperatures'),
(6, 9, 0.93, 0.0018, true, 1.4, 'nominal', '2027-03-01', 'UT699 in Chandrayaan-4 avionics'),
(7, 4, 0.96, 0.0025, true, 8.1, 'nominal', '2025-11-01', 'Virtex-5QV in Gateway PPE GNC processor'),
(1, 5, 0.88, 0.0034, true, 5.3, 'nominal', '2028-07-01', 'RAD750 selected for Mars Sample Return backup processor'),
(14, 11, 0.97, 0.0002, true, 11.2, 'nominal', '2021-12-25', 'SCS750 in JWST Fine Guidance Sensor processor'),
(5, 3, 0.91, 0.0028, true, 4.4, 'nominal', '2024-10-14', 'SpaceCube Mini handling Europa Clipper science data')
ON CONFLICT DO NOTHING;

INSERT INTO tests (chip_id, test_type, environment, result, temperature_c, radiation_dose_krad, test_date, lab, pass, failure_mode) VALUES
(1, 'radiation', 'proton_beam', 'pass', 25, 100, '2023-06-15', 'Texas A&M Cyclotron', true, NULL),
(1, 'thermal_vacuum', 'thermal_chamber', 'pass', -55, 0, '2023-07-01', 'JPL Environmental Test Lab', true, NULL),
(2, 'radiation', 'heavy_ion', 'pass', 25, 150, '2022-09-10', 'TAMU Cyclotron', true, NULL),
(3, 'radiation', 'proton_beam', 'pass', 25, 200, '2023-02-20', 'PSI Proton Irradiation Facility', true, NULL),
(4, 'reliability', 'burn_in_chamber', 'pass', 125, 0, '2023-11-05', 'BAE Systems Test Facility', true, NULL),
(5, 'emi', 'anechoic_chamber', 'pass', 25, 0, '2023-08-14', 'NASA GSFC EMC Lab', true, NULL),
(7, 'radiation', 'heavy_ion', 'pass', 25, 500, '2022-05-30', 'TAMU Cyclotron', true, NULL),
(8, 'vibration', 'vibration_table', 'pass', 25, 0, '2023-04-18', 'Vorago Test Lab', true, NULL),
(9, 'thermal_vacuum', 'thermal_chamber', 'fail', -65, 0, '2018-03-22', 'ESA ESTEC', false, 'Latch-up at -65C below qualification temperature'),
(10, 'radiation', 'proton_beam', 'pass', 25, 100, '2023-12-01', 'TRIUMF Canada', true, NULL),
(3, 'burn_in', 'burn_in_chamber', 'pass', 150, 0, '2022-11-15', 'Cobham Gaisler Test Lab', true, NULL),
(4, 'radiation', 'heavy_ion', 'pass', 25, 300, '2023-09-25', 'GANIL Heavy Ion Facility', true, NULL),
(15, 'radiation', 'heavy_ion', 'fail', 25, 50, '2024-01-10', 'CERN Irradiation Facility', false, 'Single-event latch-up at LET 10 MeV-cm2/mg'),
(6, 'thermal_vacuum', 'thermal_chamber', 'pass', -55, 0, '2020-03-08', 'Aeroflex Test Facility', true, NULL),
(2, 'vibration', 'vibration_table', 'pass', 25, 0, '2022-07-19', 'CNES Mechanical Test Lab', true, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO research_papers (title, authors, focus_area, findings, published_date, citations, journal, doi) VALUES
('Single Event Effects in Modern CMOS Devices for Space Applications', 'Chen, X.; Rodriguez, M.; Kim, J.', 'radiation_effects', 'Demonstrates that 28nm CMOS processes show increased SEU sensitivity compared to 130nm, requiring enhanced error correction strategies for deep space missions.', '2023-08-15', 234, 'IEEE Transactions on Nuclear Science', '10.1109/TNS.2023.12345'),
('Total Ionizing Dose Effects on RISC-V Processors for CubeSat Applications', 'Patel, A.; Williams, S.; Thompson, R.', 'TID_effects', 'RISC-V processors with radiation hardening by design techniques can achieve 100krad TID tolerance while maintaining 90% of commercial performance metrics.', '2023-11-20', 89, 'Journal of Spacecraft and Rockets', '10.2514/1.A37892'),
('Thermal Management Challenges for High-Performance Space Computing', 'Liu, Y.; Anderson, K.', 'thermal_management', 'New vapor chamber cooling techniques enable 50W TDP processors to operate in LEO environment without radiators, reducing mass by 35%.', '2024-01-10', 45, 'Acta Astronautica', '10.1016/j.actaastro.2024.01.001'),
('FPGA Reliability in High-Radiation Deep Space Environments', 'Martinez, C.; Park, S.; Nguyen, T.', 'FPGA_reliability', 'Triple modular redundancy combined with configuration scrubbing achieves 99.7% availability for Virtex-5QV FPGAs in Jupiter flyby missions.', '2022-06-30', 312, 'IEEE Aerospace Conference Proceedings', '10.1109/AERO.2022.9843001'),
('Next-Generation Rad-Hard Inference Chips for On-Orbit AI Processing', 'Johnson, E.; Lee, M.; Brown, P.', 'space_AI_chips', 'Custom radiation-hardened neural network accelerators can achieve 1 TOPS/W in LEO while tolerating 100 krad cumulative dose with less than 2% accuracy degradation.', '2024-03-05', 167, 'Nature Electronics', '10.1038/s41928-024-01234'),
('Power-Efficient Computing for Deep Space: Lessons from Europa Clipper', 'Thompson, K.; Davis, R.', 'power_optimization', 'Europa Clipper computing architecture achieves 80% power reduction vs. previous generation through aggressive duty cycling and radiation-hardened sleep modes.', '2024-07-20', 78, 'IEEE Aerospace and Electronic Systems', '10.1109/TAES.2024.56789'),
('Displacement Damage Effects on Silicon Carbide Power Devices for Space', 'Kumar, V.; Zhang, W.', 'power_electronics', 'SiC MOSFETs demonstrate superior displacement damage tolerance vs. silicon in 1 MeV neutron environments, with only 5% Rdson increase at 1e13 n/cm2.', '2023-04-12', 156, 'IEEE Transactions on Electron Devices', '10.1109/TED.2023.98765'),
('COTS vs. Rad-Hard: A Cost-Benefit Analysis for Commercial Space', 'White, B.; Harris, G.', 'rad_hard_strategy', 'COTS with selective radiation screening and redundancy can reduce per-satellite electronics cost by 60% while maintaining 95% mission success rate for LEO missions.', '2023-09-28', 223, 'Space Policy Journal', '10.1016/j.spacepol.2023.101567'),
('Machine Learning for Predictive Failure Analysis in Space Electronics', 'Yamamoto, T.; Okonkwo, C.', 'predictive_analytics', 'LSTM-based models trained on SEU event logs predict radiation-induced failures 48 hours in advance with 87% accuracy, enabling proactive mitigation.', '2024-02-14', 134, 'Nature Machine Intelligence', '10.1038/s42256-024-00891'),
('Radiation Hardening by Design Techniques for 5nm CMOS', 'Rodriguez, A.; Chen, L.; Kim, H.', 'RHBD_techniques', 'Novel gate-all-around transistor geometries provide inherent single-event hardness at 5nm node, potentially eliminating need for triple redundancy in sub-LEO orbits.', '2024-05-18', 67, 'IEEE International Reliability Physics Symposium', '10.1109/IRPS.2024.11234'),
('Qualification Approaches for Commercial Electronics in Space', 'Brown, M.; Taylor, J.', 'qualification_methods', 'Statistical lot acceptance testing combined with 2500-hour burn-in reduces infant mortality failures in COTS devices by 94% for LEO CubeSat applications.', '2023-12-15', 189, 'IEEE Transactions on Components Packaging', '10.1109/TCPMT.2023.54321'),
('High-Energy Particle Simulation for Space Electronics Reliability', 'Perez, D.; Wang, X.; Nakamura, S.', 'simulation_methods', 'Monte Carlo particle transport simulations using GEANT4 accurately predict SEU cross-sections within 15% of measured values for modern radiation-hardened processors.', '2023-07-08', 298, 'Nuclear Instruments and Methods', '10.1016/j.nima.2023.168123'),
('Autonomous Fault Recovery in Space Computing Systems', 'Smith, C.; Johnson, R.; Lee, K.', 'fault_tolerance', 'AI-driven fault recovery systems demonstrate 40% improvement in MTTR compared to pre-programmed recovery sequences for complex multi-processor space architectures.', '2024-04-22', 112, 'IEEE Transactions on Reliability', '10.1109/TR.2024.23456'),
('Radiation Effects on 3D-Stacked Memory for Space Applications', 'Wilson, P.; Kim, J.; Garcia, M.', 'memory_radiation', '3D-stacked DRAM with TSV interconnects shows 3x higher SEU sensitivity per bit than planar LPDDR4, requiring comprehensive EDAC for space deployment.', '2023-10-30', 201, 'IEEE Solid-State Circuits Letters', '10.1109/LSSC.2023.76543'),
('Gallium Nitride Power Electronics for Space Power Systems', 'Anderson, L.; Murphy, T.', 'GaN_space', 'GaN-on-SiC power converters achieve 97% efficiency at 100W in vacuum environment with demonstrated 100krad TID tolerance, enabling mass reduction of 45% vs. silicon alternatives.', '2024-06-12', 156, 'IEEE Power Electronics Letters', '10.1109/LPEL.2024.34567')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- Seed: Radiation Test Campaigns (linked to chips by index)
-- Real facilities: Brookhaven NSRL, TAMU Cyclotron Institute K500,
-- LBNL 88-Inch Cyclotron, RADEF Jyvaskyla, UC Davis CNL
-- =====================================================================
INSERT INTO rad_test_campaigns (chip_id, campaign_name, test_standard, facility, beam_type, campaign_status, total_tid_target_krad, dose_rate_rad_per_sec, start_date, end_date, pi_engineer, notes) VALUES
(1, 'RAD750 100krad TID Re-qualification', 'MIL-STD-883 TM1019.9', 'Defense Microelectronics Activity (DMEA)', 'gamma-Co60', 'complete', 100, 50, '2024-02-12', '2024-02-15', 'M. Davis (BAE)', 'Annual lot acceptance, ELDRS step-stress, parts from wafer lot W2304-A'),
(1, 'RAD750 Heavy-Ion SEE at TAMU K500', 'JESD57', 'Texas A&M Cyclotron Institute K500', 'heavy-ion', 'complete', 0, 0, '2024-04-22', '2024-04-26', 'J. Chen (NASA GSFC)', 'Au, Ag, Kr, Ar, N beams; LET 1-86 MeV-cm2/mg; chip in operate-mode running RTEMS test load'),
(2, 'LEON3-FT Proton SEE at TRIUMF', 'JESD57', 'TRIUMF PIF', 'proton-105MeV', 'complete', 0, 0, '2023-09-08', '2023-09-10', 'A. Lindgren (Gaisler)', '105 MeV proton, integral SEU cross-section 1e-14 cm2/bit'),
(3, 'GR740 SEL Latchup Screen', 'ESCC 25100', 'RADEF Jyvaskyla', 'heavy-ion-Xe', 'complete', 0, 0, '2024-01-15', '2024-01-19', 'S. Habinc (Cobham)', 'No SEL observed up to LET=60 MeV-cm2/mg at 125C, Vdd+10%'),
(4, 'RAD5500 TID 1Mrad Step-Stress', 'MIL-STD-883 TM1019.9', 'BAE Manassas Radiation Test Facility', 'gamma-Co60', 'in-progress', 1000, 100, '2025-03-01', NULL, 'M. Davis (BAE)', 'Step doses: 10/30/100/300/500/1000 krad; functional after each step'),
(5, 'SpaceCube Mini RadFx Characterization', 'NASA EEE-INST-002', 'Brookhaven NASA Space Radiation Lab', 'heavy-ion-Fe', 'complete', 30, 0, '2023-11-13', '2023-11-17', 'M. Sampson (NASA GSFC)', 'Fe-56 ion at 1 GeV/n; SEU/SEFI characterization for SpaceCube v3'),
(7, 'XQR Virtex-5QV Configuration SEU Test', 'JESD57 + Xilinx XCN09013', 'LBNL 88-Inch Cyclotron', 'heavy-ion', 'complete', 0, 0, '2024-07-08', '2024-07-12', 'G. Allen (Xilinx)', 'Configuration memory upset rate per LET; bitstream scrubbing rate determination'),
(8, 'VORAGO VA10820 HARDSIL Validation', 'MIL-PRF-38535 QML-Q', 'Vorago in-house + UC Davis', 'gamma-Co60', 'complete', 300, 100, '2023-06-20', '2023-06-30', 'B. Pierce (Vorago)', 'HARDSIL CMOS process validated to 300krad with no parametric shift'),
(10, 'SAMRH71 ARM Cortex-M7 SEE Campaign', 'ESCC 25100', 'UCL Cyclotron Belgium', 'heavy-ion', 'complete', 0, 0, '2024-05-13', '2024-05-17', 'C. Boatella-Polo (ESA)', 'LET threshold for SEU 4.2, sat XS 2.1e-9 cm2/bit'),
(13, 'UT8R512K32 SRAM Long-Mission Dose', 'MIL-STD-883 TM1019.9', 'Aeroflex (Cobham) Radiation Lab', 'gamma-Co60', 'complete', 200, 30, '2022-08-15', '2022-08-22', 'R. Garbos (Aeroflex)', 'Used for JWST flight lot acceptance, SRAM functional to 200krad'),
(11, 'Cortex-R5 Rad-Hard 300krad Pre-Production', 'MIL-STD-883 TM1019', 'Bechtel Plasma Sci. Center', 'gamma-Co60', 'in-progress', 300, 100, '2025-04-01', NULL, 'TBD', 'Pre-production rad-hard ARM Cortex-R5 lot screening'),
(15, 'SpaceX FSD-Space COTS Heavy-Ion Survey', 'NASA-HDBK-4002A', 'TAMU K500', 'heavy-ion', 'complete', 0, 0, '2024-08-05', '2024-08-09', 'P. Knapp (SpaceX)', 'COTS automotive die in heavy-ion survey, SEL observed at LET=18, mitigated by current-limit shutdown')
ON CONFLICT DO NOTHING;

INSERT INTO rad_test_runs (campaign_id, run_label, effect_type, let_mev_cm2_mg, fluence_particles_cm2, cumulative_tid_krad, errors_observed, cross_section_cm2, saturation_xs_cm2, threshold_let, current_uA, vdd_voltage, pass, observations) VALUES
(1, 'TID step 10krad', 'TID', NULL, NULL, 10, 0, NULL, NULL, NULL, 1850, 3.3, true, 'Idd within spec, all functional patterns pass'),
(1, 'TID step 50krad', 'TID', NULL, NULL, 50, 0, NULL, NULL, NULL, 1920, 3.3, true, 'Idd +3.8% drift, within 10% spec limit'),
(1, 'TID step 100krad', 'TID', NULL, NULL, 100, 0, NULL, NULL, NULL, 2010, 3.3, true, 'Idd +8.6% drift, ELDRS effects bounded'),
(2, 'Ar LET=8.6', 'SEU', 8.6, 1.0e7, 0, 12, 1.2e-6, NULL, NULL, NULL, 3.3, true, 'Cache SEU rate measured, below 1e-5 errors/bit-day at GEO'),
(2, 'Kr LET=29', 'SEU', 29.0, 1.0e7, 0, 245, 2.45e-5, NULL, NULL, NULL, 3.3, true, 'Floating-point register SEU cluster observed'),
(2, 'Au LET=86', 'SEL', 86.0, 5.0e6, 0, 0, 0, NULL, NULL, NULL, 3.3, true, 'No latchup observed at saturating LET; SOI process confirmed SEL-immune'),
(2, 'Xe LET=58', 'SEFI', 58.0, 1.0e6, 0, 3, 3.0e-6, 1e-5, 8.2, NULL, 3.3, true, 'SEFI requiring power-cycle, 3 events / 1e6 ions'),
(3, 'p-105 MeV integral', 'SEU', 0.5, 1.0e11, 0, 412, 4.12e-9, 1e-8, NULL, NULL, 3.3, true, 'Proton SEU XS measured for LEO use'),
(4, 'SEL Xe-LET-60', 'SEL', 60.0, 5.0e6, 0, 0, 0, NULL, NULL, NULL, 1.2, true, 'SEL-immune at 125C, +10% Vdd, LET 60'),
(5, 'TID step 30krad', 'TID', NULL, NULL, 30, 0, NULL, NULL, NULL, 3450, 1.2, true, 'GR740 dual-core LEON4 functional after 30krad'),
(6, 'Fe-56 LET=30', 'SEU', 30.0, 5.0e6, 0, 87, 1.74e-5, NULL, NULL, NULL, 1.2, true, 'SpaceCube Mini SEU within mission allocation'),
(7, 'Au LET=86 config', 'SEU', 86.0, 1.0e7, 0, 1240, 1.24e-4, 5e-4, 1.5, NULL, 1.0, true, 'Configuration memory upset rate baseline for scrubbing design'),
(8, 'TID step 100krad', 'TID', NULL, NULL, 100, 0, NULL, NULL, NULL, 78, 3.3, true, 'HARDSIL no shift through 100krad'),
(8, 'TID step 300krad', 'TID', NULL, NULL, 300, 0, NULL, NULL, NULL, 82, 3.3, true, 'HARDSIL no shift through 300krad - mission complete'),
(9, 'Kr LET=29', 'SEU', 29.0, 1.0e7, 0, 18, 1.8e-6, NULL, 4.2, NULL, 3.3, true, 'SAMRH71 SEU LET threshold ~4.2 MeV-cm2/mg'),
(10, 'TID step 100krad', 'TID', NULL, NULL, 100, 0, NULL, NULL, NULL, 240, 3.3, true, 'UT8R512K32 SRAM all bits functional after 100krad'),
(10, 'TID step 200krad', 'TID', NULL, NULL, 200, 1, NULL, NULL, NULL, 255, 3.3, true, '1 stuck bit at 200krad on part SN-37'),
(12, 'Ar LET=8.6 SEL', 'SEL', 8.6, 1.0e7, 0, 0, 0, NULL, NULL, NULL, 1.8, true, 'COTS FSD-Space no SEL at LET 8.6'),
(12, 'Kr LET=18 SEL', 'SEL', 18.0, 5.0e6, 0, 4, 8.0e-7, NULL, NULL, NULL, 1.8, false, 'SEL observed at LET=18; mitigation via active current-limit circuit'),
(12, 'Au LET=58 SEFI', 'SEFI', 58.0, 1.0e6, 0, 28, 2.8e-5, 5e-5, 12.0, NULL, 1.8, false, 'COTS SEFI rate too high without external watchdog')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- Seed: Orbit Environment Profiles
-- =====================================================================
INSERT INTO orbit_profiles (profile_name, orbit_class, altitude_km, inclination_deg, eccentricity, trapped_proton_model, trapped_electron_model, gcr_model, solar_activity, annual_tid_krad, shield_thickness_mm_al, peak_let_mev_cm2_mg, notes) VALUES
('ISS 400km / 51.6deg', 'LEO', 400, 51.6, 0.0003, 'AP9 v1.50.001', 'AE9 v1.50.001', 'CREME96', 'solar-max', 0.6, 2.54, 28, 'Standard human spaceflight LEO, modest SAA dose'),
('Starlink 550km / 53deg', 'LEO', 550, 53.0, 0.0001, 'AP9 v1.50.001', 'AE9 v1.50.001', 'CREME96', 'solar-max', 1.2, 2.54, 28, 'Starlink Gen2 shell - drives upscreen requirements'),
('OneWeb 1200km / 87.9deg', 'LEO', 1200, 87.9, 0.0002, 'AP9 v1.50.001', 'AE9 v1.50.001', 'CREME96', 'solar-max', 6.8, 2.54, 28, 'Higher inner-belt proton flux at this altitude'),
('Sentinel SSO 800km / 98.7deg', 'LEO-SSO', 800, 98.7, 0.0001, 'AP9 v1.50.001', 'AE9 v1.50.001', 'CREME96', 'solar-max', 3.4, 2.54, 28, 'Sun-synchronous polar orbit for Earth observation'),
('GPS MEO 20200km / 55deg', 'MEO', 20200, 55.0, 0.02, 'AP9 v1.50.001', 'AE9 v1.50.001', 'CREME96', 'solar-max', 17.5, 5.0, 28, 'Heart of outer electron belt - very high electron flux'),
('GEO geostationary', 'GEO', 35786, 0.0, 0.0, 'AP9 v1.50.001', 'AE9 v1.50.001', 'CREME96', 'solar-max', 12.4, 5.0, 28, 'Outside trapped protons but high electron+GCR'),
('Molniya HEO 1000x39000', 'HEO', 39000, 63.4, 0.74, 'AP9 v1.50.001', 'AE9 v1.50.001', 'CREME96', 'solar-max', 38.0, 5.0, 28, 'Crosses both belts - very high dose, used by SBIRS'),
('Lunar Gateway NRHO', 'lunar', 70000, 0.0, 0.85, 'none', 'none', 'CREME96', 'solar-max', 0.45, 2.54, 28, 'Outside Earth belts, dominated by GCR + SEP events'),
('Lunar surface', 'lunar-surface', 0, 0.0, 0.0, 'none', 'none', 'CREME96', 'solar-max', 0.35, 2.54, 28, 'Half-sky shielded by Moon; surface dose 30-50% of free-space'),
('Europa Clipper Jupiter', 'deep-space', 0, 0.0, 0.0, 'GIRE-2 Jovian', 'GIRE-2 Jovian', 'CREME96', 'solar-max', 280.0, 7.5, 60, 'Jovian electron environment - 300 krad mission TID requirement'),
('Mars transit + surface', 'interplanetary', 0, 0.0, 0.0, 'none', 'none', 'CREME96 + Badhwar-ONeill', 'solar-min', 18.0, 5.0, 28, 'GCR-dominated, SEP storm events drive worst-case'),
('JWST Sun-Earth L2', 'L2', 1500000, 0.0, 0.0, 'none', 'none', 'CREME96', 'solar-max', 2.5, 5.0, 28, 'Outside Earth magnetosphere most of orbit, GCR + occasional SEP')
ON CONFLICT DO NOTHING;

INSERT INTO orbit_dose_curves (profile_id, shield_thickness_mm, cumulative_dose_year_krad, proton_flux_per_cm2_s, electron_flux_per_cm2_s, notes) VALUES
(1, 1.0, 2.4, 320, 4.8e3, 'ISS thin-shield TID-year'),
(1, 2.54, 0.6, 110, 1.8e3, 'ISS nominal shield 100 mils Al'),
(1, 5.0, 0.18, 28, 380, 'ISS heavy shield reduces e- significantly'),
(2, 2.54, 1.2, 240, 5.2e3, 'Starlink nominal'),
(3, 2.54, 6.8, 980, 1.4e4, 'OneWeb inner-belt proton dominated'),
(5, 2.54, 36.0, 480, 1.8e5, 'GPS MEO without extra shield - unacceptable for COTS'),
(5, 5.0, 17.5, 240, 8.6e4, 'GPS MEO nominal shield'),
(5, 10.0, 6.8, 110, 2.8e4, 'GPS MEO heavy shield'),
(6, 5.0, 12.4, 95, 6.2e4, 'GEO nominal 200 mil shield'),
(7, 5.0, 38.0, 380, 8.4e4, 'Molniya per-orbit highest among Earth orbits'),
(10, 7.5, 280.0, 1.2e4, 2.8e6, 'Europa Clipper - Jupiter radiation belt nightmare'),
(10, 15.0, 95.0, 4.2e3, 9.8e5, 'Europa Clipper with thick vault shield')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- Seed: COTS Upscreening Lots (NewSpace-style screening flow)
-- =====================================================================
INSERT INTO upscreen_lots (chip_id, lot_code, date_code, parts_received, parts_accepted, parts_rejected, upscreen_class, customer, start_date, complete_date, status, notes) VALUES
(15, 'FSD-LOT-2407A', '2407', 500, 472, 28, 'SpaceX rad-screen Class B', 'SpaceX Starlink', '2024-07-15', '2024-08-10', 'complete', 'Custom FSD-Space lot for V2 Starlink, 5.6% reject rate'),
(15, 'FSD-LOT-2408B', '2408', 500, 481, 19, 'SpaceX rad-screen Class B', 'SpaceX Starlink', '2024-08-12', '2024-09-05', 'complete', 'Yield improved batch-over-batch'),
(11, 'CR5-LOT-2503', '2503', 250, 238, 12, 'AEC-Q100 + 100krad rad-screen', 'Planet Labs', '2025-03-10', NULL, 'in-progress', 'Cortex-R5 for SkySat-29 build, burn-in step ongoing'),
(8, 'VA10820-LOT-2412', '2412', 100, 96, 4, 'MIL-883 Class B equiv', 'York Space', '2024-12-02', '2025-01-15', 'complete', 'Vorago HARDSIL MCU for cubesat C&DH, low reject due to inherent RH'),
(10, 'SAMRH71-LOT-2406', '2406', 80, 78, 2, 'ESCC + 100krad', 'ESA OPS-SAT', '2024-06-10', '2024-07-20', 'complete', 'SAMRH71 already QML-Q, screening adds lot acceptance'),
(13, 'UT8R-LOT-2310', '2310', 60, 58, 2, 'MIL-883 Class S', 'NASA JWST Spare', '2023-10-05', '2023-11-30', 'complete', 'SRAM flight spares for JWST OBC')
ON CONFLICT DO NOTHING;

INSERT INTO upscreen_steps (lot_id, step_order, step_name, standard_ref, duration_hours, temperature_c, voltage_stress_v, parts_in, parts_pass, parts_fail, yield_pct, observations) VALUES
(1, 1, 'incoming-visual', 'MIL-STD-883 TM2009', 0.5, 25, NULL, 500, 498, 2, 99.6, 'Mark legibility rejects'),
(1, 2, 'X-ray', 'MIL-STD-883 TM2012', 1.0, 25, NULL, 498, 495, 3, 99.4, 'Wire-bond void rejects'),
(1, 3, 'PIND', 'MIL-STD-883 TM2020', 2.0, 25, NULL, 495, 491, 4, 99.2, 'Particle Impact Noise Detection - loose debris'),
(1, 4, 'fine-leak', 'MIL-STD-883 TM1014', 1.0, 25, NULL, 491, 489, 2, 99.6, 'Helium fine-leak hermeticity'),
(1, 5, 'electrical-25C', 'datasheet ATE', 0.25, 25, 1.8, 489, 485, 4, 99.2, 'Initial electrical screen'),
(1, 6, 'burn-in-240hr', 'MIL-STD-883 TM1015', 240.0, 125, 2.0, 485, 478, 7, 98.6, 'Dynamic burn-in @ 125C, +10% Vdd'),
(1, 7, 'post-burn-in-electrical', 'datasheet ATE', 0.25, 25, 1.8, 478, 475, 3, 99.4, 'Delta-electrical screen, drift outliers'),
(1, 8, 'rad-screen-30krad', 'MIL-STD-883 TM1019', 8.0, 25, 1.8, 475, 472, 3, 99.4, 'Sample TID 30krad rad-screen, lot acceptance'),
(2, 1, 'incoming-visual', 'MIL-STD-883 TM2009', 0.5, 25, NULL, 500, 499, 1, 99.8, 'Improved cosmetic yield'),
(2, 2, 'X-ray', 'MIL-STD-883 TM2012', 1.0, 25, NULL, 499, 497, 2, 99.6, 'X-ray pass'),
(2, 3, 'PIND', 'MIL-STD-883 TM2020', 2.0, 25, NULL, 497, 495, 2, 99.6, 'PIND pass'),
(2, 4, 'fine-leak', 'MIL-STD-883 TM1014', 1.0, 25, NULL, 495, 494, 1, 99.8, 'Hermeticity'),
(2, 5, 'burn-in-240hr', 'MIL-STD-883 TM1015', 240.0, 125, 2.0, 494, 488, 6, 98.8, 'Burn-in'),
(2, 6, 'rad-screen-30krad', 'MIL-STD-883 TM1019', 8.0, 25, 1.8, 488, 481, 7, 98.6, 'Rad screen'),
(3, 1, 'incoming-visual', 'MIL-STD-883 TM2009', 0.5, 25, NULL, 250, 249, 1, 99.6, 'Visual pass'),
(3, 2, 'X-ray', 'MIL-STD-883 TM2012', 1.0, 25, NULL, 249, 248, 1, 99.6, 'X-ray pass'),
(3, 3, 'burn-in-160hr', 'MIL-STD-883 TM1015', 160.0, 125, 1.32, 248, 240, 8, 96.8, 'Cortex-R5 burn-in ongoing - infant-mortality stage')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- Seed: Mission Subsystem Mass/Power Budgets
-- =====================================================================
INSERT INTO subsystem_budgets (mission_id, subsystem, mass_allocated_g, mass_used_g, power_avg_allocated_w, power_avg_used_w, power_peak_w, derate_factor, margin_required_pct, chip_id, notes) VALUES
(2, 'C&DH (Command & Data Handling)', 8500, 7820, 28, 22.5, 38, 0.8, 25.0, 4, 'Artemis III lunar surface - RAD5500 main flight computer'),
(2, 'EPS (Electric Power Subsystem)', 18000, 16400, 0, 0, 0, 0.7, 30.0, NULL, 'Battery+PMIC for surface ops'),
(2, 'ADCS', 4200, 3950, 15, 12, 22, 0.8, 25.0, 2, 'LEON3-FT in star-tracker'),
(2, 'TT&C', 3500, 3200, 18, 14, 28, 0.8, 25.0, NULL, 'X-band transceiver'),
(3, 'C&DH', 12000, 10800, 35, 30, 52, 0.75, 30.0, 1, 'Europa Clipper - RAD750 with Vault shielding'),
(3, 'Payload electronics', 22000, 19500, 80, 65, 120, 0.7, 30.0, 7, 'Virtex-5QV for ICEMAG/REASON instruments'),
(3, 'ADCS', 5500, 4800, 20, 16, 32, 0.75, 30.0, 3, 'GR740 in attitude control'),
(1, 'C&DH (COTS)', 800, 720, 12, 10, 18, 0.85, 20.0, 15, 'Starlink COTS FSD-Space'),
(1, 'Comms baseband', 1200, 1080, 28, 24, 42, 0.85, 20.0, NULL, 'Phased-array baseband'),
(4, 'C&DH', 6500, 5950, 22, 18, 32, 0.8, 25.0, 4, 'Lunar Gateway PPE - RAD5500'),
(4, 'Electric Propulsion DCIU', 2800, 2600, 14, 11, 22, 0.8, 25.0, 2, 'Hall thruster controller LEON3-FT'),
(11, 'C&DH cold-spare', 8200, 7400, 26, 0, 38, 0.75, 30.0, 1, 'JWST OBC cold-spare RAD750'),
(11, 'Instrument SIDECAR ASICs', 4500, 4200, 32, 28, 45, 0.75, 30.0, NULL, 'SIDECAR ROIC array')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- Seed: Rad-Hard Foundries (Tier-2 process registry)
-- =====================================================================
INSERT INTO rad_hard_foundries (fab_name, operator, location, country, process_name, process_node_nm, rh_technique, tid_capability_krad, sel_let_threshold, itar_status, qml_certification, monthly_capacity_wafers, status, customers, notes) VALUES
('BAE Manassas Fab', 'BAE Systems Electronic Systems', 'Manassas, VA', 'USA', 'BAE 150nm RH SOI', 150, 'RHBP-SOI', 1000, 80, 'ITAR', 'DSCC QML-V Class V, MIL-PRF-38535', 200, 'active', 'BAE (RAD750, RAD5500), NASA, DoD', 'Trusted Foundry; RHBP-SOI inherently SEL-immune'),
('GlobalFoundries Trusted', 'GlobalFoundries', 'East Fishkill / Malta NY', 'USA', '32SOI RH / 22FDX RH', 32, 'RHBP-SOI + RHBD', 500, 75, 'ITAR', 'DSCC QML-V/Q, MIL-PRF-38535', 800, 'active', 'IBM Spectrum compute, Mercury Systems, BAE', 'Trusted Foundry - 32SOI; 22FDX RH option for SmallSat'),
('IBM Microelectronics (legacy)', 'GlobalFoundries (acquired)', 'East Fishkill, NY', 'USA', '7HP SiGe BiCMOS RH', 130, 'RHBP-SiGe', 300, 65, 'ITAR', 'DSCC QML-V', 50, 'legacy', 'Honeywell, BAE legacy parts', 'Original IBM RH SiGe; capacity transitioned to GF Trusted'),
('ON Semi Pocatello', 'onsemi (formerly Aeroflex Colorado Springs)', 'Pocatello, ID', 'USA', 'ON 600nm BCD RH analog', 600, 'RHBD-analog', 100, 65, 'ITAR', 'DSCC QML-V Class V', 100, 'active', 'Aeroflex/Cobham, Frontgrade analog ICs', 'Rad-hard analog/mixed-signal foundry'),
('Microchip CT Fab 5', 'Microchip Technology', 'Colorado Springs, CO', 'USA', 'Microchip 0.18um RH', 180, 'RHBD-bulk-CMOS', 300, 70, 'ITAR', 'QML-V/Q, MIL-PRF-38535', 150, 'active', 'Microchip (SAMRH71, ATmegaS128), ESA', 'Acquired from Atmel; supplies SAMRH71 and ATmegaS series'),
('SkyWater Trusted Foundry', 'SkyWater Technology', 'Bloomington, MN', 'USA', 'S130 RH130 + RH90', 90, 'RHBD-CMOS', 300, 60, 'ITAR', 'DSCC QML-V/Q', 250, 'active', 'DoD, NASA, Trusted Strategic Capability customers', 'US-only Trusted Foundry; primary for RH ASIC tape-outs post-IBM'),
('TowerJazz/Tower Semiconductor', 'Tower Semiconductor', 'Newport Beach, CA / Migdal Haemek', 'USA/Israel', 'TS18 RH SOI', 180, 'RHBD-SOI', 100, 70, 'EAR', 'MIL-STD-883 Class B', 300, 'active', 'Vorago (VA10820), MIT Lincoln Lab', 'Vorago HARDSIL process built on Tower SOI'),
('STMicroelectronics Crolles', 'STMicroelectronics', 'Crolles, France', 'France', 'C65SPACE 65nm', 65, 'RHBD-bulk-CMOS', 300, 60, 'EAR/ESA-QPL', 'ESA QPL, ECSS-Q-60', 400, 'active', 'ESA, Airbus DS, Thales Alenia Space', 'European sovereign rad-hard process for ESA missions'),
('Microsemi/Microchip Phoenix', 'Microchip Technology', 'Phoenix, AZ', 'USA', 'RTG4 65nm flash-FPGA RH', 65, 'RHBD-flash-FPGA', 100, 65, 'ITAR', 'DSCC QML-V', 80, 'active', 'NASA, ESA, defense primes', 'RTG4 reprogrammable rad-hard FPGA process'),
('TSMC N7 (COTS for upscreen)', 'TSMC', 'Hsinchu, Taiwan', 'Taiwan', 'TSMC N7 automotive', 7, 'COTS-upscreen', 30, 18, 'EAR', 'AEC-Q100 + customer-spec', 50000, 'active', 'SpaceX (FSD-Space), Planet Labs, Capella', 'NewSpace COTS-upscreen baseline; not natively rad-hard'),
('Cobham Gaisler (fabless)', 'Cobham Gaisler / Frontgrade', 'Goteborg, Sweden', 'Sweden', 'LEON IP on STM C65SPACE + GF 32SOI', 32, 'RHBD-IP-portable', 300, 70, 'EAR', 'ESA QPL', NULL, 'active', 'ESA, OHB, Airbus DS', 'IP vendor - LEON3FT/LEON4/NOEL-V on multiple foundries'),
('Frontgrade Linn (formerly Aeroflex)', 'Frontgrade Technologies', 'Linn, MO', 'USA', '180nm RH ASIC', 180, 'RHBD-CMOS', 300, 65, 'ITAR', 'DSCC QML-V Class V', 60, 'active', 'NASA, DoD, defense primes', 'Mixed-signal rad-hard ASIC for space')
ON CONFLICT DO NOTHING;
