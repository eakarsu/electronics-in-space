import { useEffect, useState } from 'react';
import { Atom, FlaskConical, Plus, X, ChevronRight, Activity } from 'lucide-react';
import { apiFetch } from '../api';

interface Campaign {
  id: number;
  chip_id: number;
  chip_name?: string;
  chip_manufacturer?: string;
  campaign_name: string;
  test_standard: string;
  facility: string;
  beam_type: string;
  campaign_status: string;
  total_tid_target_krad: number;
  dose_rate_rad_per_sec: number;
  start_date: string;
  end_date: string;
  pi_engineer: string;
  notes: string;
  run_count: number;
  fail_count: number;
}
interface Run {
  id: number; run_label: string; effect_type: string;
  let_mev_cm2_mg: number; fluence_particles_cm2: number; cumulative_tid_krad: number;
  errors_observed: number; cross_section_cm2: number; threshold_let: number;
  pass: boolean; observations: string;
}
interface Curve { curve: Record<string, { points: { let: number; xs: number }[]; let_th: number | null; sat_xs: number }>; }

const STATUS_COLOR: Record<string, string> = {
  planned:       'bg-yellow-900/40 text-yellow-400',
  'in-progress': 'bg-blue-900/40 text-blue-400',
  complete:      'bg-green-900/40 text-green-400',
  failed:        'bg-red-900/40 text-red-400',
};
const EFFECT_COLOR: Record<string, string> = {
  TID: 'text-amber-400', SEU: 'text-cyan-400', SEL: 'text-red-400',
  SEFI: 'text-fuchsia-400', SET: 'text-emerald-400', DDD: 'text-orange-400',
};

