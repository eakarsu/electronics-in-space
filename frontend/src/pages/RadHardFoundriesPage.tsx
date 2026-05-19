import { useEffect, useState } from 'react';
import { Building2, Globe2, X, Cpu } from 'lucide-react';
import { apiFetch } from '../api';

interface Foundry {
  id: number; fab_name: string; operator: string; location: string; country: string;
  process_name: string; process_node_nm: number; rh_technique: string;
  tid_capability_krad: number; sel_let_threshold: number; itar_status: string;
  qml_certification: string; monthly_capacity_wafers: number; status: string;
  customers: string; notes: string; fit_score?: number;
}

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-900/40 text-green-400',
  legacy: 'bg-gray-700 text-gray-400',
  planned: 'bg-yellow-900/40 text-yellow-400',
};
const ITAR_COLOR: Record<string, string> = {
  ITAR: 'text-red-400', EAR: 'text-amber-400',
};

export default function RadHardFoundriesPage() {
  const [items, setItems] = useState<Foundry[]>([]);
  const [country, setCountry] = useState('');
  const [itar, setItar] = useState('');
  const [selected, setSelected] = useState<Foundry | null>(null);
  const [match, setMatch] = useState<{ recommendations: Foundry[] } | null>(null);
  const [matchForm, setMatchForm] = useState({ process_node_nm: '90', tid_target_krad: '100', sel_let_min: '50', itar_required: false });
  const [byCountry, setByCountry] = useState<any[]>([]);

  async function load() {
    const p = new URLSearchParams();
    if (country) p.set('country', country);
    if (itar)    p.set('itar_status', itar);
    setItems(await apiFetch(`/rad-hard-foundries?${p}`));
  }
  useEffect(() => { load(); }, [country, itar]);
  useEffect(() => { apiFetch('/rad-hard-foundries/summary/by-country').then(setByCountry); }, []);

  async function runMatch() {
    const r = await apiFetch('/rad-hard-foundries/match', {
      method: 'POST',
      body: JSON.stringify({
        process_node_nm: Number(matchForm.process_node_nm) || null,
        tid_target_krad: Number(matchForm.tid_target_krad) || null,
        sel_let_min:     Number(matchForm.sel_let_min)     || null,
        itar_required:   matchForm.itar_required
      })
    });
    setMatch(r);
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Building2 className="text-cyan-400" size={22} />
        <div>
          <h1 className="text-2xl font-bold text-white">Rad-Hard Foundry Registry</h1>
          <p className="text-xs text-gray-500">Trusted Foundries · BAE Manassas · GF · SkyWater · ST Crolles · Tower · TSMC</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2"><Cpu size={14} />Match Foundry to Chip Target</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input placeholder="node nm" value={matchForm.process_node_nm} onChange={e => setMatchForm({ ...matchForm, process_node_nm: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            <input placeholder="TID target krad" value={matchForm.tid_target_krad} onChange={e => setMatchForm({ ...matchForm, tid_target_krad: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            <input placeholder="SEL LET min" value={matchForm.sel_let_min} onChange={e => setMatchForm({ ...matchForm, sel_let_min: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            <label className="flex items-center gap-2 text-xs text-gray-300">
              <input type="checkbox" checked={matchForm.itar_required} onChange={e => setMatchForm({ ...matchForm, itar_required: e.target.checked })} />
              ITAR required
            </label>
          </div>
          <button onClick={runMatch} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm w-full">Find Foundries</button>
          {match && (
            <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
              {match.recommendations.map(r => (
                <div key={r.id} className="flex items-center gap-2 text-xs py-1 border-b border-gray-800">
                  <span className="text-gray-300 flex-1">{r.fab_name}</span>
                  <span className="text-gray-500">{r.process_node_nm}nm</span>
                  <span className="text-cyan-300">fit {r.fit_score}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2"><Globe2 size={14} />Capacity by country</p>
          {byCountry.map(c => (
            <div key={c.country} className="flex items-center gap-2 text-xs py-1 border-b border-gray-800">
              <span className="text-gray-300 flex-1">{c.country}</span>
              <span className="text-gray-500">{c.foundry_count} fabs</span>
              <span className="text-cyan-300">{c.total_capacity_wafers?.toLocaleString() || 0} wpm</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-3 text-xs flex-wrap">
        <select value={country} onChange={e => setCountry(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">all countries</option><option>USA</option><option>France</option><option>Sweden</option><option>USA/Israel</option><option>Taiwan</option>
        </select>
        <select value={itar} onChange={e => setItar(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">all export status</option><option>ITAR</option><option>EAR</option><option>EAR/ESA-QPL</option>
        </select>
      </div>

      <div className="grid gap-3">
        {items.map(f => (
          <div key={f.id} onClick={() => setSelected(f)} className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-cyan-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs text-gray-500">{f.location} · {f.country}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[f.status] || 'bg-gray-700 text-gray-400'}`}>{f.status}</span>
                  <span className={`text-xs font-bold ${ITAR_COLOR[f.itar_status?.split('/')[0]] || 'text-gray-400'}`}>{f.itar_status}</span>
                </div>
                <h3 className="font-semibold text-white">{f.fab_name}</h3>
                <p className="text-xs text-gray-400 mt-1">{f.process_name} · {f.rh_technique}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                  <span>TID <span className="text-amber-400">{f.tid_capability_krad} krad</span></span>
                  <span>SEL_LET <span className="text-red-300">{f.sel_let_threshold}</span></span>
                  <span>{f.monthly_capacity_wafers?.toLocaleString() || '?'} wpm</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-y-0 right-0 w-[480px] bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">{selected.fab_name}</h2>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div><p className="text-xs text-gray-500">Operator</p><p className="text-white">{selected.operator}</p></div>
            <div><p className="text-xs text-gray-500">Location</p><p className="text-white">{selected.location}</p></div>
            <div><p className="text-xs text-gray-500">Country</p><p className="text-white">{selected.country}</p></div>
            <div><p className="text-xs text-gray-500">Export status</p><p className={ITAR_COLOR[selected.itar_status?.split('/')[0]]}>{selected.itar_status}</p></div>
            <div><p className="text-xs text-gray-500">Process</p><p className="text-white text-xs">{selected.process_name}</p></div>
            <div><p className="text-xs text-gray-500">Node</p><p className="text-white">{selected.process_node_nm} nm</p></div>
            <div><p className="text-xs text-gray-500">RH technique</p><p className="text-cyan-300">{selected.rh_technique}</p></div>
            <div><p className="text-xs text-gray-500">QML</p><p className="text-white text-xs">{selected.qml_certification}</p></div>
            <div><p className="text-xs text-gray-500">TID cap</p><p className="text-amber-400">{selected.tid_capability_krad} krad</p></div>
            <div><p className="text-xs text-gray-500">SEL LET</p><p className="text-red-300">{selected.sel_let_threshold}</p></div>
            <div><p className="text-xs text-gray-500">Capacity</p><p className="text-white">{selected.monthly_capacity_wafers?.toLocaleString() || '?'} wpm</p></div>
            <div><p className="text-xs text-gray-500">Status</p><p className="text-white">{selected.status}</p></div>
          </div>
          <div className="mb-3">
            <p className="text-xs text-gray-500">Customers</p>
            <p className="text-sm text-gray-300">{selected.customers}</p>
          </div>
          <p className="text-xs text-gray-400 italic">{selected.notes}</p>
        </div>
      )}
    </div>
  );
}
