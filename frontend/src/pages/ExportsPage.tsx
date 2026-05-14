import { useState } from 'react';
import { Download, FileText } from 'lucide-react';

const RESOURCES = [
  { name: 'chips', desc: 'Catalog of space-grade chips' },
  { name: 'missions', desc: 'Missions and orbital parameters' },
  { name: 'deployments', desc: 'Chip deployments per mission' },
  { name: 'tests', desc: 'Test results and failure modes' },
  { name: 'manufacturers', desc: 'Manufacturers and certifications' },
  { name: 'research', desc: 'Research papers' },
];

export default function ExportsPage() {
  const [busy, setBusy] = useState<string>('');
  const [error, setError] = useState('');

  async function download(resource: string) {
    setBusy(resource); setError('');
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`/api/exports/${resource}.csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(j.error || res.statusText);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resource}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) { setError(e.message); }
    finally { setBusy(''); }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText size={22} className="text-green-400" />
        <h1 className="text-2xl font-bold text-white">CSV Exports</h1>
      </div>
      <p className="text-sm text-gray-400 mb-6">Download any resource as a CSV file. Authenticated download.</p>
      {error && <div className="mb-4 text-sm text-red-400">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESOURCES.map(r => (
          <div key={r.name} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold capitalize mb-1">{r.name}</h3>
            <p className="text-xs text-gray-400 mb-4">{r.desc}</p>
            <button onClick={() => download(r.name)} disabled={busy === r.name}
              className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Download size={14} />
              {busy === r.name ? 'Downloading...' : 'Download CSV'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
