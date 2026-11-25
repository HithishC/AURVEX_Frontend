import { useData } from '../context/DataContext.jsx';
import NetworkScene from '../components/NetworkScene.jsx';
import { Card, Page } from '../components/ui.jsx';

export default function Topology() {
  const { devices, select } = useData();
  return (
    <Page title="Network topology" subtitle="Drag to rotate, scroll to zoom, select a node for details">
      <Card className="!p-0">
        <div className="h-[560px]"><NetworkScene devices={devices} onSelect={select} /></div>
      </Card>
      <p className="text-xs text-zinc-500">Sphere and solid line: approved. Wireframe and dashed line: unknown or blocked. Centre: gateway.</p>
      <div className="flex flex-wrap gap-2">
        {devices.map((d) => <button key={d.id} className="btn !px-3 !py-1 !text-xs" onClick={() => select(d.id)}>{d.name}</button>)}
      </div>
    </Page>
  );
}
