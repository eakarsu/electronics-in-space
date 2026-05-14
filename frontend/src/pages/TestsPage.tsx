import { useState, useEffect } from 'react';
import { Plus, Search, FlaskConical, X, CheckCircle, XCircle } from 'lucide-react';
import { apiFetch } from '../api';
import { Test } from '../types';

const TYPE_COLORS: Record<string, string> = {
  TID: 'bg-purple-900/40 text-purple-400',
  SEE: 'bg-blue-900/40 text-blue-400',
  ThermalVacuum: 'bg-cyan-900/40 text-cyan-400',
  Vibration: 'bg-yellow-900/40 text-yellow-400',
  EMC: 'bg-orange-900/40 text-orange-400',
  ELDRS: 'bg-red-900/40 text-red-400',
};

export default function TestsPage() {
  const [items, setItems] = useState<Test[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Test | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    chip_id: '', test_type: 'TID', environment: 'ground', result: 'pass',
    temperature_c: 25, radiation_dose_krad: 0, test_date: '', lab: '', pass: true, failure_mode: '',
  });

  async function load() {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    setItems(await apiFetch(`/tests?${p}`));
  }

  useEffect(() => { load(); }, [search]);

  async function save() {
    await apiFetch('/tests', { method: 'POST', body: JSON.stringify({ ...form, pass: form.result === 'pass' }) });
    setShowForm(false); load();
  }

  async function remove(id: number) {
    await apiFetch(`/tests/${id}`, { method: 'DELETE' });
    setSelected(null); load();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Tests</h1>
        <button onClick={() => { setForm({ chip_id: '', test_type: 'TID', environment: 'ground', result: 'pass', temperature_c: 25, radiation_dose_krad: 0, test_date: '', lab: '', pass: true, failure_mode: '' }); setShowForm(true); }}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Plus size={16} />Log Test
        </button>
      </div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tests..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm" />
      </div>
      <div className="grid gap-3">
        {items.map(item => (
          <div key={item.id} onClick={() => setSelected(item)}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-cyan-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FlaskConical size={14} className="text-cyan-400" />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[item.test_type] || 'bg-gray-700 text-gray-300'}`}>{item.test_type}</span>
                  <span className="text-xs text-gray-500">{item.environment}</span>
                </div>
                <h3 className="font-semibold text-white">{item.chip_name || `Chip #${item.chip_id}`}</h3>
                <p className="text-xs text-gray-400 mt-1">{item.lab} • {item.temperature_c}°C • {item.radiation_dose_krad} krad</p>
              </div>
              <div className="ml-4 flex flex-col items-end gap-1">
                {item.pass
                  ? <div className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /><span className="text-xs text-green-400">PASS</span></div>
                  : <div className="flex items-center gap-1"><XCircle size={14} className="text-red-400" /><span className="text-xs text-red-400">FAIL</span></div>}
                {item.test_date && <span className="text-xs text-gray-500">{new Date(item.test_date).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Test Detail</h2>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-500">Chip</p><p className="text-white">{selected.chip_name || `#${selected.chip_id}`}</p></div>
              <div><p className="text-xs text-gray-500">Test Type</p><p className="text-white">{selected.test_type}</p></div>
              <div><p className="text-xs text-gray-500">Environment</p><p className="text-white capitalize">{selected.environment}</p></div>
              <div><p className="text-xs text-gray-500">Result</p>
                <p className={selected.pass ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{selected.pass ? 'PASS' : 'FAIL'}</p>
              </div>
              <div><p className="text-xs text-gray-500">Temperature</p><p className="text-white">{selected.temperature_c}°C</p></div>
              <div><p className="text-xs text-gray-500">Rad Dose</p><p className="text-white">{selected.radiation_dose_krad} krad</p></div>
              <div><p className="text-xs text-gray-500">Lab</p><p className="text-white">{selected.lab}</p></div>
              <div><p className="text-xs text-gray-500">Test Date</p><p className="text-white">{selected.test_date ? new Date(selected.test_date).toLocaleDateString() : 'N/A'}</p></div>
            </div>
            {selected.failure_mode && <div><p className="text-xs text-gray-500 mb-1">Failure Mode</p><p className="text-red-300 text-sm">{selected.failure_mode}</p></div>}
            <button onClick={() => remove(selected.id)} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-medium">Delete</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-4">Log Test</h2>
            <div className="space-y-3">
              <input type="number" value={form.chip_id} onChange={e => setForm({ ...form, chip_id: e.target.value })} placeholder="Chip ID"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.test_type} onChange={e => setForm({ ...form, test_type: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                  {['TID', 'SEE', 'ThermalVacuum', 'Vibration', 'EMC', 'ELDRS'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={form.environment} onChange={e => setForm({ ...form, environment: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                  {['ground', 'space', 'simulation', 'laboratory'].map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <select value={form.result} onChange={e => setForm({ ...form, result: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                  <option value="marginal">Marginal</option>
                </select>
                <input type="number" value={form.temperature_c} onChange={e => setForm({ ...form, temperature_c: parseInt(e.target.value) })} placeholder="Temp (°C)"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" value={form.radiation_dose_krad} onChange={e => setForm({ ...form, radiation_dose_krad: parseInt(e.target.value) })} placeholder="Rad dose (krad)"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="date" value={form.test_date} onChange={e => setForm({ ...form, test_date: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
              <input value={form.lab} onChange={e => setForm({ ...form, lab: e.target.value })} placeholder="Lab name"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <input value={form.failure_mode} onChange={e => setForm({ ...form, failure_mode: e.target.value })} placeholder="Failure mode (if any)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
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
