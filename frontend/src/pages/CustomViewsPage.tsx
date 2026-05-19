import { Telescope } from 'lucide-react';
import ComponentReliabilityChart from '../components/ComponentReliabilityChart';
import RadiationToleranceHeatmap from '../components/RadiationToleranceHeatmap';
import SpecSheetPdf from '../components/SpecSheetPdf';
import QualificationRulesEditor from '../components/QualificationRulesEditor';

export default function CustomViewsPage() {
  return (
    <div data-testid="custom-views-page" className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-cyan-900/40 border border-cyan-700/40 flex items-center justify-center">
          <Telescope size={22} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Space Views</h1>
          <p className="text-sm text-gray-400">Domain custom views for space-grade electronics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComponentReliabilityChart />
        <RadiationToleranceHeatmap />
        <SpecSheetPdf />
        <QualificationRulesEditor />
      </div>
    </div>
  );
}
