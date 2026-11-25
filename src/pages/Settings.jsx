import { useData } from '../context/DataContext.jsx';
import { isDemo } from '../services/api.js';
import { Card, Page } from '../components/ui.jsx';

export default function Settings() {
  const { reload } = useData();
  return (
    <Page title="Settings" subtitle="Data source and demo controls">
      <Card title="Data source">
        <p className="text-sm">{isDemo ? 'Mock demonstration data' : 'Backend API'}</p>
        <p className="mt-2 text-xs text-zinc-500">Set VITE_DATA_SOURCE in a .env file and restart. See README.md.</p>
      </Card>
      <Card title="Demo controls">
        <p className="mb-4 text-sm text-zinc-300">Reload data from the source. In demo mode this undoes approvals, blocks and resolved alerts.</p>
        <button className="btn" onClick={reload}>Reload data</button>
      </Card>
    </Page>
  );
}
