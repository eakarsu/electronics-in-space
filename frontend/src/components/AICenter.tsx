import { useState } from 'react';
import { Sparkles, Cpu, TrendingUp, AlertTriangle, Rocket, Radiation, Activity, ShoppingCart, Layers, Target } from 'lucide-react';
import { apiFetch } from '../api';
import AIResponse from './AIResponse';

interface Sample {
  label: string;
  values: Record<string, string>;
}

interface Tool {
  id: string;
  label: string;
  icon: React.ReactNode;
  endpoint: string;
  fields: { key: string; label: string; type: string; placeholder: string }[];
  color: string;
  samples?: Sample[];
}

const tools: Tool[] = [
  {
    id: 'chip-rec', label: 'Chip Recommendation', icon: <Cpu size={18} />, endpoint: '/ai/chip-recommendation', color: 'cyan',
    fields: [
      { key: 'mission_type', label: 'Mission Type', type: 'text', placeholder: 'e.g. deep space, LEO, GEO' },
      { key: 'radiation_level', label: 'Radiation Level', type: 'text', placeholder: 'e.g. high, medium, low' },
      { key: 'power_budget_w', label: 'Power Budget (W)', type: 'number', placeholder: 'e.g. 10' },
    ],
    samples: [
      { label: 'Europa Clipper (deep space)', values: { mission_type: 'deep space / Jovian flyby', radiation_level: 'extreme', power_budget_w: '15' } },
      { label: 'Artemis II (cislunar)', values: { mission_type: 'cislunar crewed', radiation_level: 'high', power_budget_w: '25' } },
      { label: 'GOES-U (GEO weather)', values: { mission_type: 'GEO', radiation_level: 'medium', power_budget_w: '12' } },
    ],
  },
  {
    id: 'perf-pred', label: 'Performance Prediction', icon: <TrendingUp size={18} />, endpoint: '/ai/performance-prediction', color: 'blue',
    fields: [
      { key: 'chip_name', label: 'Chip Name', type: 'text', placeholder: 'e.g. RAD750' },
      { key: 'orbit_km', label: 'Orbit (km)', type: 'number', placeholder: 'e.g. 400' },
      { key: 'duration_days', label: 'Duration (days)', type: 'number', placeholder: 'e.g. 365' },
    ],
    samples: [
      { label: 'RAD750 @ JWST L2', values: { chip_name: 'RAD750', orbit_km: '1500000', duration_days: '3650' } },
      { label: 'RAD5545 @ Artemis II', values: { chip_name: 'RAD5545', orbit_km: '384400', duration_days: '10' } },
      { label: 'PolarFire SoC LEO', values: { chip_name: 'PolarFire SoC', orbit_km: '550', duration_days: '730' } },
    ],
  },
  {
    id: 'fail-risk', label: 'Failure Risk Assessment', icon: <AlertTriangle size={18} />, endpoint: '/ai/failure-risk', color: 'orange',
    fields: [
      { key: 'chip_name', label: 'Chip Name', type: 'text', placeholder: 'e.g. Leon3-FT' },
      { key: 'mission_type', label: 'Mission Type', type: 'text', placeholder: 'e.g. interplanetary' },
      { key: 'radiation_dose_krad', label: 'Radiation Dose (krad)', type: 'number', placeholder: 'e.g. 100' },
    ],
    samples: [
      { label: 'LEON3FT — Europa Clipper', values: { chip_name: 'LEON3FT', mission_type: 'Jovian interplanetary', radiation_dose_krad: '300' } },
      { label: 'RTG4 FPGA — GOES-U', values: { chip_name: 'RTG4', mission_type: 'GEO weather', radiation_dose_krad: '100' } },
      { label: 'MSP430-SP — Artemis II', values: { chip_name: 'MSP430-SP', mission_type: 'cislunar crewed', radiation_dose_krad: '50' } },
    ],
  },
  {
    id: 'mission-analysis', label: 'Mission Analysis', icon: <Rocket size={18} />, endpoint: '/ai/mission-analysis', color: 'violet',
    fields: [
      { key: 'mission_name', label: 'Mission Name', type: 'text', placeholder: 'e.g. Europa Clipper' },
      { key: 'orbit_km', label: 'Orbit (km)', type: 'number', placeholder: 'e.g. 628000' },
      { key: 'duration_days', label: 'Duration (days)', type: 'number', placeholder: 'e.g. 2920' },
    ],
    samples: [
      { label: 'Europa Clipper', values: { mission_name: 'Europa Clipper', orbit_km: '628000000', duration_days: '2190' } },
      { label: 'JWST (L2 halo)', values: { mission_name: 'JWST', orbit_km: '1500000', duration_days: '3650' } },
      { label: 'Artemis II', values: { mission_name: 'Artemis II', orbit_km: '384400', duration_days: '10' } },
    ],
  },
  {
    id: 'rad-tolerance', label: 'Radiation Tolerance Predictor', icon: <Radiation size={18} />, endpoint: '/ai/radiation-tolerance', color: 'orange',
    fields: [
      { key: 'chip_name', label: 'Chip Name', type: 'text', placeholder: 'e.g. RAD750' },
      { key: 'manufacturer', label: 'Manufacturer', type: 'text', placeholder: 'e.g. BAE Systems' },
      { key: 'orbit_km', label: 'Orbit (km)', type: 'number', placeholder: 'e.g. 35786' },
      { key: 'mission_type', label: 'Mission Type', type: 'text', placeholder: 'e.g. GEO, deep space' },
      { key: 'duration_days', label: 'Duration (days)', type: 'number', placeholder: 'e.g. 1825' },
      { key: 'shielding_mm', label: 'Shielding (mm Al)', type: 'number', placeholder: 'e.g. 2' },
    ],
    samples: [
      { label: 'RAD750 @ JWST', values: { chip_name: 'RAD750', manufacturer: 'BAE Systems', orbit_km: '1500000', mission_type: 'L2 halo / deep space', duration_days: '3650', shielding_mm: '4' } },
      { label: 'RTG4 @ GOES-U', values: { chip_name: 'RTG4', manufacturer: 'Microchip', orbit_km: '35786', mission_type: 'GEO weather', duration_days: '5475', shielding_mm: '2' } },
      { label: 'LEON3FT @ Europa Clipper', values: { chip_name: 'LEON3FT', manufacturer: 'Cobham Gaisler', orbit_km: '628000000', mission_type: 'Jovian interplanetary', duration_days: '2190', shielding_mm: '8' } },
    ],
  },
  {
    id: 'telemetry-anomaly', label: 'Telemetry Anomaly Detector', icon: <Activity size={18} />, endpoint: '/ai/telemetry-anomaly', color: 'blue',
    fields: [
      { key: 'chip_name', label: 'Chip Name', type: 'text', placeholder: 'e.g. GR740' },
      { key: 'window_minutes', label: 'Window (minutes)', type: 'number', placeholder: 'e.g. 60' },
      { key: 'telemetry', label: 'Telemetry CSV (temp_c,current_a,voltage_v,seu_count)', type: 'text', placeholder: '25,0.4,3.30,0\n26,0.41,3.30,0\n92,0.62,3.27,3' },
    ],
    samples: [
      { label: 'RAD750 SEU spike', values: { chip_name: 'RAD750', window_minutes: '60', telemetry: '24,0.40,3.30,0\n25,0.41,3.30,0\n26,0.42,3.30,1\n28,0.45,3.29,4\n31,0.51,3.27,7' } },
      { label: 'LEON3FT thermal drift', values: { chip_name: 'LEON3FT', window_minutes: '90', telemetry: '22,0.38,3.30,0\n45,0.46,3.29,0\n68,0.55,3.28,1\n85,0.63,3.26,2\n94,0.71,3.24,3' } },
      { label: 'PolarFire SoC nominal', values: { chip_name: 'PolarFire SoC', window_minutes: '30', telemetry: '23,0.50,1.20,0\n23,0.50,1.20,0\n24,0.51,1.20,0\n24,0.51,1.20,0' } },
    ],
  },
  {
    id: 'bom-optimizer', label: 'BOM Optimizer', icon: <ShoppingCart size={18} />, endpoint: '/ai/bom-optimizer', color: 'cyan',
    fields: [
      { key: 'subsystem', label: 'Subsystem', type: 'text', placeholder: 'e.g. on-board computer' },
      { key: 'parts', label: 'Candidate Parts (one per line)', type: 'text', placeholder: 'RAD750, $200k, MTTF 1e7\nLEON3-FT, $40k, MTTF 5e6' },
      { key: 'cost_target_usd', label: 'Cost Target (USD)', type: 'number', placeholder: 'e.g. 500000' },
      { key: 'reliability_target', label: 'Reliability Target', type: 'text', placeholder: 'e.g. high, mission-critical' },
    ],
    samples: [
      { label: 'OBC — Europa Clipper', values: { subsystem: 'on-board computer', parts: 'RAD750, $200k, MTTF 1e7\nRAD5545, $250k, MTTF 1.2e7\nLEON3FT, $40k, MTTF 5e6', cost_target_usd: '500000', reliability_target: 'mission-critical' } },
      { label: 'C&DH — GOES-U', values: { subsystem: 'C&DH avionics', parts: 'RTG4, $80k, MTTF 8e6\nPolarFire SoC, $35k, MTTF 4e6\nMSP430-SP, $5k, MTTF 3e6', cost_target_usd: '300000', reliability_target: 'high' } },
      { label: 'Lander GNC — Artemis II', values: { subsystem: 'GNC controller', parts: 'RAD5545, $250k, MTTF 1.2e7\nLEON3FT, $40k, MTTF 5e6\nRTG4, $80k, MTTF 8e6', cost_target_usd: '600000', reliability_target: 'human-rated' } },
    ],
  },
  {
    id: 'redundancy', label: 'Redundancy Strategy', icon: <Layers size={18} />, endpoint: '/ai/redundancy-strategy', color: 'violet',
    fields: [
      { key: 'subsystem', label: 'Subsystem', type: 'text', placeholder: 'e.g. flight computer' },
      { key: 'criticality', label: 'Criticality', type: 'text', placeholder: 'e.g. mission-critical' },
      { key: 'mission_duration_days', label: 'Mission Duration (days)', type: 'number', placeholder: 'e.g. 1825' },
      { key: 'mass_overhead_grams', label: 'Mass Overhead (g)', type: 'number', placeholder: 'e.g. 200' },
      { key: 'power_overhead_w', label: 'Power Overhead (W)', type: 'number', placeholder: 'e.g. 5' },
    ],
    samples: [
      { label: 'Flight computer — JWST', values: { subsystem: 'flight computer (RAD750)', criticality: 'mission-critical', mission_duration_days: '3650', mass_overhead_grams: '500', power_overhead_w: '8' } },
      { label: 'GNC — Artemis II (human-rated)', values: { subsystem: 'GNC (RAD5545)', criticality: 'human-rated', mission_duration_days: '10', mass_overhead_grams: '1200', power_overhead_w: '15' } },
      { label: 'Comms FPGA — Europa Clipper', values: { subsystem: 'comms FPGA (RTG4)', criticality: 'mission-critical', mission_duration_days: '2190', mass_overhead_grams: '300', power_overhead_w: '5' } },
    ],
  },
  {
    id: 'mission-success', label: 'Mission Success Likelihood', icon: <Target size={18} />, endpoint: '/ai/mission-success', color: 'orange',
    fields: [
      { key: 'mission_name', label: 'Mission Name', type: 'text', placeholder: 'e.g. Mars Lander' },
      { key: 'mission_type', label: 'Mission Type', type: 'text', placeholder: 'e.g. interplanetary' },
      { key: 'orbit_km', label: 'Orbit/Distance (km)', type: 'number', placeholder: 'e.g. 225000000' },
      { key: 'duration_days', label: 'Duration (days)', type: 'number', placeholder: 'e.g. 700' },
      { key: 'radiation_level', label: 'Radiation Level', type: 'text', placeholder: 'e.g. high' },
      { key: 'redundancy', label: 'Redundancy Scheme', type: 'text', placeholder: 'e.g. TMR + cold spare' },
      { key: 'key_components', label: 'Key Components', type: 'text', placeholder: 'e.g. RAD750, Virtex-5QV' },
    ],
    samples: [
      { label: 'Europa Clipper', values: { mission_name: 'Europa Clipper', mission_type: 'Jovian interplanetary', orbit_km: '628000000', duration_days: '2190', radiation_level: 'extreme', redundancy: 'TMR + cold spare + scrubbing', key_components: 'RAD750, LEON3FT, RTG4' } },
      { label: 'JWST', values: { mission_name: 'JWST', mission_type: 'L2 halo observatory', orbit_km: '1500000', duration_days: '3650', radiation_level: 'high', redundancy: 'dual-string + watchdog', key_components: 'RAD750, RTG4, MSP430-SP' } },
      { label: 'Artemis II', values: { mission_name: 'Artemis II', mission_type: 'cislunar crewed', orbit_km: '384400', duration_days: '10', radiation_level: 'high', redundancy: 'TMR + hot spare (human-rated)', key_components: 'RAD5545, PolarFire SoC, LEON3FT' } },
    ],
  },
];

