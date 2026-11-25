import { useData } from '../context/DataContext.jsx';
import DeviceTable from '../components/DeviceTable.jsx';
import { Page, Stat } from '../components/ui.jsx';

export default function Inventory() {
  const { devices } = useData();
  return (
    <Page title="Device inventory" subtitle="Approved, unknown and blocked devices">
      <div className="grid gap-4 sm:grid-cols-3">
        {['approved', 'unknown', 'blocked'].map((s) => <Stat key={s} label={s} value={devices.filter((d) => d.status === s).length} />)}
      </div>
      <DeviceTable devices={devices} showStatusFilter />
    </Page>
  );
}
