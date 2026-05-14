import { useState } from 'react'
import type { ChipConfig } from '../App'
import { presets } from '../App'

interface Props {
  onSimulate: (chip: ChipConfig) => void
}

export default function ChipConfigurator({ onSimulate }: Props) {
  const [config, setConfig] = useState<ChipConfig>(presets[0])
  const [simulated, setSimulated] = useState(false)

  const handleSimulate = () => {
    onSimulate(config)
    setSimulated(true)
    setTimeout(() => setSimulated(false), 1500)
  }

  const loadPreset = (preset: ChipConfig) => {
    setConfig({ ...preset })
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-bold text-gray-100 mb-4">Chip Configurator</h2>

      {/* Preset buttons */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Quick Load Preset</div>
        <div className="flex gap-2">
          {presets.map(p => (
            <button
              key={p.name}
              onClick={() => loadPreset(p)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                config.name === p.name
                  ? 'bg-blue-800/50 border-blue-600 text-blue-200'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Chip Name</label>
          <input
            type="text"
            value={config.name}
            onChange={e => setConfig(p => ({ ...p, name: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Process Node */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Process Node: <span className="text-blue-400 font-bold">{config.processNode}nm</span>
          </label>
          <input
            type="range"
            min={5}
            max={180}
            step={1}
            value={config.processNode}
            onChange={e => setConfig(p => ({ ...p, processNode: parseInt(e.target.value) }))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>5nm (cutting edge)</span>
            <span>180nm (proven rad-hard)</span>
          </div>
        </div>

        {/* TDP */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            TDP: <span className="text-blue-400 font-bold">{config.tdp}W</span>
          </label>
          <input
            type="range"
            min={1}
            max={300}
            step={1}
            value={config.tdp}
            onChange={e => setConfig(p => ({ ...p, tdp: parseInt(e.target.value) }))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>1W (ultra-low)</span>
            <span>300W (high-perf)</span>
          </div>
        </div>

        {/* Mass */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Mass: <span className="text-blue-400 font-bold">{config.mass}g</span>
          </label>
          <input
            type="range"
            min={1}
            max={500}
            step={1}
            value={config.mass}
            onChange={e => setConfig(p => ({ ...p, mass: parseInt(e.target.value) }))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>1g</span>
            <span>500g</span>
          </div>
        </div>

        {/* Radiation Hardening */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Radiation Hardening Level</label>
          <div className="grid grid-cols-4 gap-2">
            {([0, 1, 2, 3] as const).map(level => {
              const labels = ['None', 'Basic', 'Enhanced', 'Full']
              const colors = ['border-gray-700 text-gray-500', 'border-yellow-700/60 text-yellow-500', 'border-orange-700/60 text-orange-500', 'border-green-700/60 text-green-500']
              const selected = ['bg-gray-800', 'bg-yellow-900/40', 'bg-orange-900/40', 'bg-green-900/40']
              return (
                <label key={level} className="cursor-pointer">
                  <input
                    type="radio"
                    name="radHard"
                    value={level}
                    checked={config.radHardening === level}
                    onChange={() => setConfig(p => ({ ...p, radHardening: level }))}
                    className="sr-only"
                  />
                  <div className={`px-2 py-2 rounded-lg border text-center text-xs font-medium transition-all ${colors[level]} ${
                    config.radHardening === level ? selected[level] + ' border-opacity-100' : 'bg-gray-900 border-opacity-40'
                  }`}>
                    <div className="font-bold">{level}</div>
                    <div className="mt-0.5">{labels[level]}</div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* Temperature Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Min Temp: <span className="text-blue-400 font-bold">{config.tempMin}°C</span>
            </label>
            <input
              type="range"
              min={-100}
              max={0}
              step={5}
              value={config.tempMin}
              onChange={e => setConfig(p => ({ ...p, tempMin: parseInt(e.target.value) }))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>-100°C</span>
              <span>0°C</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Max Temp: <span className="text-blue-400 font-bold">{config.tempMax}°C</span>
            </label>
            <input
              type="range"
              min={50}
              max={200}
              step={5}
              value={config.tempMax}
              onChange={e => setConfig(p => ({ ...p, tempMax: parseInt(e.target.value) }))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>50°C</span>
              <span>200°C</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSimulate}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
            simulated
              ? 'bg-green-700 text-green-100'
              : 'bg-blue-700 hover:bg-blue-600 text-white'
          }`}
        >
          {simulated ? '✓ Simulation Complete' : 'Run Simulation'}
        </button>
      </div>
    </div>
  )
}
