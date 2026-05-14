import type { SimulationResult } from '../App'

type Highlight = 'good' | 'bad' | 'neutral'

interface Props {
  results: SimulationResult[]
}

function Cell({ value, highlight }: { value: string; highlight?: Highlight }) {
  const colors = {
    good: 'text-green-400',
    bad: 'text-red-400',
    neutral: 'text-gray-300',
  }
  return <td className={`px-4 py-3 text-sm text-center ${colors[highlight || 'neutral']}`}>{value}</td>
}

function missionScore(r: SimulationResult): number {
  let score = 0
  if (r.seuErrorRate < 1.0) score += 25
  else if (r.seuErrorRate < 5.0) score += 10
  if (r.thermalMinus40 === 'pass') score += 15
  if (r.thermalPlus85 === 'pass') score += 15
  if (r.thermalPlus125 === 'pass') score += 10
  if (r.inferenceOps >= 10) score += 20
  else if (r.inferenceOps >= 5) score += 10
  score += Math.min(15, Math.round(r.powerEfficiency / 7))
  return score
}

function radLabel(level: number): string {
  return ['None', 'Basic', 'Enhanced', 'Full'][level] + ` (${level}/3)`
}

export default function ComparisonTable({ results }: Props) {
  if (results.length === 0) {
    return (
      <div className="text-center py-20 text-gray-600">
        <div className="text-4xl mb-3">🔬</div>
        <div>No simulations yet — configure and simulate chips in the Configurator</div>
      </div>
    )
  }

  const h = (cond1: boolean, cond2?: boolean): Highlight =>
    cond1 ? 'good' : (cond2 !== undefined ? (cond2 ? 'bad' : 'neutral') : 'bad')

  const rows: { label: string; values: { val: string; highlight: Highlight }[] }[] = [
    {
      label: 'Process Node',
      values: results.map(r => ({ val: `${r.chip.processNode}nm`, highlight: h(r.chip.processNode <= 28) })),
    },
    {
      label: 'Mass',
      values: results.map(r => ({ val: `${r.chip.mass}g`, highlight: h(r.chip.mass < 50, r.chip.mass > 200) })),
    },
    {
      label: 'Power (TDP)',
      values: results.map(r => ({ val: `${r.chip.tdp}W`, highlight: h(r.chip.tdp < 10, r.chip.tdp > 100) })),
    },
    {
      label: 'Rad Tolerance',
      values: results.map(r => ({ val: radLabel(r.chip.radHardening), highlight: h(r.chip.radHardening === 3, r.chip.radHardening === 0) })),
    },
    {
      label: 'SEU Error Rate',
      values: results.map(r => ({ val: `${r.seuErrorRate}/day`, highlight: h(r.seuErrorRate < 1, r.seuErrorRate > 5) })),
    },
    {
      label: 'Inference OPS',
      values: results.map(r => ({ val: `${r.inferenceOps} GOPS`, highlight: h(r.inferenceOps >= 10, r.inferenceOps < 5) })),
    },
    {
      label: 'Op Temp Range',
      values: results.map(r => ({ val: `${r.chip.tempMin}°C to ${r.chip.tempMax}°C`, highlight: 'neutral' as Highlight })),
    },
    {
      label: 'Thermal −40°C',
      values: results.map(r => ({ val: r.thermalMinus40.toUpperCase(), highlight: h(r.thermalMinus40 === 'pass') })),
    },
    {
      label: 'Thermal +85°C',
      values: results.map(r => ({ val: r.thermalPlus85.toUpperCase(), highlight: h(r.thermalPlus85 === 'pass') })),
    },
    {
      label: 'Thermal +125°C',
      values: results.map(r => ({ val: r.thermalPlus125.toUpperCase(), highlight: h(r.thermalPlus125 === 'pass') })),
    },
    {
      label: 'Power Efficiency',
      values: results.map(r => ({ val: `${r.powerEfficiency}/100`, highlight: h(r.powerEfficiency >= 70, r.powerEfficiency < 40) })),
    },
    {
      label: 'Mission Suitability',
      values: results.map(r => {
        const score = missionScore(r)
        return { val: `${score}/100`, highlight: h(score >= 70, score < 40) }
      }),
    },
  ]

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-100">Chip Comparison</h2>
        <p className="text-gray-400 text-sm mt-1">Side-by-side comparison of all simulated chips</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800/50 border-b border-gray-800">
              <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-widest">Metric</th>
              {results.map(r => (
                <th key={r.chip.name} className="px-4 py-3 text-center">
                  <div className="font-bold text-blue-300 text-sm">{r.chip.name}</div>
                  <div className="text-xs text-gray-500 font-normal">{r.chip.processNode}nm · {r.chip.tdp}W</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={`${i < rows.length - 1 ? 'border-b border-gray-800/50' : ''} ${i === rows.length - 1 ? 'bg-gray-800/30' : ''}`}>
                <td className="px-4 py-3 text-sm text-gray-400 font-medium">{row.label}</td>
                {row.values.map((v, j) => (
                  <Cell key={j} value={v.val} highlight={v.highlight} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1.5 text-green-400"><span className="w-2 h-2 rounded-full bg-green-500" /> Meets space requirement</span>
        <span className="flex items-center gap-1.5 text-red-400"><span className="w-2 h-2 rounded-full bg-red-500" /> Below requirement</span>
        <span className="flex items-center gap-1.5 text-gray-400"><span className="w-2 h-2 rounded-full bg-gray-500" /> Neutral / Informational</span>
      </div>
    </div>
  )
}
