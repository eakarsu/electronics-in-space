import { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';

interface Props {
  content: string;
  loading: boolean;
}

export default function AIResponse({ content, loading }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!loading && !content) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-900/60 to-indigo-900/60 border border-violet-700/40 p-5 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-violet-400" />
          <span className="text-sm font-semibold text-violet-300">AI Analysis</span>
        </div>
        {!loading && content && (
          <button onClick={copy} className="text-gray-400 hover:text-white transition-colors">
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-3 bg-violet-800/40 rounded animate-pulse`} style={{ width: `${90 - i * 10}%` }} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {content.split('\n').map((line, i) =>
            line.trim() ? (
              <p key={i} className={`text-sm ${line.startsWith('#') ? 'text-violet-300 font-semibold text-base' : line.startsWith('-') || line.startsWith('•') ? 'text-gray-300 ml-3' : 'text-gray-200'}`}>
                {line.replace(/^#+\s*/, '')}
              </p>
            ) : <div key={i} className="h-1" />
          )}
        </div>
      )}
    </div>
  );
}
