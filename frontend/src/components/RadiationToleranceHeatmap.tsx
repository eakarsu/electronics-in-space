import { useEffect, useState } from 'react';
import { Radiation } from 'lucide-react';
import { apiFetch } from '../api';

interface Cell {
  orbit: string;
  family: string;
  tolerance_index: number;
  tid_krad: number;
  let_threshold: number;
}
interface HeatmapData {
  generated_at: string;
  orbits: string[];
  families: string[];
  cells: Cell[];
  legend: { low: string; mid: string; high: string };
}

function color(idx: number): string {
  if (idx >= 75) return 'bg-emerald-700/70 text-emerald-100';
  if (idx >= 55) return 'bg-amber-700/60 text-amber-100';
  if (idx >= 35) return 'bg-orange-700/60 text-orange-100';
  return 'bg-rose-800/70 text-rose-100';
}

export default function RadiationToleranceHeatmap() {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [err, setErr] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch('/custom-views/radiation-heatmap')
      .then((d: HeatmapData) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e: any) => { if (!cancelled) { setErr(e.message || 'error'); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  function findCell(o: string, f: string): Cell | undefined {
    return data?.cells.find(c => c.orbit === o && c.family === f);
  }

  return (
    <div data-testid="radiation-tolerance-heatmap" className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-violet-900/40 border border-violet-700/40 flex items-center justify-center">
          <Radiation size={18} className="text-violet-400" />
        </div>
        <div>
          <div className="text-white font-semibold">Radiation Tolerance Heatmap</div>
          <div className="text-xs text-gray-500">Orbit profile vs component family</div>
        </div>
      </div>
      {loading && <div className="text-gray-500 text-sm">Loading heatmap...</div>}
      {err && <div className="text-red-400 text-sm">Error: {err}</div>}
      {data && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-gray-400 font-medium px-2 py-2">Orbit \ Family</th>
                  {data.families.map(f => (
                    <th key={f} className="text-center text-gray-300 font-medium px-2 py-2">{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.orbits.map(o => (
                  <tr key={o}>
                    <td className="text-gray-300 font-medium px-2 py-1">{o}</td>
                    {data.families.map(f => {
                      const cell = findCell(o, f);
                      return (
                        <td key={f} className={`text-center px-2 py-1 rounded ${color(cell?.tolerance_index ?? 0)}`}
                            title={cell ? `TID ${cell.tid_krad} krad · LET ${cell.let_threshold}` : ''}>
                          {cell?.tolerance_index ?? '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400 flex gap-4">
            <span><span className="inline-block w-3 h-3 rounded-sm bg-rose-800 mr-1"></span>{data.legend.low}</span>
            <span><span className="inline-block w-3 h-3 rounded-sm bg-amber-700 mr-1"></span>{data.legend.mid}</span>
            <span><span className="inline-block w-3 h-3 rounded-sm bg-emerald-700 mr-1"></span>{data.legend.high}</span>
          </div>
        </>
      )}
    </div>
  );
}
