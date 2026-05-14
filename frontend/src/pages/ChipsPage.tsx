import { useState, useEffect } from 'react';
import { Plus, Search, Cpu, X } from 'lucide-react';
import { apiFetch } from '../api';
import { Chip } from '../types';

const RAD_COLORS = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400'];
const RAD_LABELS = ['None', 'Low', 'Medium', 'High'];
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-900/40 text-green-400',
  legacy: 'bg-yellow-900/40 text-yellow-400',
  eol: 'bg-red-900/40 text-red-400',
  development: 'bg-blue-900/40 text-blue-400',
};

function formatOps(ops: number) {
  if (ops >= 1e12) return `${(ops / 1e12).toFixed(1)} TOPS`;
  if (ops >= 1e9) return `${(ops / 1e9).toFixed(1)} GOPS`;
  if (ops >= 1e6) return `${(ops / 1e6).toFixed(1)} MOPS`;
  return `${ops} OPS`;
}

export default function ChipsPage() {
  const [items, setItems] = useState<Chip[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Chip | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Chip | null>(null);
  const [form, setForm] = useState({
    name: '', manufacturer: '', process_node_nm: 180, tdp_watts: 5, mass_grams: 10,
    rad_hardening_level: 2, operating_temp_min: -55, operating_temp_max: 125,
    ops_per_second: 1000000000, status: 'active', first_launch: '',
  });

  async function load() {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    setItems(await apiFetch(`/chips?${p}`));
  }

  useEffect(() => { load(); }, [search]);

  async function save() {
    if (editing) {
      await apiFetch(`/chips/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
    } else {
      await apiFetch('/chips', { method: 'POST', body: JSON.stringify(form) });
    }
    setShowForm(false); setEditing(null); load();
  }

  async function remove(id: number) {
    await apiFetch(`/chips/${id}`, { method: 'DELETE' });
    setSelected(null); load();
  }

  function openEdit(chip: Chip) {
    setEditing(chip);
    setForm({
      name: chip.name, manufacturer: chip.manufacturer, process_node_nm: chip.process_node_nm,
      tdp_watts: chip.tdp_watts, mass_grams: chip.mass_grams, rad_hardening_level: chip.rad_hardening_level,
      operating_temp_min: chip.operating_temp_min, operating_temp_max: chip.operating_temp_max,
      ops_per_second: chip.ops_per_second, status: chip.status, first_launch: chip.first_launch?.split('T')[0] || '',
    });
    setShowForm(true);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Space Chips</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', manufacturer: '', process_node_nm: 180, tdp_watts: 5, mass_grams: 10, rad_hardening_level: 2, operating_temp_min: -55, operating_temp_max: 125, ops_per_second: 1000000000, status: 'active', first_launch: '' }); setShowForm(true); }}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Plus size={16} />Add Chip
        </button>
      </div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chips..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm" />
      </div>
      <div className="grid gap-3">
        {items.map(item => (
          <div key={item.id} onClick={() => setSelected(item)}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-cyan-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Cpu size={14} className="text-cyan-400" />
                  <span className="text-xs text-gray-500">{item.manufacturer} • {item.process_node_nm}nm</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status] || 'bg-gray-700 text-gray-400'}`}>{item.status}</span>
                </div>
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{item.tdp_watts}W • {item.mass_grams}g • {formatOps(item.ops_per_second)}</p>
              </div>
              <div className="ml-4 text-right">
                <div className={`text-sm font-bold ${RAD_COLORS[item.rad_hardening_level] || 'text-gray-400'}`}>
                  {'★'.repeat(item.rad_hardening_level)}{'☆'.repeat(3 - Math.min(3, item.rad_hardening_level))}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{RAD_LABELS[item.rad_hardening_level] || 'Unknown'} RadHard</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Chip Detail</h2>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-500">Name</p><p className="text-white font-medium">{selected.name}</p></div>
              <div><p className="text-xs text-gray-500">Manufacturer</p><p className="text-white">{selected.manufacturer}</p></div>
              <div><p className="text-xs text-gray-500">Process Node</p><p className="text-white">{selected.process_node_nm}nm</p></div>
              <div><p className="text-xs text-gray-500">TDP</p><p className="text-white">{selected.tdp_watts}W</p></div>
              <div><p className="text-xs text-gray-500">Mass</p><p className="text-white">{selected.mass_grams}g</p></div>
              <div><p className="text-xs text-gray-500">Performance</p><p className="text-cyan-400">{formatOps(selected.ops_per_second)}</p></div>
              <div><p className="text-xs text-gray-500">Temp Range</p><p className="text-white">{selected.operating_temp_min}°C to {selected.operating_temp_max}°C</p></div>
              <div><p className="text-xs text-gray-500">Rad Hardening</p><p className={RAD_COLORS[selected.rad_hardening_level]}>{RAD_LABELS[selected.rad_hardening_level]} (Level {selected.rad_hardening_level})</p></div>
              <div><p className="text-xs text-gray-500">Status</p><p className="text-white capitalize">{selected.status}</p></div>
              <div><p className="text-xs text-gray-500">First Launch</p><p className="text-white">{selected.first_launch ? new Date(selected.first_launch).toLocaleDateString() : 'N/A'}</p></div>
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
            <h2 className="text-lg font-bold text-white mb-4">{editing ? 'Edit Chip' : 'Add Chip'}</h2>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Chip Name"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <input value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} placeholder="Manufacturer"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.process_node_nm} onChange={e => setForm({ ...form, process_node_nm: parseInt(e.target.value) })} placeholder="Process Node (nm)"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" value={form.tdp_watts} onChange={e => setForm({ ...form, tdp_watts: parseFloat(e.target.value) })} placeholder="TDP (W)"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" value={form.mass_grams} onChange={e => setForm({ ...form, mass_grams: parseFloat(e.target.value) })} placeholder="Mass (g)"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" min="0" max="3" value={form.rad_hardening_level} onChange={e => setForm({ ...form, rad_hardening_level: parseInt(e.target.value) })} placeholder="Rad Level (0-3)"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" value={form.operating_temp_min} onChange={e => setForm({ ...form, operating_temp_min: parseInt(e.target.value) })} placeholder="Min Temp (°C)"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" value={form.operating_temp_max} onChange={e => setForm({ ...form, operating_temp_max: parseInt(e.target.value) })} placeholder="Max Temp (°C)"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" value={form.ops_per_second} onChange={e => setForm({ ...form, ops_per_second: parseInt(e.target.value) })} placeholder="Ops/sec"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                  {['active', 'legacy', 'eol', 'development'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <input type="date" value={form.first_launch} onChange={e => setForm({ ...form, first_launch: e.target.value })} placeholder="First Launch"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
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
