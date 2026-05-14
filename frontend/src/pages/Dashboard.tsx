import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu, Rocket, Link2, FlaskConical, Factory, Sparkles, Database, ScrollText, Shield,
} from 'lucide-react';
import { apiFetch } from '../api';

interface AuditRow {
  id: number;
  user_email: string | null;
  action: string;
  details: any;
  created_at: string;
}

interface Stats {
  kpis: {
    chips_rad_hard: number;
    chips_total: number;
    missions_tracked: number;
    missions_active: number;
    deployments_active: number;
    tests_in_progress: number;
    manufacturers: number;
  };
  recent_activity: AuditRow[];
}

const KPI_DEFS: Array<{
  key: keyof Stats['kpis'];
  label: string;
  sub?: keyof Stats['kpis'];
  subLabel?: string;
  icon: any;
  color: string;
  border: string;
}> = [
  { key: 'chips_rad_hard', sub: 'chips_total', subLabel: 'of total chips', label: 'Rad-Hard Chips Catalogued', icon: Shield, color: 'text-cyan-400', border: 'border-cyan-800/40 bg-cyan-900/10' },
  { key: 'missions_tracked', sub: 'missions_active', subLabel: 'active missions', label: 'Missions Tracked', icon: Rocket, color: 'text-violet-400', border: 'border-violet-800/40 bg-violet-900/10' },
  { key: 'deployments_active', label: 'Active Chip Deployments', icon: Link2, color: 'text-emerald-400', border: 'border-emerald-800/40 bg-emerald-900/10' },
  { key: 'tests_in_progress', label: 'Tests In Progress', icon: FlaskConical, color: 'text-amber-400', border: 'border-amber-800/40 bg-amber-900/10' },
  { key: 'manufacturers', label: 'Manufacturers', icon: Factory, color: 'text-sky-400', border: 'border-sky-800/40 bg-sky-900/10' },
];

const QUICK_ACTIONS = [
  { to: '/ai', icon: Sparkles, label: 'AI Center', desc: 'Run radiation, BOM, and mission tools', color: 'text-violet-400 border-violet-800/40 hover:border-violet-600' },
  { to: '/chips', icon: Cpu, label: 'Chips', desc: 'Browse the rad-hard parts catalog', color: 'text-cyan-400 border-cyan-800/40 hover:border-cyan-600' },
  { to: '/missions', icon: Rocket, label: 'Missions', desc: 'Track upcoming and active missions', color: 'text-emerald-400 border-emerald-800/40 hover:border-emerald-600' },
  { to: '/sample-data', icon: Database, label: 'Sample Data', desc: 'Seed realistic data into the workspace', color: 'text-sky-400 border-sky-800/40 hover:border-sky-600' },
];

function formatDetails(d: any): string {
  if (!d) return '';
  if (typeof d === 'string') return d.length > 80 ? d.slice(0, 80) + '…' : d;
  try {
    const s = JSON.stringify(d);
    return s.length > 80 ? s.slice(0, 80) + '…' : s;
  } catch {
    return '';
  }
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const s = Math.max(1, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiFetch('/dashboard/stats')
      .then((data) => { if (active) { setStats(data); setError(null); } })
      .catch((e) => { if (active) setError(e.message || 'Failed to load'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Mission Control</h1>
        <p className="text-sm text-gray-400 mt-1">SpaceLab dashboard — rad-hard electronics, missions, deployments, and tests at a glance.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {KPI_DEFS.map(({ key, sub, subLabel, label, icon: Icon, color, border }) => {
          const value = stats?.kpis?.[key] ?? (loading ? null : 0);
          const subVal = sub ? stats?.kpis?.[sub] : undefined;
          return (
            <div key={key} className={`rounded-xl border ${border} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <Icon size={18} className={color} />
                <span className="text-[10px] uppercase tracking-wider text-gray-500">KPI</span>
              </div>
              <div className={`text-3xl font-bold ${color}`}>
                {value === null ? '—' : value.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">{label}</div>
              {sub !== undefined && subVal !== undefined && (
                <div className="text-[11px] text-gray-500 mt-1">{subVal.toLocaleString()} {subLabel}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-2">
            <ScrollText size={16} className="text-gray-400" />
            <h2 className="font-semibold text-white text-sm">Recent Activity</h2>
            <Link to="/audit" className="ml-auto text-xs text-cyan-400 hover:text-cyan-300">View audit log →</Link>
          </div>
          <div className="divide-y divide-gray-800">
            {loading && (
              <div className="px-5 py-4 text-sm text-gray-500">Loading…</div>
            )}
            {!loading && (!stats?.recent_activity || stats.recent_activity.length === 0) && (
              <div className="px-5 py-6 text-sm text-gray-500">
                No recent activity yet. Actions on chips, missions, and tests will appear here.
              </div>
            )}
            {stats?.recent_activity?.map((row) => (
              <div key={row.id} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-800/40">
                <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white font-medium truncate">{row.action}</span>
                    <span className="text-xs text-gray-500 truncate">{row.user_email || 'system'}</span>
                  </div>
                  {row.details && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{formatDetails(row.details)}</div>
                  )}
                </div>
                <div className="text-xs text-gray-500 flex-shrink-0">{timeAgo(row.created_at)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-white text-sm uppercase tracking-wider text-gray-400 px-1">Quick Actions</h2>
          {QUICK_ACTIONS.map(({ to, icon: Icon, label, desc, color }) => (
            <Link
              key={to}
              to={to}
              className={`block rounded-xl border bg-gray-900 px-4 py-3 transition-colors ${color}`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
                <span className="text-gray-500">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
