import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { apiFetch } from '../api';

interface Category {
  category: string;
  sample_size: number;
  mtbf_hours: number;
  failure_rate_fit: number;
  reliability_pct: number;
}
interface ChartData {
  generated_at: string;
  categories: Category[];
  summary: { total_components: number; average_reliability_pct: number };
}

export default function ComponentReliabilityChart() {
  const [data, setData] = useState<ChartData | null>(null);
  const [err, setErr] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch('/custom-views/reliability-chart')
      .then((d: ChartData) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e: any) => { if (!cancelled) { setErr(e.message || 'error'); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const maxFit = data ? Math.max(...data.categories.map(c => c.failure_rate_fit), 1) : 1;

  return (
    <div data-testid="component-reliability-chart" className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-cyan-900/40 border border-cyan-700/40 flex items-center justify-center">
          <Activity size={18} className="text-cyan-400" />
        </div>
        <div>
          <div className="text-white font-semibold">Component Reliability Chart</div>
          <div className="text-xs text-gray-500">Failure rate (FIT) per component family</div>
        </div>
      </div>
      {loading && <div className="text-gray-500 text-sm">Loading reliability data...</div>}
      {err && <div className="text-red-400 text-sm">Error: {err}</div>}
      {data && (
        <>
          <div className="space-y-3">
            {data.categories.map(c => (
              <div key={c.category}>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span className="font-medium text-gray-200">{c.category}</span>
                  <span>{c.failure_rate_fit} FIT · MTBF {c.mtbf_hours.toLocaleString()}h · n={c.sample_size}</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
                    style={{ width: `${(c.failure_rate_fit / maxFit) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400 flex justify-between">
            <span>Total components: <span className="text-white">{data.summary.total_components}</span></span>
            <span>Average reliability: <span className="text-emerald-400">{data.summary.average_reliability_pct}%</span></span>
          </div>
        </>
      )}
    </div>
  );
}
