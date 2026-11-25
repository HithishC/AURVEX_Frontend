import { Suspense } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Activity, Bell, Boxes, FileSearch, FileText, LayoutDashboard, Network, Radar, Settings, ShieldQuestion } from 'lucide-react';
import { isDemo } from '../services/api.js';
import { Loading } from './ui.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { LogOut } from 'lucide-react';

const nav = [
  ['dashboard', 'Overview', LayoutDashboard], ['topology', 'Topology', Network],
  ['unknown-devices', 'Unknown devices', ShieldQuestion], ['anomalies', 'AI anomalies', Radar],
  ['alerts', 'Threat alerts', Bell], ['pcap', 'PCAP analysis', FileSearch],
  ['traffic', 'Traffic', Activity], ['inventory', 'Inventory', Boxes],
  ['reports', 'Reports', FileText], ['settings', 'Settings', Settings],
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-white/10 p-4 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-r md:border-b-0 md:overflow-y-auto">
        <Link to="/" className="mb-5 block text-2xl tracking-[0.25em]">AURVEX</Link>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {nav.map(([to, label, Icon]) => (
            <NavLink key={to} to={`/${to}`} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-full px-4 py-2 text-sm transition ${isActive ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}>
              <Icon size={16} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="truncate px-3 text-[11px] text-zinc-500">{user?.email || 'Authenticated session'}</p>
          <button type="button" onClick={logout} className="mt-3 flex w-full items-center gap-3 rounded-full px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/10 hover:text-white"><LogOut size={16}/> Sign out</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        {isDemo && <p className="mb-5 rounded-full border border-dashed border-white/30 px-4 py-1.5 text-xs text-zinc-300">DEMONSTRATION DATA: not from a real network. Backend not connected.</p>}
        <Suspense fallback={<Loading />}><Outlet /></Suspense>
      </main>
    </div>
  );
}