export default function AICenter() {
  const [active, setActive] = useState(tools[0].id);
  const [forms, setForms] = useState<Record<string, Record<string, string>>>({});
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const tool = tools.find(t => t.id === active)!;
  const form = forms[active] || {};

  function setField(key: string, val: string) {
    setForms(f => ({ ...f, [active]: { ...(f[active] || {}), [key]: val } }));
  }

  function applySample(values: Record<string, string>) {
    setForms(f => ({ ...f, [active]: { ...values } }));
  }

  async function run() {
    setLoading(l => ({ ...l, [active]: true }));
    setResults(r => ({ ...r, [active]: '' }));
    try {
      const data = await apiFetch(tool.endpoint, { method: 'POST', body: JSON.stringify(form) });
      setResults(r => ({ ...r, [active]: data.result || data.analysis || data.recommendation || JSON.stringify(data) }));
    } catch (err: any) {
      setResults(r => ({ ...r, [active]: `Error: ${err.message}` }));
    } finally {
      setLoading(l => ({ ...l, [active]: false }));
    }
  }

  const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-900/30 text-cyan-400 border-cyan-800/40',
    blue: 'bg-blue-900/30 text-blue-400 border-blue-800/40',
    orange: 'bg-orange-900/30 text-orange-400 border-orange-800/40',
    violet: 'bg-violet-900/30 text-violet-400 border-violet-800/40',
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles size={22} className="text-violet-400" />
        <h1 className="text-2xl font-bold text-white">AI Center</h1>
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {tools.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all ${
              active === t.id ? `${colorMap[t.color]} border` : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
            }`}
          >
            {t.icon}
            <span className="text-sm font-medium">{t.label}</span>
          </button>
        ))}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-white mb-4">{tool.label}</h2>
        {tool.samples && tool.samples.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Prefill with sample data:</div>
            <div className="flex flex-wrap gap-2">
              {tool.samples.map(s => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => applySample(s.values)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${colorMap[tool.color]} hover:opacity-80`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-3">
          {tool.fields.map(f => {
            const isMultiline = f.placeholder && f.placeholder.includes('\n');
            return (
              <div key={f.key}>
                <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                {isMultiline ? (
                  <textarea
                    value={form[f.key] || ''}
                    onChange={e => setField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-600 font-mono"
                  />
                ) : (
                  <input
                    type={f.type}
                    value={form[f.key] || ''}
                    onChange={e => setField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-600"
                  />
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={run}
          disabled={loading[active]}
          className="mt-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {loading[active] ? 'Analyzing...' : 'Analyze'}
        </button>
        <AIResponse content={results[active] || ''} loading={!!loading[active]} />
      </div>
    </div>
  );
}
