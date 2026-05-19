import { useEffect, useState } from 'react';
import { Scale, Zap, ShieldCheck, AlertTriangle, X } from 'lucide-react';
import { apiFetch } from '../api';

interface Budget {
  id: number; mission_id: number; mission_name?: string;
  subsystem: string; mass_allocated_g: number; mass_used_g: number;
  power_avg_allocated_w: number; power_avg_used_w: number; power_peak_w: number;
  derate_factor: number; margin_required_pct: number; chip_id: number; chip_name?: string;
  notes: string; power_derated_w: number; mass_margin_pct: number;
  power_margin_pct: number; meets_mass_margin: boolean; meets_power_margin: boolean;
}
interface RollUp {
  mission: { id: number; name: string; mission_type: string; orbit_km: number };
  subsystems: Budget[];
  totals: any;
}
interface Finding { subsystem: string; status: string; issues: string[]; }

export default function SubsystemBudgetsPage() {
  const [missions, setMissions] = useState<any[]>([]);
  const [missionId, setMissionId] = useState<string>('');
  const [rollup, setRollup] = useState<RollUp | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selected, setSelected] = useState<Budget | null>(null);
  const [consumeDeltaMass, setConsumeDeltaMass] = useState('');
  const [consumeDeltaPower, setConsumeDeltaPower] = useState('');

  useEffect(() => {
    apiFetch('/missions').then((m: any[]) => {
      setMissions(m);
      // default to first mission that has budgets via probing - just pick first.
      if (m.length) setMissionId(String(m[0].id));
    });
  }, []);
  useEffect(() => {
    if (!missionId) return;
    apiFetch(`/subsystem-budgets/mission/${missionId}`).then(setRollup).catch(() => setRollup(null));
    setFindings([]);
  }, [missionId]);

  async function validateMargins() {
    if (!missionId) return;
    const r = await apiFetch('/subsystem-budgets/validate-margins', { method: 'POST', body: JSON.stringify({ mission_id: Number(missionId) }) });
    setFindings(r.findings);
  }

  async function consume() {
    if (!selected) return;
    const r = await apiFetch(`/subsystem-budgets/${selected.id}/consume`, {
      method: 'POST',
      body: JSON.stringify({
        delta_mass_g: Number(consumeDeltaMass || 0),
        delta_power_w: Number(consumeDeltaPower || 0),
        note: `Recorded consumption: +${consumeDeltaMass||0}g, +${consumeDeltaPower||0}W`
      })
    });
    setSelected(r);
    setConsumeDeltaMass(''); setConsumeDeltaPower('');
    apiFetch(`/subsystem-budgets/mission/${missionId}`).then(setRollup);
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Scale className="text-cyan-400" size={22} />
        <div>
          <h1 className="text-2xl font-bold text-white">Mission Mass & Power Budgets</h1>
          <p className="text-xs text-gray-500">MIL-STD-1547 derating · NASA margin rules · per-subsystem allocation</p>
        </div>
      </div>

      <div className="flex gap-3 items-center mb-4">
        <select value={missionId} onChange={e => setMissionId(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
          {missions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <button onClick={validateMargins} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm">Validate Margins</button>
      </div>

      {rollup && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500">Total mass</p>
              <p className="text-xl font-bold text-white">{rollup.totals.mass_used_g} / {rollup.totals.mass_allocated_g} g</p>
              <p className="text-xs text-cyan-300">margin {rollup.totals.mass_margin_pct}%</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500">Avg power</p>
              <p className="text-xl font-bold text-white">{rollup.totals.power_used_w} / {rollup.totals.power_allocated_w} W</p>
              <p className="text-xs text-cyan-300">margin {rollup.totals.power_margin_pct}%</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500">Peak power</p>
              <p className="text-xl font-bold text-amber-400">{rollup.totals.power_peak_w} W</p>
              <p className="text-xs text-gray-500">derated {rollup.totals.power_derated_w.toFixed(1)} W</p>
            </div>
          </div>

          {findings.length > 0 && (
            <div className="bg-gray-900 border border-amber-700/40 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-amber-300 flex items-center gap-2 mb-2"><AlertTriangle size={14} />Margin Findings</p>
              {findings.map((f, i) => (
                <div key={i} className="text-xs mb-1">
                  <span className={f.status === 'pass' ? 'text-green-400' : 'text-red-400'}>{f.status.toUpperCase()}</span>
                  <span className="text-gray-300 mx-2">{f.subsystem}</span>
                  {f.issues.length > 0 && <span className="text-gray-500">- {f.issues.join('; ')}</span>}
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-3">
            {rollup.subsystems.map(s => (
              <div key={s.id} onClick={() => setSelected(s)} className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-cyan-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-white">{s.subsystem}</span>
                      {s.chip_name && <span className="text-xs text-cyan-300">{s.chip_name}</span>}
                      <span className="text-xs text-gray-500">derate {s.derate_factor}</span>
                      <span className="text-xs text-gray-500">req margin {s.margin_required_pct}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mt-2">
                      <div className="flex items-center gap-1"><Scale size={11} />Mass {s.mass_used_g}/{s.mass_allocated_g} g
                        <span className={s.meets_mass_margin ? 'text-green-400' : 'text-red-400'}>({s.mass_margin_pct}%)</span></div>
                      <div className="flex items-center gap-1"><Zap size={11} />Power {s.power_avg_used_w}/{s.power_avg_allocated_w} W
                        <span className={s.meets_power_margin ? 'text-green-400' : 'text-red-400'}>({s.power_margin_pct}%)</span></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <ShieldCheck size={20} className={s.meets_mass_margin && s.meets_power_margin ? 'text-green-400' : 'text-red-400'} />
                  </div>
                </div>
              </div>
            ))}
            {rollup.subsystems.length === 0 && <p className="text-gray-500 text-sm">No budgets defined for this mission.</p>}
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-y-0 right-0 w-[480px] bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">{selected.subsystem}</h2>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div><p className="text-xs text-gray-500">Mass alloc</p><p className="text-white">{selected.mass_allocated_g} g</p></div>
            <div><p className="text-xs text-gray-500">Mass used</p><p className="text-white">{selected.mass_used_g} g</p></div>
            <div><p className="text-xs text-gray-500">Power alloc</p><p className="text-white">{selected.power_avg_allocated_w} W</p></div>
            <div><p className="text-xs text-gray-500">Power used</p><p className="text-white">{selected.power_avg_used_w} W</p></div>
            <div><p className="text-xs text-gray-500">Peak power</p><p className="text-amber-400">{selected.power_peak_w} W</p></div>
            <div><p className="text-xs text-gray-500">Power derated</p><p className="text-white">{selected.power_derated_w} W</p></div>
            <div><p className="text-xs text-gray-500">Mass margin</p><p className={selected.meets_mass_margin ? 'text-green-400' : 'text-red-400'}>{selected.mass_margin_pct}%</p></div>
            <div><p className="text-xs text-gray-500">Power margin</p><p className={selected.meets_power_margin ? 'text-green-400' : 'text-red-400'}>{selected.power_margin_pct}%</p></div>
          </div>
          <p className="text-xs text-gray-400 italic mb-4 whitespace-pre-wrap">{selected.notes}</p>
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Consume (record actual usage)</h3>
          <div className="space-y-2">
            <input value={consumeDeltaMass} onChange={e => setConsumeDeltaMass(e.target.value)} placeholder="+grams"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            <input value={consumeDeltaPower} onChange={e => setConsumeDeltaPower(e.target.value)} placeholder="+watts"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
            <button onClick={consume} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg text-sm">Record Consumption</button>
          </div>
        </div>
      )}
    </div>
  );
}
