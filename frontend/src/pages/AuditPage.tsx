import { useEffect, useState } from 'react';
import { ScrollText, RefreshCw } from 'lucide-react';
import { apiFetch } from '../api';

interface AuditEntry {
  id: number;
  user_id: number | null;
  user_email: string | null;
  action: string;
  details: any;
  ip: string | null;
  created_at: string;
}

interface ActionCount { action: string; count: number; }

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [actions, setActions] = useState<ActionCount[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const p = new URLSearchParams();
      if (search) p.set('search', search);
      if (actionFilter) p.set('action', actionFilter);
      const [list, byAction] = await Promise.all([
        apiFetch(`/audit?${p}`),
        apiFetch('/audit/actions'),
      ]);
      setEntries(list);
      setActions(byAction);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ScrollText size={22} className="text-yellow-400" />
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        </div>
        <button onClick={load} disabled={loading}
          className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search action / user / details"
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">All actions</option>
          {actions.map(a => <option key={a.action} value={a.action}>{a.action} ({a.count})</option>)}
        </select>
        <button onClick={load} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Apply</button>
      </div>

      {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-950">
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-2 px-3 font-medium">Time</th>
              <th className="text-left py-2 px-3 font-medium">User</th>
              <th className="text-left py-2 px-3 font-medium">Action</th>
              <th className="text-left py-2 px-3 font-medium">IP</th>
              <th className="text-left py-2 px-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="border-b border-gray-800/50 hover:bg-gray-800/40">
                <td className="py-1.5 px-3 text-gray-400 whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</td>
                <td className="py-1.5 px-3 text-cyan-300">{e.user_email || '-'}</td>
                <td className="py-1.5 px-3 text-yellow-300 font-mono">{e.action}</td>
                <td className="py-1.5 px-3 text-gray-500">{e.ip || '-'}</td>
                <td className="py-1.5 px-3 text-gray-300 max-w-xl truncate">
                  {e.details ? (typeof e.details === 'string' ? e.details : JSON.stringify(e.details)) : ''}
                </td>
              </tr>
            ))}
            {!entries.length && !loading && (
              <tr><td colSpan={5} className="py-6 text-center text-gray-600">No audit entries yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
