import { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, X, ExternalLink } from 'lucide-react';
import { apiFetch } from '../api';
import { ResearchPaper } from '../types';

const FOCUS_COLORS: Record<string, string> = {
  radiation_hardening: 'bg-purple-900/40 text-purple-400',
  thermal_management: 'bg-orange-900/40 text-orange-400',
  power_efficiency: 'bg-green-900/40 text-green-400',
  performance: 'bg-blue-900/40 text-blue-400',
  reliability: 'bg-yellow-900/40 text-yellow-400',
  materials: 'bg-cyan-900/40 text-cyan-400',
  packaging: 'bg-red-900/40 text-red-400',
};

export default function ResearchPage() {
  const [items, setItems] = useState<ResearchPaper[]>([]);
  const [search, setSearch] = useState('');
  const [focusFilter, setFocusFilter] = useState('');
  const [selected, setSelected] = useState<ResearchPaper | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ResearchPaper | null>(null);
  const [form, setForm] = useState({
    title: '', authors: '', focus_area: 'radiation_hardening', findings: '',
    published_date: '', citations: 0, journal: '', doi: '',
  });

  async function load() {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (focusFilter) p.set('focus_area', focusFilter);
    setItems(await apiFetch(`/research?${p}`));
  }

  useEffect(() => { load(); }, [search, focusFilter]);

  async function save() {
    if (editing) {
      await apiFetch(`/research/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
    } else {
      await apiFetch('/research', { method: 'POST', body: JSON.stringify(form) });
    }
    setShowForm(false); setEditing(null); load();
  }

  async function remove(id: number) {
    await apiFetch(`/research/${id}`, { method: 'DELETE' });
    setSelected(null); load();
  }

  function openEdit(p: ResearchPaper) {
    setEditing(p);
    setForm({
      title: p.title, authors: p.authors, focus_area: p.focus_area, findings: p.findings,
      published_date: p.published_date?.split('T')[0] || '', citations: p.citations, journal: p.journal, doi: p.doi,
    });
    setShowForm(true);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Research Papers</h1>
        <button onClick={() => { setEditing(null); setForm({ title: '', authors: '', focus_area: 'radiation_hardening', findings: '', published_date: '', citations: 0, journal: '', doi: '' }); setShowForm(true); }}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Plus size={16} />Add Paper
        </button>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search papers..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm" />
        </div>
        <select value={focusFilter} onChange={e => setFocusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">All Focus Areas</option>
          {Object.keys(FOCUS_COLORS).map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
        </select>
      </div>
      <div className="grid gap-3">
        {items.map(item => (
          <div key={item.id} onClick={() => setSelected(item)}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-cyan-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={14} className="text-cyan-400" />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${FOCUS_COLORS[item.focus_area] || 'bg-gray-700 text-gray-300'}`}>{item.focus_area.replace(/_/g, ' ')}</span>
                  {item.published_date && <span className="text-xs text-gray-500">{new Date(item.published_date).getFullYear()}</span>}
                </div>
                <h3 className="font-semibold text-white text-sm leading-snug">{item.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{item.authors} • {item.journal}</p>
              </div>
              <div className="ml-4 text-right flex-shrink-0">
                <div className="text-lg font-bold text-cyan-400">{item.citations}</div>
                <div className="text-xs text-gray-500">citations</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-y-0 right-0 w-[480px] bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Paper Detail</h2>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Title</p>
              <p className="text-white font-medium leading-snug">{selected.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-500">Authors</p><p className="text-white text-xs">{selected.authors}</p></div>
              <div><p className="text-xs text-gray-500">Journal</p><p className="text-white text-xs">{selected.journal}</p></div>
              <div><p className="text-xs text-gray-500">Focus Area</p><p className={`text-xs ${FOCUS_COLORS[selected.focus_area]?.split(' ')[1] || 'text-gray-300'}`}>{selected.focus_area.replace(/_/g, ' ')}</p></div>
              <div><p className="text-xs text-gray-500">Citations</p><p className="text-cyan-400 font-bold">{selected.citations}</p></div>
              <div><p className="text-xs text-gray-500">Published</p><p className="text-white">{selected.published_date ? new Date(selected.published_date).toLocaleDateString() : 'N/A'}</p></div>
              {selected.doi && <div><p className="text-xs text-gray-500">DOI</p><a href={`https://doi.org/${selected.doi}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-xs flex items-center gap-1">{selected.doi}<ExternalLink size={10} /></a></div>}
            </div>
            {selected.findings && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Key Findings</p>
                <p className="text-gray-300 text-sm leading-relaxed">{selected.findings}</p>
              </div>
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
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">{editing ? 'Edit Paper' : 'Add Research Paper'}</h2>
            <div className="space-y-3">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <input value={form.authors} onChange={e => setForm({ ...form, authors: e.target.value })} placeholder="Authors"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.focus_area} onChange={e => setForm({ ...form, focus_area: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                  {Object.keys(FOCUS_COLORS).map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
                </select>
                <input type="number" value={form.citations} onChange={e => setForm({ ...form, citations: parseInt(e.target.value) })} placeholder="Citations"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input value={form.journal} onChange={e => setForm({ ...form, journal: e.target.value })} placeholder="Journal"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="date" value={form.published_date} onChange={e => setForm({ ...form, published_date: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
              <input value={form.doi} onChange={e => setForm({ ...form, doi: e.target.value })} placeholder="DOI"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
              <textarea value={form.findings} onChange={e => setForm({ ...form, findings: e.target.value })} placeholder="Key findings"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" rows={3} />
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
