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
          <Route path="ai" element={<AICenter />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="exports" element={<ExportsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="sample-data" element={<SampleDataPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
