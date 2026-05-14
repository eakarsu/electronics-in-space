import { useState, useEffect } from 'react';
import { Plus, Search, Factory, X, Globe } from 'lucide-react';
import { apiFetch } from '../api';
import { Manufacturer } from '../types';

export default function ManufacturersPage() {
  const [items, setItems] = useState<Manufacturer[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Manufacturer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Manufacturer | null>(null);
  const [form, setForm] = useState({
    name: '', country: '', specialization: '', certifications: '', founded_year: 2000, website: '',
  });

  async function load() {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    setItems(await apiFetch(`/manufacturers?${p}`));
  }

  useEffect(() => { load(); }, [search]);

  async function save() {
    if (editing) {
      await apiFetch(`/manufacturers/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
    } else {
      await apiFetch('/manufacturers', { method: 'POST', body: JSON.stringify(form) });
    }
    setShowForm(false); setEditing(null); load();
  }

  async function remove(id: number) {
    await apiFetch(`/manufacturers/${id}`, { method: 'DELETE' });
    setSelected(null); load();
  }

  function openEdit(m: Manufacturer) {
    setEditing(m);
    setForm({ name: m.name, country: m.country, specialization: m.specialization, certifications: m.certifications, founded_year: m.founded_year, website: m.website });
    setShowForm(true);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Manufacturers</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', country: '', specialization: '', certifications: '', founded_year: 2000, website: '' }); setShowForm(true); }}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Plus size={16} />Add Manufacturer
        </button>
      </div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search manufacturers..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm" />
      </div>
      <div className="grid gap-3">
        {items.map(item => (
          <div key={item.id} onClick={() => setSelected(item)}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-cyan-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Factory size={14} className="text-cyan-400" />
                  <span className="text-xs text-gray-500">{item.country} • est. {item.founded_year}</span>
                </div>
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{item.specialization}</p>
                {item.certifications && (
                  <p className="text-xs text-cyan-600 mt-1">{item.certifications}</p>
                )}
              </div>
              <div className="ml-4 text-right">
                <div className="text-lg font-bold text-cyan-400">{item.chip_count}</div>
                <div className="text-xs text-gray-500">chips</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Manufacturer Detail</h2>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-500">Name</p><p className="text-white font-medium">{selected.name}</p></div>
              <div><p className="text-xs text-gray-500">Country</p><p className="text-white">{selected.country}</p></div>
              <div className="col-span-2"><p className="text-xs text-gray-500">Specialization</p><p className="text-white">{selected.specialization}</p></div>
              <div className="col-span-2"><p className="text-xs text-gray-500">Certifications</p><p className="text-cyan-400">{selected.certifications || 'None listed'}</p></div>
              <div><p className="text-xs text-gray-500">Founded</p><p className="text-white">{selected.founded_year}</p></div>
              <div><p className="text-xs text-gray-500">Chip Count</p><p className="text-cyan-400 font-bold">{selected.chip_count}</p></div>
            </div>
            {selected.website && (
              <a href={selected.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
                <Globe size={14} />{selected.website}
              </a>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={() => openEdit(selected)} className="flex-1 bg-cyan-700 hover:bg-cyan-600 text-white py-2 rounded-lg text-sm font-medium">Edit</button>
              <button onClick={() => remove(selected.id)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-4">{editing ? 'Edit Manufacturer' : 'Add Manufacturer'}</h2>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Company Name"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Country"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" value={form.founded_year} onChange={e => setForm({ ...form, founded_year: parseInt(e.target.value) })} placeholder="Founded Year"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
              <input value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="Specialization"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <input value={form.certifications} onChange={e => setForm({ ...form, certifications: e.target.value })} placeholder="Certifications (MIL-STD, DO-254...)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="Website URL"
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
