import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DataProvider } from './context/DataContext.jsx';
import AppLayout from './components/AppLayout.jsx';
import { Loading } from './components/ui.jsx';
import Landing from './pages/Landing.jsx';
import AuthPage from './pages/AuthPage.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import RequireAuth from './components/RequireAuth.jsx';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Topology = lazy(() => import('./pages/Topology.jsx'));
const UnknownDevices = lazy(() => import('./pages/UnknownDevices.jsx'));
const Anomalies = lazy(() => import('./pages/Anomalies.jsx'));
const Alerts = lazy(() => import('./pages/Alerts.jsx'));
const Pcap = lazy(() => import('./pages/Pcap.jsx'));
const Traffic = lazy(() => import('./pages/Traffic.jsx'));
const Inventory = lazy(() => import('./pages/Inventory.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));

const pages = {
  dashboard: Dashboard, topology: Topology, 'unknown-devices': UnknownDevices,
  anomalies: Anomalies, alerts: Alerts, pcap: Pcap, traffic: Traffic,
  inventory: Inventory, reports: Reports, settings: Settings,
};

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route element={<RequireAuth />}>
            <Route element={<DataProvider><AppLayout /></DataProvider>}>
              {Object.entries(pages).map(([path, Page]) => (
                <Route key={path} path={path} element={<Page />} />
              ))}
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Suspense>
  );
}
