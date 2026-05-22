import { useState } from 'react';
import { FileDown } from 'lucide-react';

export default function SpecSheetPdf() {
  const [chipId, setChipId] = useState('');
  const [status, setStatus] = useState<string>('');

  async function download() {
    setStatus('Generating PDF...');
    try {
      const token = localStorage.getItem('token');
      const qs = chipId ? `?chip_id=${encodeURIComponent(chipId)}` : '';
      const resp = await fetch(`/api/custom-views/spec-sheet-pdf${qs}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spec-sheet-${chipId || 'sample'}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
      setStatus(`PDF generated (${blob.size} bytes)`);
    } catch (e: any) {
      setStatus(`Error: ${e.message || e}`);
    }
  }

  return (
    <div data-testid="spec-sheet-pdf" className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center">
          <FileDown size={18} className="text-emerald-400" />
        </div>
        <div>
          <div className="text-white font-semibold">Spec Sheet PDF Export</div>
          <div className="text-xs text-gray-500">Generate a downloadable PDF spec sheet for any chip</div>
        </div>
      </div>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Chip ID (optional)</label>
          <input
            type="text" value={chipId} onChange={e => setChipId(e.target.value)}
            placeholder="e.g. 1 (omit for sample)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-600"
          />
        </div>
        <button onClick={download}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
          Download PDF
        </button>
      </div>
      {status && <div className="mt-3 text-xs text-gray-400">{status}</div>}
    </div>
  );
}
