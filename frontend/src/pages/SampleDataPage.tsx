import { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Loader2, Cpu, Rocket, Link2, FlaskConical, Factory, BookOpen } from 'lucide-react';
import { apiFetch } from '../api';

type Entity = 'manufacturers' | 'chips' | 'missions' | 'deployments' | 'tests' | 'research';

const ENTITIES: { key: Entity; label: string; icon: any; description: string; color: string }[] = [
  { key: 'manufacturers', label: 'Manufacturers', icon: Factory,       description: 'Texas Instruments, BAE Systems, Honeywell, Microchip, ST, Cobham, Infineon, Renesas',         color: 'cyan' },
  { key: 'chips',         label: 'Chips',         icon: Cpu,           description: 'Rad-hard parts: RAD750, RAD5545, LEON3FT, RTG4 FPGA, MSP430-SP, PolarFire SoC',              color: 'cyan' },
  { key: 'missions',      label: 'Missions',      icon: Rocket,        description: 'JWST, Artemis II/III, Europa Clipper, Starlink Gen2, GOES-U, Mars Sample Return, PACE',     color: 'violet' },
  { key: 'deployments',   label: 'Deployments',   icon: Link2,         description: 'Pairs chips to missions with telemetry samples (perf, SEU, thermal, power)',                'color': 'cyan' },
  { key: 'tests',         label: 'Tests',         icon: FlaskConical,  description: 'TID, SEU, SEL, TVAC, vibration, EMI/EMC, proton, burn-in across NASA GSFC, JPL, TAMU, LBNL', color: 'cyan' },
  { key: 'research',      label: 'Research Papers', icon: BookOpen,    description: 'IEEE TNS, Acta Astronautica, ACM TECS, IEEE Aerospace, JSR — radiation & flight heritage',  color: 'cyan' },
];

type Toast = { kind: 'success' | 'error'; text: string } | null;

export default function SampleDataPage() {
  const [busy, setBusy] = useState<Entity | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  async function seed(entity: Entity) {
    setBusy(entity);
    setToast(null);
    try {
      const r = await apiFetch(`/admin/sample-data/${entity}`, { method: 'POST' });
      const inserted = r?.inserted ?? 0;
      setCounts(prev => ({ ...prev, [entity]: (prev[entity] || 0) + inserted }));
      setToast({ kind: 'success', text: `Inserted ${inserted} ${entity} row(s).` });
    } catch (err: any) {
      setToast({ kind: 'error', text: err?.message || 'Insert failed' });
    } finally {
      setBusy(null);
      setTimeout(() => setToast(null), 4000);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center">
          <Database size={18} className="text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Sample Data</h1>
      </div>
      <p className="text-sm text-gray-400 mb-6 max-w-2xl">
        Populate each table with 5–10 realistic rows for demos and screenshots. Buttons are idempotent only in the sense
        that they keep appending — clicking twice doubles the rows. Insert manufacturers/chips/missions before deployments and tests.
      </p>

      <div className="grid gap-3 md:grid-cols-2 max-w-4xl">
        {ENTITIES.map(({ key, label, icon: Icon, description }) => {
          const isBusy = busy === key;
          const total = counts[key] || 0;
          return (
            <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center mt-0.5">
                <Icon size={16} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-white text-sm">{label}</h3>
                  {total > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400">
                      +{total} this session
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-3">{description}</p>
                <button
                  onClick={() => seed(key)}
                  disabled={isBusy}
                  className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium"
                >
                  {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                  {isBusy ? 'Inserting…' : `Insert ${label}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-2xl border text-sm ${
              toast.kind === 'success'
                ? 'bg-emerald-900/80 border-emerald-700 text-emerald-100'
                : 'bg-red-900/80 border-red-700 text-red-100'
            }`}
          >
            {toast.kind === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}
