import { useEffect, useState } from 'react';
import { Globe, ChevronRight, X, Radiation, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../api';

interface Profile {
  id: number; profile_name: string; orbit_class: string;
  altitude_km: number; inclination_deg: number; eccentricity: number;
  trapped_proton_model: string; trapped_electron_model: string; gcr_model: string;
  solar_activity: string; annual_tid_krad: number; shield_thickness_mm_al: number;
  peak_let_mev_cm2_mg: number; notes: string;
}
interface CurvePt { id: number; shield_thickness_mm: number; cumulative_dose_year_krad: number; }

const CLASS_COLOR: Record<string, string> = {
  LEO: 'text-green-400', 'LEO-SSO': 'text-emerald-400', MEO: 'text-yellow-400',
  GEO: 'text-orange-400', HEO: 'text-red-400', lunar: 'text-blue-400',
  'lunar-surface': 'text-sky-400', 'deep-space': 'text-fuchsia-400',
  interplanetary: 'text-purple-400', L2: 'text-cyan-400',
};

export default function OrbitEnvironmentsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [curve, setCurve] = useState<CurvePt[]>([]);
  const [shieldMm, setShieldMm] = useState(2.54);
  const [doseAtShield, setDoseAtShield] = useState<any>(null);
  const [chips, setChips] = useState<{ id: number; name: string; rad_hardening_level: number }[]>([]);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [matchChip, setMatchChip] = useState('');
  const [missionYears, setMissionYears] = useState(2);

  useEffect(() => { apiFetch('/orbit-environments').then(setProfiles); }, []);
  useEffect(() => { apiFetch('/chips').then(setChips); }, []);

  async function openDetail(p: Profile) {
    setSelected(p);
    const d = await apiFetch(`/orbit-environments/${p.id}`);
    setCurve(d.curve);
    setDoseAtShield(null);
  }
  async function interp() {
    if (!selected) return;
    setDoseAtShield(await apiFetch(`/orbit-environments/${selected.id}/dose-at-shield?shield_mm=${shieldMm}`));
  }
  async function runMatch() {
    if (!matchChip) return;
    setMatchResult(await apiFetch('/orbit-environments/match-chip', {
      method: 'POST', body: JSON.stringify({ chip_id: Number(matchChip), mission_years: Number(missionYears) }),
    }));
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Globe className="text-cyan-400" size={22} />
        <div>
          <h1 className="text-2xl font-bold text-white">Orbit Environment Profiles</h1>
          <p className="text-xs text-gray-500">AP9 / AE9 / CREME96 / GIRE-2 - real space radiation models per orbit</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2"><Radiation size={14} className="text-cyan-400" />Chip ↔ Orbit Match</h3>
        <div className="flex gap-2 flex-wrap items-center">
          <select value={matchChip} onChange={e => setMatchChip(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
            <option value="">-- chip --</option>
            {chips.map(c => <option key={c.id} value={c.id}>{c.name} (RH {c.rad_hardening_level})</option>)}
          </select>
          <input type="number" min="0.1" step="0.1" value={missionYears} onChange={e => setMissionYears(parseFloat(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm w-32" placeholder="years" />
          <button onClick={runMatch} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm">Match</button>
        </div>
        {matchResult && (
          <div className="mt-3 space-y-1 max-h-60 overflow-y-auto">
            {matchResult.recommendations.map((m: any) => (
              <div key={m.profile_id} className="flex items-center gap-3 text-xs py-1 border-b border-gray-800">
                <span className="text-gray-300 flex-1">{m.profile_name}</span>
                <span className={CLASS_COLOR[m.orbit_class] || 'text-gray-400'}>{m.orbit_class}</span>
                <span className="text-gray-500">{m.mission_tid_krad.toFixed(1)} / {m.chip_tolerated_krad} krad</span>
                <span className={`px-2 py-0.5 rounded-full ${m.verdict === 'fail' ? 'bg-red-900/40 text-red-400' : m.verdict === 'marginal' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-green-900/40 text-green-400'}`}>{m.verdict}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {profiles.map(p => (
          <div key={p.id} onClick={() => openDetail(p)} className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-cyan-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-800 ${CLASS_COLOR[p.orbit_class] || 'text-gray-400'}`}>{p.orbit_class}</span>
                  <span className="text-xs text-gray-500">{p.altitude_km} km · {p.inclination_deg}°</span>
                </div>
                <h3 className="font-semibold text-white">{p.profile_name}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>TID/yr <span className="text-amber-400">{p.annual_tid_krad} krad</span></span>
                  <span>Shield {p.shield_thickness_mm_al} mm Al</span>
                  <span>Peak LET {p.peak_let_mev_cm2_mg}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-600" />
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-y-0 right-0 w-[560px] bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">{selected.profile_name}</h2>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div><p className="text-xs text-gray-500">Class</p><p className={CLASS_COLOR[selected.orbit_class]}>{selected.orbit_class}</p></div>
            <div><p className="text-xs text-gray-500">Altitude</p><p className="text-white">{selected.altitude_km} km</p></div>
            <div><p className="text-xs text-gray-500">Inclination</p><p className="text-white">{selected.inclination_deg}°</p></div>
            <div><p className="text-xs text-gray-500">Solar</p><p className="text-white">{selected.solar_activity}</p></div>
            <div><p className="text-xs text-gray-500">Proton model</p><p className="text-white text-xs">{selected.trapped_proton_model}</p></div>
            <div><p className="text-xs text-gray-500">Electron model</p><p className="text-white text-xs">{selected.trapped_electron_model}</p></div>
            <div><p className="text-xs text-gray-500">GCR model</p><p className="text-white text-xs">{selected.gcr_model}</p></div>
            <div><p className="text-xs text-gray-500">Annual TID</p><p className="text-amber-400">{selected.annual_tid_krad} krad</p></div>
          </div>
          <p className="text-xs text-gray-400 italic mb-4">{selected.notes}</p>

          <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2"><ShieldCheck size={14} />Shielding Dose Curve</h3>
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 mb-3">
            {curve.length > 0 ? (
              <table className="w-full text-xs">
                <thead><tr className="text-gray-500"><th className="text-left">Shield (mm Al)</th><th className="text-right">Dose/yr (krad)</th></tr></thead>
                <tbody>
                  {curve.map(c => (
                    <tr key={c.id} className="border-t border-gray-800">
                      <td className="py-1 text-gray-300">{c.shield_thickness_mm}</td>
                      <td className="py-1 text-right text-amber-400">{c.cumulative_dose_year_krad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-xs text-gray-500 italic">No curve points; using profile-default {selected.annual_tid_krad} krad/yr.</p>}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input type="number" step="0.1" min="0.1" value={shieldMm} onChange={e => setShieldMm(parseFloat(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm w-32" />
            <button onClick={interp} className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded-lg text-sm">Interp Dose</button>
          </div>
          {doseAtShield && (
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 text-xs text-gray-300">
              <p>At {doseAtShield.shield_mm} mm Al: <span className="text-amber-400">{doseAtShield.dose_year_krad?.toFixed(2)} krad/yr</span></p>
              <p className="text-gray-500">method: {doseAtShield.method}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
