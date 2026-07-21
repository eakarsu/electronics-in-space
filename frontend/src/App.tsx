import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import ChipsPage from './pages/ChipsPage';
import MissionsPage from './pages/MissionsPage';
import DeploymentsPage from './pages/DeploymentsPage';
import TestsPage from './pages/TestsPage';
import ManufacturersPage from './pages/ManufacturersPage';
import ResearchPage from './pages/ResearchPage';
import AICenter from './components/AICenter';
import SearchPage from './pages/SearchPage';
import ExportsPage from './pages/ExportsPage';
import AuditPage from './pages/AuditPage';
import SampleDataPage from './pages/SampleDataPage';
import Dashboard from './pages/Dashboard';
import RadTestCampaignsPage from './pages/RadTestCampaignsPage';
import OrbitEnvironmentsPage from './pages/OrbitEnvironmentsPage';
import UpscreenLotsPage from './pages/UpscreenLotsPage';
import SubsystemBudgetsPage from './pages/SubsystemBudgetsPage';
import RadHardFoundriesPage from './pages/RadHardFoundriesPage';
import CustomViewsPage from './pages/CustomViewsPage';
import QualityLotsPage from './pages/QualityLotsPage';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

// Audit gap pages (AI)
import GapThermalEnvelopeSolver from './pages/GapThermalEnvelopeSolver';
import GapMassBudgetOptimizer from './pages/GapMassBudgetOptimizer';
import GapSingleEventUpset from './pages/GapSingleEventUpset';
import GapDeratingAdvisor from './pages/GapDeratingAdvisor';
import GapTestCoverageGap from './pages/GapTestCoverageGap';

// Audit gap pages (non-AI)
import GapEdaCadUpload from './pages/GapEdaCadUpload';
import GapTier2Suppliers from './pages/GapTier2Suppliers';
import GapItarFlags from './pages/GapItarFlags';
import GapChamberScheduling from './pages/GapChamberScheduling';
import GapOrbitTelemetryIngest from './pages/GapOrbitTelemetryIngest';

// Custom feature pages
import CfChipDigitalTwin from './pages/CfChipDigitalTwin';
import CfItarCollaboration from './pages/CfItarCollaboration';
import CfRadTestPlanGen from './pages/CfRadTestPlanGen';
import CfMissionDerating from './pages/CfMissionDerating';
import CfRadHardMarketplace from './pages/CfRadHardMarketplace';

// Shared types retained for the standalone comparison/configurator components.
export interface ChipConfig {
  name: string; processNode: number; tdp: number; mass: number; radHardening: 0|1|2|3; tempMin: number; tempMax: number;
}
export interface SimulationResult {
  chip: ChipConfig; seuErrorRate: number; inferenceOps: number; powerEfficiency: number;
  thermalMinus40: 'pass'|'fail'; thermalPlus85: 'pass'|'fail'; thermalPlus125: 'pass'|'fail';
}
export const presets: ChipConfig[] = [
  { name:'COTS 7nm',processNode:7,tdp:75,mass:80,radHardening:0,tempMin:-20,tempMax:85 },
  { name:'Rad-tolerant 28nm',processNode:28,tdp:25,mass:110,radHardening:2,tempMin:-40,tempMax:125 },
  { name:'Rad-hard 90nm',processNode:90,tdp:12,mass:140,radHardening:3,tempMin:-55,tempMax:125 },
];

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return localStorage.getItem('token') ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chips" element={<ChipsPage />} />
          <Route path="missions" element={<MissionsPage />} />
          <Route path="deployments" element={<DeploymentsPage />} />
          <Route path="tests" element={<TestsPage />} />
          <Route path="manufacturers" element={<ManufacturersPage />} />
          <Route path="research" element={<ResearchPage />} />
          <Route path="rad-test-campaigns" element={<RadTestCampaignsPage />} />
          <Route path="orbit-environments" element={<OrbitEnvironmentsPage />} />
          <Route path="upscreen-lots" element={<UpscreenLotsPage />} />
          <Route path="subsystem-budgets" element={<SubsystemBudgetsPage />} />
          <Route path="rad-hard-foundries" element={<RadHardFoundriesPage />} />
          <Route path="custom-views" element={<CustomViewsPage />} />
          <Route path="ai" element={<AICenter />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="exports" element={<ExportsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="sample-data" element={<SampleDataPage />} />
          <Route path="quality-lots" element={<QualityLotsPage />} />
          <Route path="insights/timeline" element={<TimelineView />} />
          <Route path="codex/custom-viz" element={<CodexCustomVizFeature />} />
          <Route path="codex/operations" element={<CodexOperationsFeature />} />

          {/* Audit gap features (AI) */}
          <Route path="gap-thermal-envelope-solver" element={<GapThermalEnvelopeSolver />} />
          <Route path="gap-mass-budget-optimizer" element={<GapMassBudgetOptimizer />} />
          <Route path="gap-single-event-upset" element={<GapSingleEventUpset />} />
          <Route path="gap-derating-advisor" element={<GapDeratingAdvisor />} />
          <Route path="gap-test-coverage-gap" element={<GapTestCoverageGap />} />

          {/* Audit gap features (non-AI) */}
          <Route path="gap-eda-cad-upload" element={<GapEdaCadUpload />} />
          <Route path="gap-tier2-suppliers" element={<GapTier2Suppliers />} />
          <Route path="gap-itar-flags" element={<GapItarFlags />} />
          <Route path="gap-chamber-scheduling" element={<GapChamberScheduling />} />
          <Route path="gap-orbit-telemetry-ingest" element={<GapOrbitTelemetryIngest />} />

          {/* Custom features */}
          <Route path="cf-chip-digital-twin" element={<CfChipDigitalTwin />} />
          <Route path="cf-itar-collaboration" element={<CfItarCollaboration />} />
          <Route path="cf-rad-test-plan-gen" element={<CfRadTestPlanGen />} />
          <Route path="cf-mission-derating" element={<CfMissionDerating />} />
          <Route path="cf-rad-hard-marketplace" element={<CfRadHardMarketplace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
