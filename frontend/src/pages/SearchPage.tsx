import { useState } from 'react';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { apiFetch } from '../api';

interface SearchResults {
  q: string;
  filters: Record<string, string | null>;
  results: Record<string, any[] | { error: string }>;
}

const RESOURCES = ['chips', 'missions', 'deployments', 'tests', 'manufacturers', 'research'];

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [missionType, setMissionType] = useState('');
  const [radiationLevel, setRadiationLevel] = useState('');
  const [resources, setResources] = useState<string[]>(RESOURCES);
  const [data, setData] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggle(name: string) {
    setResources((r) => r.includes(name) ? r.filter(x => x !== name) : [...r, name]);
  }

  async function run() {
    setLoading(true); setError('');
    try {
      const p = new URLSearchParams();
      if (q) p.set('q', q);
      if (status) p.set('status', status);
      if (manufacturer) p.set('manufacturer', manufacturer);
      if (missionType) p.set('mission_type', missionType);
      if (radiationLevel) p.set('radiation_level', radiationLevel);
      if (resources.length) p.set('resources', resources.join(','));
      const res = await apiFetch(`/search?${p}`);
      setData(res);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <SearchIcon size={22} className="text-cyan-400" />
        <h1 className="text-2xl font-bold text-white">Search & Filter</h1>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3 text-gray-400 text-xs uppercase tracking-wider">
          <Filter size={14} /> Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Free text query"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
          <input value={status} onChange={e => setStatus(e.target.value)} placeholder="status (e.g. active)"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
          <input value={manufacturer} onChange={e => setManufacturer(e.target.value)} placeholder="manufacturer"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
          <input value={missionType} onChange={e => setMissionType(e.target.value)} placeholder="mission type"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
          <input value={radiationLevel} onChange={e => setRadiationLevel(e.target.value)} placeholder="radiation level"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
        </div>
        <div className="flex items-center flex-wrap gap-2 mb-3">
          {RESOURCES.map(r => (
            <button key={r} onClick={() => toggle(r)}
              className={`px-3 py-1 rounded-full text-xs border ${resources.includes(r) ? 'bg-cyan-900/40 text-cyan-300 border-cyan-700/40' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>
              {r}
            </button>
          ))}
        </div>
        <button onClick={run} disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium">
          {loading ? 'Searching...' : 'Search'}
        </button>
        {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
      </div>

      {data && (
        <div className="space-y-4">
          {Object.entries(data.results).map(([name, rows]) => (
            <div key={name} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-white capitalize">{name}</h2>
                <span className="text-xs text-gray-500">
                  {Array.isArray(rows) ? `${rows.length} match${rows.length === 1 ? '' : 'es'}` : 'error'}
                </span>
              </div>
              {Array.isArray(rows) ? (
                rows.length === 0 ? (
                  <div className="text-xs text-gray-600">No matches</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-500 border-b border-gray-800">
                          {Object.keys(rows[0]).map(k => <th key={k} className="text-left py-1 pr-3 font-medium">{k}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 25).map((row: any, i: number) => (
                          <tr key={i} className="border-b border-gray-800/50">
                            {Object.keys(rows[0]).map(k => (
                              <td key={k} className="py-1 pr-3 text-gray-300">{row[k] === null || row[k] === undefined ? '' : String(row[k])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="text-xs text-red-400">{(rows as any).error}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
