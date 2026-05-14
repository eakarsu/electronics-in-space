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
