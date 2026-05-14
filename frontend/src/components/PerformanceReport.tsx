import type { SimulationResult } from '../App'

interface Props {
  result: SimulationResult
}

function PassFail({ value }: { value: 'pass' | 'fail' }) {
  return value === 'pass'
    ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/50 text-green-400 border border-green-700/50 font-bold">PASS</span>
    : <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/50 text-red-400 border border-red-700/50 font-bold">FAIL</span>
}

function GaugeArc({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = Math.min(1, value / max)
  const circumference = 2 * Math.PI * 36
  const dash = pct * circumference * 0.75
  const gap = circumference - dash
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="96" height="72" viewBox="0 0 96 72">
          <circle cx="48" cy="60" r="36" fill="none" stroke="#1f2937" strokeWidth="8"
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            strokeDashoffset={circumference * 0.125}
            strokeLinecap="round" />
          <circle cx="48" cy="60" r="36" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={circumference * 0.125}
            strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="text-sm font-bold text-gray-200">{value.toFixed(2)}</span>
        </div>
      </div>
      <div className="text-xs text-gray-500 text-center">{label}</div>
    </div>
  )
}

function BarMetric({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-200 font-medium">{value}{unit}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  )
}

export default function PerformanceReport({ result }: Props) {
  const seuPass = result.seuErrorRate < 1.0
  const opsPass = result.inferenceOps >= 5

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-100">Performance Report</h2>
        <span className="text-sm text-blue-300 font-medium">{result.chip.name}</span>
      </div>

      {/* SEU Gauge */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-gray-300">SEU Error Rate</div>
          <PassFail value={seuPass ? 'pass' : 'fail'} />
        </div>
        <div className="flex items-center gap-6">
          <GaugeArc
            value={result.seuErrorRate}
            max={20}
            label="errors/day"
            color={seuPass ? '#22c55e' : '#ef4444'}
          />
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-2">Space requirement: &lt; 1.0 errors/day</div>
            <div className={`text-2xl font-bold ${seuPass ? 'text-green-400' : 'text-red-400'}`}>
              {result.seuErrorRate} errors/day
            </div>
            <div className="text-xs text-gray-600 mt-1">
              RadHard level {result.chip.radHardening} · {result.chip.processNode}nm process
            </div>
          </div>
        </div>
      </div>

      {/* Thermal Performance */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-300 mb-3">Thermal Performance</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { temp: '-40°C', label: 'Cold (LEO shadow)', result: result.thermalMinus40 },
            { temp: '+85°C', label: 'Hot (standard)', result: result.thermalPlus85 },
            { temp: '+125°C', label: 'Extreme (Mars)', result: result.thermalPlus125 },
          ].map(t => (
            <div
              key={t.temp}
              className={`rounded-xl p-3 border text-center ${
                t.result === 'pass'
                  ? 'bg-green-900/20 border-green-800/50'
                  : 'bg-red-900/20 border-red-800/50'
              }`}
            >
              <div className={`font-bold text-base ${t.result === 'pass' ? 'text-green-400' : 'text-red-400'}`}>
                {t.temp}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{t.label}</div>
              <div className="mt-2"><PassFail value={t.result} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Inference OPS */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-gray-300">Inference Performance</div>
          <PassFail value={opsPass ? 'pass' : 'fail'} />
        </div>
        <BarMetric
          label="Inference Operations"
          value={result.inferenceOps}
          max={100}
          unit=" GOPS"
          color={opsPass ? 'bg-blue-500' : 'bg-orange-500'}
        />
        <div className="text-xs text-gray-600 mt-1">Minimum space requirement: 5 GOPS</div>
      </div>

      {/* Power Efficiency */}
      <div>
        <div className="text-sm font-medium text-gray-300 mb-3">Power Efficiency Score</div>
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-bold ${
            result.powerEfficiency >= 70 ? 'text-green-400' :
            result.powerEfficiency >= 40 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {result.powerEfficiency}
          </div>
          <div className="flex-1">
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  result.powerEfficiency >= 70 ? 'bg-green-500' :
                  result.powerEfficiency >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.powerEfficiency}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0 — Poor</span>
              <span>100 — Optimal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
