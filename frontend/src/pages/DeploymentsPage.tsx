import { useState, useEffect } from 'react';
import { Plus, Search, Link2, X, CheckCircle, XCircle } from 'lucide-react';
import { apiFetch } from '../api';
import { ChipDeployment } from '../types';

const STATUS_COLORS: Record<string, string> = {
  nominal: 'bg-green-900/40 text-green-400',
  degraded: 'bg-yellow-900/40 text-yellow-400',
  failed: 'bg-red-900/40 text-red-400',
  standby: 'bg-blue-900/40 text-blue-400',
};

export default function DeploymentsPage() {
  const [items, setItems] = useState<ChipDeployment[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ChipDeployment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    chip_id: '', mission_id: '', performance_score: 0.9, sei_rate: 0.001,
    thermal_ok: true, power_consumed_w: 5, status: 'nominal', deployed_at: '', notes: '',
  });

  async function load() {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    setItems(await apiFetch(`/deployments?${p}`));
  }

  useEffect(() => { load(); }, [search]);

  async function save() {
    await apiFetch('/deployments', { method: 'POST', body: JSON.stringify(form) });
    setShowForm(false); load();
  }

  async function remove(id: number) {
    await apiFetch(`/deployments/${id}`, { method: 'DELETE' });
    setSelected(null); load();
  }

  function scoreColor(s: number) {
    if (s >= 0.9) return 'text-green-400';
    if (s >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Chip Deployments</h1>
        <button onClick={() => { setForm({ chip_id: '', mission_id: '', performance_score: 0.9, sei_rate: 0.001, thermal_ok: true, power_consumed_w: 5, status: 'nominal', deployed_at: '', notes: '' }); setShowForm(true); }}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Plus size={16} />Add Deployment
        </button>
      </div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deployments..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm" />
      </div>
      <div className="grid gap-3">
        {items.map(item => (
          <div key={item.id} onClick={() => setSelected(item)}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-cyan-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link2 size={14} className="text-cyan-400" />
                  <span className="text-xs text-gray-500">{item.chip_name || `Chip #${item.chip_id}`} → {item.mission_name || `Mission #${item.mission_id}`}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status] || 'bg-gray-700 text-gray-400'}`}>{item.status}</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className={`text-sm font-bold ${scoreColor(item.performance_score)}`}>
                    {Math.round(item.performance_score * 100)}% perf
                  </span>
                  <span className="text-xs text-gray-400">SEI: {item.sei_rate}/day</span>
                  <span className="text-xs text-gray-400">{item.power_consumed_w}W</span>
                  <span className="flex items-center gap-1 text-xs">
                    {item.thermal_ok
                      ? <><CheckCircle size={12} className="text-green-400" /><span className="text-green-400">thermal ok</span></>
                      : <><XCircle size={12} className="text-red-400" /><span className="text-red-400">thermal fault</span></>}
                  </span>
                </div>
              </div>
              {item.deployed_at && <p className="text-xs text-gray-500 ml-4">{new Date(item.deployed_at).toLocaleDateString()}</p>}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Deployment Detail</h2>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-500">Chip</p><p className="text-white">{selected.chip_name || `#${selected.chip_id}`}</p></div>
              <div><p className="text-xs text-gray-500">Mission</p><p className="text-white">{selected.mission_name || `#${selected.mission_id}`}</p></div>
              <div><p className="text-xs text-gray-500">Performance</p><p className={scoreColor(selected.performance_score)}>{Math.round(selected.performance_score * 100)}%</p></div>
              <div><p className="text-xs text-gray-500">SEI Rate</p><p className="text-white">{selected.sei_rate}/day</p></div>
              <div><p className="text-xs text-gray-500">Power</p><p className="text-white">{selected.power_consumed_w}W</p></div>
              <div><p className="text-xs text-gray-500">Thermal</p><p className={selected.thermal_ok ? 'text-green-400' : 'text-red-400'}>{selected.thermal_ok ? 'OK' : 'Fault'}</p></div>
              <div><p className="text-xs text-gray-500">Status</p><p className="text-white capitalize">{selected.status}</p></div>
              <div><p className="text-xs text-gray-500">Deployed</p><p className="text-white">{selected.deployed_at ? new Date(selected.deployed_at).toLocaleDateString() : 'N/A'}</p></div>
            </div>
            {selected.notes && <div><p className="text-xs text-gray-500 mb-1">Notes</p><p className="text-gray-300 text-sm">{selected.notes}</p></div>}
            <button onClick={() => remove(selected.id)} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-medium">Delete</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-4">Add Deployment</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.chip_id} onChange={e => setForm({ ...form, chip_id: e.target.value })} placeholder="Chip ID"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" value={form.mission_id} onChange={e => setForm({ ...form, mission_id: e.target.value })} placeholder="Mission ID"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" step="0.01" value={form.performance_score} onChange={e => setForm({ ...form, performance_score: parseFloat(e.target.value) })} placeholder="Performance (0-1)"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" step="0.0001" value={form.sei_rate} onChange={e => setForm({ ...form, sei_rate: parseFloat(e.target.value) })} placeholder="SEI Rate"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" step="0.1" value={form.power_consumed_w} onChange={e => setForm({ ...form, power_consumed_w: parseFloat(e.target.value) })} placeholder="Power (W)"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                  {['nominal', 'degraded', 'failed', 'standby'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="thermal" checked={form.thermal_ok} onChange={e => setForm({ ...form, thermal_ok: e.target.checked })} className="accent-cyan-500" />
                <label htmlFor="thermal" className="text-sm text-gray-300">Thermal OK</label>
              </div>
              <input type="date" value={form.deployed_at} onChange={e => setForm({ ...form, deployed_at: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" rows={2} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={save} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg text-sm font-medium">Save</button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
