import { useEffect, useState } from 'react';
import { Boxes, ChevronRight, X, Plus, Play, CheckCircle2, XCircle } from 'lucide-react';
import { apiFetch } from '../api';

interface Lot {
  id: number; chip_id: number; chip_name?: string; chip_manufacturer?: string;
  lot_code: string; date_code: string; parts_received: number;
  parts_accepted: number; parts_rejected: number; upscreen_class: string;
  customer: string; start_date: string; complete_date: string; status: string;
  notes: string; step_count: number; final_yield_pct: number;
}
interface Step {
  id: number; step_order: number; step_name: string; standard_ref: string;
  duration_hours: number; temperature_c: number; voltage_stress_v: number;
  parts_in: number; parts_pass: number; parts_fail: number; yield_pct: number;
  observations: string;
}

const STATUS_COLOR: Record<string, string> = {
  'in-progress': 'bg-blue-900/40 text-blue-400',
  complete: 'bg-green-900/40 text-green-400',
  failed: 'bg-red-900/40 text-red-400',
};

export default function UpscreenLotsPage() {
  const [items, setItems] = useState<Lot[]>([]);
  const [selected, setSelected] = useState<Lot | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [chips, setChips] = useState<{ id: number; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({
    chip_id: '', lot_code: '', date_code: '', parts_received: 100,
    upscreen_class: 'AEC-Q100 + 30krad rad-screen', customer: '',
    start_date: '', notes: '',
  });

  async function load() { setItems(await apiFetch('/upscreen-lots')); }
  useEffect(() => { load(); }, []);
  useEffect(() => { apiFetch('/chips').then((c: any[]) => setChips(c.map(x => ({ id: x.id, name: x.name })))); }, []);

  async function openLot(l: Lot) {
    setSelected(l);
    const d = await apiFetch(`/upscreen-lots/${l.id}`);
    setSteps(d.steps);
  }
  async function advance() {
    if (!selected) return;
    try {
      const r = await apiFetch(`/upscreen-lots/${selected.id}/advance`, { method: 'POST', body: '{}' });
      setSteps(s => [...s, r.step]);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  }
  async function save() {
    await apiFetch('/upscreen-lots', { method: 'POST', body: JSON.stringify(form) });
    setShowForm(false); load();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3"><Boxes className="text-cyan-400" size={22} />
          <div><h1 className="text-2xl font-bold text-white">COTS Upscreening Lots</h1>
          <p className="text-xs text-gray-500">NewSpace screening flow: MIL-STD-883 TM2009/2012/2020/1014/1015/1019</p></div>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
          <Plus size={16} />New Lot
        </button>
      </div>
      <div className="grid gap-3">
        {items.map(l => (
          <div key={l.id} onClick={() => openLot(l)} className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-cyan-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs text-gray-500">{l.customer || 'in-house'} · DC {l.date_code}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[l.status] || 'bg-gray-700 text-gray-400'}`}>{l.status}</span>
                </div>
                <h3 className="font-semibold text-white">{l.lot_code} <span className="text-gray-400 text-sm font-normal">- {l.chip_name}</span></h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                  <span>Class: {l.upscreen_class}</span>
                  <span>{l.parts_received} in</span>
                  <span className="text-green-400">{l.parts_accepted} OK</span>
                  {l.parts_rejected > 0 && <span className="text-red-400">{l.parts_rejected} rej</span>}
                  {l.final_yield_pct != null && <span className="text-cyan-300">Yield {l.final_yield_pct}%</span>}
                  <span>{l.step_count} steps</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-600" />
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-y-0 right-0 w-[600px] bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">{selected.lot_code}</h2>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm mb-5">
            <div><p className="text-xs text-gray-500">Chip</p><p className="text-cyan-300">{selected.chip_name}</p></div>
            <div><p className="text-xs text-gray-500">Customer</p><p className="text-white">{selected.customer}</p></div>
            <div><p className="text-xs text-gray-500">Date code</p><p className="text-white">{selected.date_code}</p></div>
            <div><p className="text-xs text-gray-500">Class</p><p className="text-white text-xs">{selected.upscreen_class}</p></div>
            <div><p className="text-xs text-gray-500">Parts in</p><p className="text-white">{selected.parts_received}</p></div>
            <div><p className="text-xs text-gray-500">Yield</p><p className="text-cyan-300">{selected.final_yield_pct ?? '--'}%</p></div>
          </div>
          <p className="text-xs text-gray-400 italic mb-3">{selected.notes}</p>

          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-300">Pipeline steps</h3>
            <button onClick={advance} className="bg-cyan-700 hover:bg-cyan-600 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
              <Play size={12} />Advance Next Step
            </button>
          </div>
          <div className="space-y-2">
            {steps.map(s => (
              <div key={s.id} className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-6">{s.step_order}</span>
                  <span className="text-sm font-semibold text-white flex-1">{s.step_name}</span>
                  {s.parts_pass === s.parts_in ? <CheckCircle2 size={14} className="text-green-400" /> : <XCircle size={14} className="text-yellow-400" />}
                  <span className="text-xs text-cyan-300">{s.yield_pct}%</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex gap-3 flex-wrap">
                  <span>{s.standard_ref}</span>
                  {s.duration_hours && <span>{s.duration_hours} hr</span>}
                  {s.temperature_c != null && <span>{s.temperature_c}°C</span>}
                  {s.voltage_stress_v && <span>{s.voltage_stress_v} V</span>}
                  <span>{s.parts_in} → {s.parts_pass} (fail {s.parts_fail})</span>
                </div>
                {s.observations && <p className="text-xs text-gray-500 italic mt-1">{s.observations}</p>}
              </div>
            ))}
            {steps.length === 0 && <p className="text-xs text-gray-500 italic">No steps yet. Click Advance to start.</p>}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-4">New Upscreen Lot</h2>
            <div className="space-y-3">
              <select value={form.chip_id} onChange={e => setForm({ ...form, chip_id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                <option value="">-- chip --</option>
                {chips.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Lot code" value={form.lot_code} onChange={e => setForm({ ...form, lot_code: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input placeholder="Date code" value={form.date_code} onChange={e => setForm({ ...form, date_code: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" placeholder="Parts received" value={form.parts_received} onChange={e => setForm({ ...form, parts_received: parseInt(e.target.value) })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
              <input placeholder="Upscreen class" value={form.upscreen_class} onChange={e => setForm({ ...form, upscreen_class: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <input placeholder="Customer" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })}
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
