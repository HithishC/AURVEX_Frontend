import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useData } from '../context/DataContext.jsx';
import { Badge, Card, Empty, Page, Stat, chart } from '../components/ui.jsx';

export default function Dashboard() {
  const { devices, alerts, traffic, select } = useData();
  const open = alerts.filter((a) => a.status === 'open');
  const stats = [
    ['Devices', devices.length, `${devices.filter((d) => d.status === 'approved').length} approved`, '/inventory'],
    ['Unknown', devices.filter((d) => d.status === 'unknown').length, 'awaiting review', '/unknown-devices'],
    ['Anomalies', devices.filter((d) => d.score >= 0.6).length, 'score 0.60 or higher', '/anomalies'],
    ['Open alerts', open.length, `${open.filter((a) => a.severity === 'critical').length} critical`, '/alerts'],
  ];
  return (
    <Page title="Security overview" subtitle="Current state of the demo network">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, note, to]) => <Link key={label} to={to}><Stat label={label} value={value} note={note} /></Link>)}
      </div>
      <div className="grid gap-4 xl:grid-cols-5">
        <Card title="Traffic, MB per hour (solid in, dashed out)" className="xl:col-span-3">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={traffic}>
              <CartesianGrid {...chart.grid} /><XAxis dataKey="time" {...chart.axis} /><YAxis {...chart.axis} /><Tooltip {...chart.tooltip} />
              <Area dataKey="inbound" name="Inbound" stroke="#fff" fill="#fff" fillOpacity={0.12} />
              <Area dataKey="outbound" name="Outbound" stroke="#a1a1aa" strokeDasharray="5 4" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Alert feed" className="xl:col-span-2">
          {open.length === 0 ? <Empty title="No open alerts" hint="All alerts are handled." /> : open.slice(0, 5).map((a) => (
            <button key={a.id} onClick={() => select(a.deviceId)} className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-white/10 py-3 text-left text-sm hover:bg-white/5">
              <span>{a.title}<span className="block text-xs text-zinc-500">{a.time}</span></span><Badge value={a.severity} />
            </button>
          ))}
        </Card>
      </div>
    </Page>
  );
}
