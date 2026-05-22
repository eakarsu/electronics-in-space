import { useEffect, useState } from 'react';
import { ClipboardCheck, Plus, Trash2, Save } from 'lucide-react';
import { apiFetch } from '../api';

interface Rule {
  id: number;
  standard: string;
  method: string;
  description: string;
  threshold_krad: number;
  mandatory: boolean;
}

const blankForm = { standard: '', method: '', description: '', threshold_krad: 0, mandatory: false };

export default function QualificationRulesEditor() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [form, setForm] = useState<typeof blankForm>(blankForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<typeof blankForm>(blankForm);
  const [err, setErr] = useState<string>('');
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const d = await apiFetch('/custom-views/qualification-rules');
      setRules(d.rules || []);
      setErr('');
    } catch (e: any) { setErr(e.message || 'load failed'); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form.standard || !form.method) { setErr('standard and method required'); return; }
    setBusy(true);
    try {
      await apiFetch('/custom-views/qualification-rules', { method: 'POST', body: JSON.stringify(form) });
      setForm(blankForm);
      await load();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  async function remove(id: number) {
    setBusy(true);
    try {
      await apiFetch(`/custom-views/qualification-rules/${id}`, { method: 'DELETE' });
      await load();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  function beginEdit(r: Rule) {
    setEditingId(r.id);
    setEditForm({ standard: r.standard, method: r.method, description: r.description, threshold_krad: r.threshold_krad, mandatory: r.mandatory });
  }

  async function saveEdit() {
    if (editingId == null) return;
    setBusy(true);
    try {
      await apiFetch(`/custom-views/qualification-rules/${editingId}`, { method: 'PUT', body: JSON.stringify(editForm) });
      setEditingId(null);
      await load();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <div data-testid="qualification-rules-editor" className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-amber-900/40 border border-amber-700/40 flex items-center justify-center">
          <ClipboardCheck size={18} className="text-amber-400" />
        </div>
        <div>
          <div className="text-white font-semibold">Qualification Rules Editor</div>
          <div className="text-xs text-gray-500">CRUD test standards (MIL-STD / ESCC / JEDEC)</div>
        </div>
      </div>

      {err && <div className="bg-red-900/30 border border-red-700 text-red-400 text-xs p-2 rounded mb-3">{err}</div>}

      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
        <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
          placeholder="Standard" value={form.standard} onChange={e => setForm({ ...form, standard: e.target.value })} />
        <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
          placeholder="Method" value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} />
        <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white md:col-span-2"
          placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <button type="submit" disabled={busy}
          className="bg-amber-600 hover:bg-amber-700 text-white text-sm rounded px-3 py-1.5 flex items-center justify-center gap-1">
          <Plus size={14} /> Add Rule
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="text-left py-2 px-2">Standard</th>
              <th className="text-left py-2 px-2">Method</th>
              <th className="text-left py-2 px-2">Description</th>
              <th className="text-right py-2 px-2">krad</th>
              <th className="text-center py-2 px-2">Mandatory</th>
              <th className="text-right py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => editingId === r.id ? (
              <tr key={r.id} className="border-b border-gray-800/50 bg-gray-800/30">
                <td className="px-2 py-1"><input className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs text-white w-full"
                  value={editForm.standard} onChange={e => setEditForm({ ...editForm, standard: e.target.value })} /></td>
                <td className="px-2 py-1"><input className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs text-white w-full"
                  value={editForm.method} onChange={e => setEditForm({ ...editForm, method: e.target.value })} /></td>
                <td className="px-2 py-1"><input className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs text-white w-full"
                  value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} /></td>
                <td className="px-2 py-1"><input type="number" className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs text-white w-16 text-right"
                  value={editForm.threshold_krad} onChange={e => setEditForm({ ...editForm, threshold_krad: +e.target.value })} /></td>
                <td className="px-2 py-1 text-center"><input type="checkbox" checked={editForm.mandatory}
                  onChange={e => setEditForm({ ...editForm, mandatory: e.target.checked })} /></td>
                <td className="px-2 py-1 text-right">
                  <button onClick={saveEdit} className="text-emerald-400 hover:text-emerald-300 mr-2"><Save size={14} /></button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-white text-xs">cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="px-2 py-1.5 text-gray-200 font-medium">{r.standard}</td>
                <td className="px-2 py-1.5 text-gray-300">{r.method}</td>
                <td className="px-2 py-1.5 text-gray-400">{r.description}</td>
                <td className="px-2 py-1.5 text-right text-gray-300">{r.threshold_krad}</td>
                <td className="px-2 py-1.5 text-center">
                  {r.mandatory
                    ? <span className="text-rose-400">YES</span>
                    : <span className="text-gray-500">no</span>}
                </td>
                <td className="px-2 py-1.5 text-right">
                  <button onClick={() => beginEdit(r)} className="text-cyan-400 hover:text-cyan-300 text-xs mr-3">edit</button>
                  <button onClick={() => remove(r.id)} className="text-rose-400 hover:text-rose-300"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {!rules.length && (
              <tr><td colSpan={6} className="py-4 text-center text-gray-500">No qualification rules yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
