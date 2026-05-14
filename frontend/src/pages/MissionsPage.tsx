import { useState, useEffect } from 'react';
import { Plus, Search, Rocket, X } from 'lucide-react';
import { apiFetch } from '../api';
import { Mission } from '../types';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-900/40 text-green-400',
  completed: 'bg-blue-900/40 text-blue-400',
  planned: 'bg-yellow-900/40 text-yellow-400',
  failed: 'bg-red-900/40 text-red-400',
  extended: 'bg-purple-900/40 text-purple-400',
};

const RAD_COLORS: Record<string, string> = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  extreme: 'text-red-400',
};

export default function MissionsPage() {
  const [items, setItems] = useState<Mission[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Mission | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Mission | null>(null);
  const [form, setForm] = useState({
    name: '', mission_type: 'LEO', orbit_km: 400, radiation_level: 'medium',
    duration_days: 365, launch_date: '', status: 'planned', agency: '',
    budget_millions: 0, success_probability: 0.85,
  });

  async function load() {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    setItems(await apiFetch(`/missions?${p}`));
  }

  useEffect(() => { load(); }, [search]);

  async function save() {
    if (editing) {
      await apiFetch(`/missions/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
    } else {
      await apiFetch('/missions', { method: 'POST', body: JSON.stringify(form) });
    }
    setShowForm(false); setEditing(null); load();
  }

  async function remove(id: number) {
    await apiFetch(`/missions/${id}`, { method: 'DELETE' });
    setSelected(null); load();
  }

  function openEdit(m: Mission) {
    setEditing(m);
    setForm({
      name: m.name, mission_type: m.mission_type, orbit_km: m.orbit_km,
      radiation_level: m.radiation_level, duration_days: m.duration_days,
      launch_date: m.launch_date?.split('T')[0] || '', status: m.status, agency: m.agency,
      budget_millions: m.budget_millions, success_probability: m.success_probability,
    });
    setShowForm(true);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Missions</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', mission_type: 'LEO', orbit_km: 400, radiation_level: 'medium', duration_days: 365, launch_date: '', status: 'planned', agency: '', budget_millions: 0, success_probability: 0.85 }); setShowForm(true); }}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Plus size={16} />Add Mission
        </button>
      </div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search missions..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm" />
      </div>
      <div className="grid gap-3">
        {items.map(item => (
          <div key={item.id} onClick={() => setSelected(item)}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-cyan-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Rocket size={14} className="text-cyan-400" />
                  <span className="text-xs text-gray-500">{item.mission_type} • {item.agency}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status] || 'bg-gray-700 text-gray-400'}`}>{item.status}</span>
                </div>
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{item.orbit_km.toLocaleString()} km • {item.duration_days} days • ${item.budget_millions}M</p>
              </div>
              <div className="ml-4 text-right">
                <div className={`text-sm font-medium ${RAD_COLORS[item.radiation_level] || 'text-gray-400'}`}>{item.radiation_level}</div>
                <div className="text-xs text-gray-500 mt-0.5">radiation</div>
                <div className="text-xs text-green-400 mt-1">{Math.round(item.success_probability * 100)}% success</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Mission Detail</h2>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-500">Mission</p><p className="text-white font-medium">{selected.name}</p></div>
              <div><p className="text-xs text-gray-500">Agency</p><p className="text-white">{selected.agency}</p></div>
              <div><p className="text-xs text-gray-500">Type</p><p className="text-white">{selected.mission_type}</p></div>
              <div><p className="text-xs text-gray-500">Status</p><p className="text-white capitalize">{selected.status}</p></div>
              <div><p className="text-xs text-gray-500">Orbit</p><p className="text-white">{selected.orbit_km.toLocaleString()} km</p></div>
              <div><p className="text-xs text-gray-500">Duration</p><p className="text-white">{selected.duration_days} days</p></div>
              <div><p className="text-xs text-gray-500">Radiation</p><p className={RAD_COLORS[selected.radiation_level]}>{selected.radiation_level}</p></div>
              <div><p className="text-xs text-gray-500">Budget</p><p className="text-white">${selected.budget_millions}M</p></div>
              <div><p className="text-xs text-gray-500">Success Prob.</p><p className="text-green-400">{Math.round(selected.success_probability * 100)}%</p></div>
              <div><p className="text-xs text-gray-500">Launch</p><p className="text-white">{selected.launch_date ? new Date(selected.launch_date).toLocaleDateString() : 'TBD'}</p></div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => openEdit(selected)} className="flex-1 bg-cyan-700 hover:bg-cyan-600 text-white py-2 rounded-lg text-sm font-medium">Edit</button>
              <button onClick={() => remove(selected.id)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">{editing ? 'Edit Mission' : 'Add Mission'}</h2>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Mission Name"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <input value={form.agency} onChange={e => setForm({ ...form, agency: e.target.value })} placeholder="Agency (NASA, ESA...)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.mission_type} onChange={e => setForm({ ...form, mission_type: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                  {['LEO', 'GEO', 'MEO', 'deep_space', 'lunar', 'interplanetary', 'HEO'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={form.radiation_level} onChange={e => setForm({ ...form, radiation_level: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                  {['low', 'medium', 'high', 'extreme'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <input type="number" value={form.orbit_km} onChange={e => setForm({ ...form, orbit_km: parseInt(e.target.value) })} placeholder="Orbit (km)"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" value={form.duration_days} onChange={e => setForm({ ...form, duration_days: parseInt(e.target.value) })} placeholder="Duration (days)"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" value={form.budget_millions} onChange={e => setForm({ ...form, budget_millions: parseFloat(e.target.value) })} placeholder="Budget ($M)"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" step="0.01" min="0" max="1" value={form.success_probability} onChange={e => setForm({ ...form, success_probability: parseFloat(e.target.value) })} placeholder="Success Prob. (0-1)"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                  {['planned', 'active', 'completed', 'failed', 'extended'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="date" value={form.launch_date} onChange={e => setForm({ ...form, launch_date: e.target.value })} placeholder="Launch Date"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={save} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg text-sm font-medium">Save</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