export default function RadTestCampaignsPage() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [curve, setCurve] = useState<Curve | null>(null);
  const [chips, setChips] = useState<{ id: number; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({
    chip_id: '', campaign_name: '', test_standard: 'MIL-STD-883 TM1019',
    facility: 'TAMU K500', beam_type: 'heavy-ion', campaign_status: 'planned',
    total_tid_target_krad: 100, dose_rate_rad_per_sec: 50, start_date: '', end_date: '',
    pi_engineer: '', notes: '',
  });

  async function load() {
    const p = statusFilter ? `?status=${statusFilter}` : '';
    setItems(await apiFetch(`/rad-test-campaigns${p}`));
  }
  useEffect(() => { load(); }, [statusFilter]);
  useEffect(() => { apiFetch('/chips').then((c: any[]) => setChips(c.map(x => ({ id: x.id, name: x.name })))); }, []);

  async function openDetail(c: Campaign) {
    setSelected(c);
    const d = await apiFetch(`/rad-test-campaigns/${c.id}`);
    setRuns(d.runs);
    setCurve(await apiFetch(`/rad-test-campaigns/${c.id}/cross-section-curve`));
  }

  async function save() {
    await apiFetch('/rad-test-campaigns', { method: 'POST', body: JSON.stringify(form) });
    setShowForm(false); load();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3"><Atom className="text-cyan-400" size={22} />
          <div><h1 className="text-2xl font-bold text-white">Radiation Test Campaigns</h1>
          <p className="text-xs text-gray-500">MIL-STD-883 TM1019 / JESD57 / ESCC 22900 - real facilities (TAMU, BNL, RADEF, LBNL)</p></div>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
          <Plus size={16} />New Campaign
        </button>
      </div>
      <div className="flex gap-2 mb-4 text-xs">
        {['', 'planned', 'in-progress', 'complete', 'failed'].map(s => (
          <button key={s || 'all'} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg border ${statusFilter === s ? 'bg-cyan-900/30 text-cyan-300 border-cyan-700/50' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'}`}>
            {s || 'all'}
          </button>
        ))}
      </div>
      <div className="grid gap-3">
        {items.map(c => (
          <div key={c.id} onClick={() => openDetail(c)}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-cyan-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <FlaskConical size={13} className="text-cyan-400" />
                  <span className="text-xs text-gray-500">{c.facility} - {c.beam_type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[c.campaign_status] || 'bg-gray-700 text-gray-400'}`}>{c.campaign_status}</span>
                </div>
                <h3 className="font-semibold text-white">{c.campaign_name}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                  <span>Chip: <span className="text-cyan-300">{c.chip_name || `#${c.chip_id}`}</span></span>
                  <span>Std: {c.test_standard}</span>
                  {c.total_tid_target_krad ? <span>{c.total_tid_target_krad} krad target</span> : null}
                  <span>{c.run_count || 0} runs</span>
                  {c.fail_count > 0 && <span className="text-red-400">{c.fail_count} fails</span>}
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-600" />
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-500 text-sm">No campaigns yet.</p>}
      </div>

      {selected && (
        <div className="fixed inset-y-0 right-0 w-[560px] bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">{selected.campaign_name}</h2>
            <button onClick={() => { setSelected(null); setRuns([]); setCurve(null); }} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm mb-5">
            <div><p className="text-xs text-gray-500">Chip</p><p className="text-cyan-300">{selected.chip_name}</p></div>
            <div><p className="text-xs text-gray-500">Facility</p><p className="text-white">{selected.facility}</p></div>
            <div><p className="text-xs text-gray-500">Beam</p><p className="text-white">{selected.beam_type}</p></div>
            <div><p className="text-xs text-gray-500">Standard</p><p className="text-white text-xs">{selected.test_standard}</p></div>
            <div><p className="text-xs text-gray-500">PI</p><p className="text-white">{selected.pi_engineer}</p></div>
            <div><p className="text-xs text-gray-500">Dates</p><p className="text-white">{selected.start_date?.split('T')[0]} → {selected.end_date?.split('T')[0] || 'open'}</p></div>
          </div>
          <p className="text-xs text-gray-400 italic mb-4">{selected.notes}</p>

          {curve && Object.keys(curve.curve).length > 0 && (
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1"><Activity size={13} />Cross-section vs LET</p>
              {Object.entries(curve.curve).map(([effect, e]) => (
                <div key={effect} className="text-xs text-gray-400 mb-1">
                  <span className={EFFECT_COLOR[effect] + ' font-bold mr-2'}>{effect}</span>
                  LET_th = {e.let_th ?? 'n/a'} MeV-cm²/mg ; sat_XS = {e.sat_xs.toExponential(2)} cm² ; {e.points.length} pts
                </div>
              ))}
            </div>
          )}

          <h3 className="text-sm font-semibold text-gray-300 mb-2">Test runs ({runs.length})</h3>
          <div className="space-y-2">
            {runs.map(r => (
              <div key={r.id} className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold ${EFFECT_COLOR[r.effect_type] || 'text-gray-300'}`}>{r.effect_type}</span>
                  <span className="text-xs text-gray-500">{r.run_label}</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${r.pass ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>{r.pass ? 'pass' : 'fail'}</span>
                </div>
                <div className="text-xs text-gray-400 grid grid-cols-2 gap-x-3">
                  {r.let_mev_cm2_mg && <span>LET {r.let_mev_cm2_mg}</span>}
                  {r.fluence_particles_cm2 && <span>Φ {Number(r.fluence_particles_cm2).toExponential(1)}</span>}
                  {r.cumulative_tid_krad && <span>TID {r.cumulative_tid_krad} krad</span>}
                  {r.cross_section_cm2 ? <span>σ {Number(r.cross_section_cm2).toExponential(2)} cm²</span> : null}
                  {r.errors_observed != null && <span>err {r.errors_observed}</span>}
                </div>
                {r.observations && <p className="text-xs text-gray-500 mt-1 italic">{r.observations}</p>}
              </div>
            ))}
            {runs.length === 0 && <p className="text-gray-500 text-xs italic">No runs logged.</p>}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">New Campaign</h2>
            <div className="space-y-3">
              <select value={form.chip_id} onChange={e => setForm({ ...form, chip_id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                <option value="">-- chip --</option>
                {chips.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input placeholder="Campaign name" value={form.campaign_name}
                onChange={e => setForm({ ...form, campaign_name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <input placeholder="Test standard" value={form.test_standard}
                onChange={e => setForm({ ...form, test_standard: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Facility" value={form.facility} onChange={e => setForm({ ...form, facility: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input placeholder="Beam" value={form.beam_type} onChange={e => setForm({ ...form, beam_type: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" placeholder="TID target krad" value={form.total_tid_target_krad}
                  onChange={e => setForm({ ...form, total_tid_target_krad: parseFloat(e.target.value) })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" placeholder="Dose rate (rad/s)" value={form.dose_rate_rad_per_sec}
                  onChange={e => setForm({ ...form, dose_rate_rad_per_sec: parseFloat(e.target.value) })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
              <input placeholder="PI engineer" value={form.pi_engineer} onChange={e => setForm({ ...form, pi_engineer: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <textarea placeholder="Notes" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={save} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg text-sm">Save</button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
