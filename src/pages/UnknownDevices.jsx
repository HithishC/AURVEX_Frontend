import { useData } from '../context/DataContext.jsx';
import DeviceTable from '../components/DeviceTable.jsx';
import { Card, Empty, Page } from '../components/ui.jsx';

export default function UnknownDevices() {
  const unknown = useData().devices.filter((d) => d.status === 'unknown');
  return (
    <Page title="Unknown devices" subtitle="Devices not on the approved list. Select one to review it.">
      {unknown.length ? <DeviceTable devices={unknown} /> : <Card><Empty title="No unknown devices" hint="Every device has been reviewed." /></Card>}
    </Page>
  );
}
