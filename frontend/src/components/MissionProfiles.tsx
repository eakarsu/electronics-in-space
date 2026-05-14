import type { SimulationResult } from '../App'

interface MissionProfile {
  id: string
  name: string
  icon: string
  description: string
  requirements: {
    maxSEU: number
    minTemp: number
    maxTemp: number
    minOps: number
    minRadHard: number
    maxMass: number
  }
  envDescription: string
}

const missions: MissionProfile[] = [
  {
    id: 'leo',
    name: 'LEO Satellite',
    icon: '🛰️',
    description: 'Low Earth Orbit communications or Earth observation satellite, ~550km altitude',
    requirements: {
      maxSEU: 5.0,
      minTemp: -40,
      maxTemp: 85,
      minOps: 5,
      minRadHard: 1,
      maxMass: 300,
    },
    envDescription: 'Moderate radiation (South Atlantic Anomaly), thermal cycling',
  },
  {
    id: 'deep',
    name: 'Deep Space Probe',
    icon: '🚀',
    description: 'Outer solar system probe beyond Jupiter, extreme radiation and cold',
    requirements: {
      maxSEU: 0.5,
      minTemp: -80,
      maxTemp: 85,
      minOps: 3,
      minRadHard: 3,
      maxMass: 150,
    },
    envDescription: 'Extreme radiation belts, no active thermal control possible',
  },
  {
    id: 'lunar',
    name: 'Lunar Lander',
    icon: '🌕',
    description: 'Lunar surface lander with instruments and comms relay capability',
    requirements: {
      maxSEU: 2.0,
      minTemp: -55,
      maxTemp: 125,
      minOps: 8,
      minRadHard: 2,
      maxMass: 200,
    },
    envDescription: 'Lunar day/night thermal extremes, moderate radiation environment',
  },
  {
    id: 'mars',
    name: 'Mars Rover',
    icon: '🔴',
    description: 'Autonomous surface rover for geological sampling and exploration',
    requirements: {
      maxSEU: 1.5,
      minTemp: -55,
      maxTemp: 105,
      minOps: 12,
      minRadHard: 2,
      maxMass: 200,
    },
    envDescription: 'High GCR flux, extreme cold nights, autonomous AI required',
  },
]

interface ChipResult {
  pass: boolean
  reasons: string[]
}

function checkChipForMission(result: SimulationResult, mission: MissionProfile): ChipResult {
  const reasons: string[] = []
  const r = mission.requirements

  if (result.seuErrorRate > r.maxSEU) reasons.push(`SEU ${result.seuErrorRate}/day > ${r.maxSEU} limit`)
  if (result.chip.tempMin > r.minTemp) reasons.push(`Min temp ${result.chip.tempMin}°C > required ${r.minTemp}°C`)
  if (result.chip.tempMax < r.maxTemp) reasons.push(`Max temp ${result.chip.tempMax}°C < required ${r.maxTemp}°C`)
  if (result.inferenceOps < r.minOps) reasons.push(`${result.inferenceOps} GOPS < required ${r.minOps} GOPS`)
  if (result.chip.radHardening < r.minRadHard) reasons.push(`RadHard ${result.chip.radHardening} < required ${r.minRadHard}`)
  if (result.chip.mass > r.maxMass) reasons.push(`Mass ${result.chip.mass}g > ${r.maxMass}g limit`)

  return { pass: reasons.length === 0, reasons }
}

interface Props {
  results: SimulationResult[]
}

export default function MissionProfiles({ results }: Props) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-100">Mission Profiles</h2>
        <p className="text-gray-400 text-sm mt-1">Pass/fail analysis for each chip against mission requirements</p>
      </div>

      {results.length === 0 && (
        <div className="text-center py-20 text-gray-600">
          <div className="text-4xl mb-3">🚀</div>
          <div>Configure and simulate chips to see mission compatibility</div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {missions.map(mission => (
          <div key={mission.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 flex items-start gap-3">
              <span className="text-3xl">{mission.icon}</span>
              <div>
                <h3 className="font-bold text-gray-100 text-base">{mission.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{mission.description}</p>
                <p className="text-xs text-blue-400/70 mt-1">{mission.envDescription}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="px-5 py-3 border-b border-gray-800/50 bg-gray-900/50">
              <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Requirements</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <span className="text-gray-500">SEU: <span className="text-gray-300">&lt;{mission.requirements.maxSEU}/day</span></span>
                <span className="text-gray-500">Ops: <span className="text-gray-300">&ge;{mission.requirements.minOps} GOPS</span></span>
                <span className="text-gray-500">RadHard: <span className="text-gray-300">&ge;{mission.requirements.minRadHard}</span></span>
                <span className="text-gray-500">Mass: <span className="text-gray-300">&le;{mission.requirements.maxMass}g</span></span>
                <span className="text-gray-500">Cold: <span className="text-gray-300">{mission.requirements.minTemp}°C</span></span>
                <span className="text-gray-500">Hot: <span className="text-gray-300">{mission.requirements.maxTemp}°C</span></span>
              </div>
            </div>

            {/* Chip results */}
            <div className="p-4 space-y-3">
              {results.length === 0 && (
                <div className="text-xs text-gray-600 text-center py-2">No chips simulated yet</div>
              )}
              {results.map(r => {
                const check = checkChipForMission(r, mission)
                return (
                  <div
                    key={r.chip.name}
                    className={`rounded-lg p-3 border ${
                      check.pass
                        ? 'bg-green-900/20 border-green-800/50'
                        : 'bg-red-900/15 border-red-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-200">{r.chip.name}</span>
                      {check.pass ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/50 text-green-400 border border-green-700/50 font-bold">MISSION CAPABLE</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/50 text-red-400 border border-red-700/50 font-bold">NOT QUALIFIED</span>
                      )}
                    </div>
                    {!check.pass && (
                      <ul className="text-xs text-red-400/80 space-y-0.5 mt-1">
                        {check.reasons.map((reason, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <span>✗</span> {reason}
                          </li>
                        ))}
                      </ul>
                    )}
                    {check.pass && (
                      <div className="text-xs text-green-400/70 mt-0.5">All requirements met</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
