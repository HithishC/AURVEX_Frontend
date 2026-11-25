import { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { Badge, Card, Empty, Page, SearchBox, Select } from '../components/ui.jsx';

export default function Alerts() {
  const { alerts, devices, select, setAlertStatus } = useData();
  const [q, setQ] = useState('');
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [id, setId] = useState(alerts[0]?.id);
  const rows = alerts.filter((a) => `${a.id} ${a.title} ${a.detail}`.toLowerCase().includes(q.trim().toLowerCase())
    && (severity === 'all' || a.severity === severity) && (status === 'all' || a.status === status));
  const current = rows.find((a) => a.id === id) || rows[0];
  const device = devices.find((d) => d.id === current?.deviceId);
  return (
    <Page title="Threat alerts" subtitle="Filter by severity and open an alert for details">
      <div className="flex flex-wrap gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Search alerts" />
        <Select label="severities" value={severity} onChange={setSeverity} options={['critical', 'high', 'medium', 'low']} />
        <Select label="statuses" value={status} onChange={setStatus} options={['open', 'resolved']} />
      </div>
      {!current ? <Card><Empty /></Card> : (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            {rows.map((a) => (
              <button key={a.id} onClick={() => setId(a.id)} className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl p-3 text-left text-sm ${a.id === current.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                <span>{a.title}<span className="block text-xs text-zinc-500">{a.id} · {a.time} · {a.status}</span></span><Badge value={a.severity} />
              </button>
            ))}
          </Card>
          <Card title={`Alert ${current.id}`} className="self-start">
            <Badge value={current.severity} />
            <h3 className="my-3 text-xl">{current.title}</h3>
            <p className="text-sm text-zinc-300">{current.detail}</p>
            <p className="mt-4 text-xs uppercase text-zinc-500">Recommended action</p>
            <p className="text-sm">{current.action}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="btn btn-solid" onClick={() => setAlertStatus(current.id, current.status === 'open' ? 'resolved' : 'open')}>{current.status === 'open' ? 'Mark resolved' : 'Reopen'}</button>
              {device && <button className="btn" onClick={() => select(device.id)}>View {device.name}</button>}
            </div>
          </Card>
        </div>
      )}
    </Page>
  );
}
