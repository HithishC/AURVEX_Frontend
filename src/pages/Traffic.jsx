import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useData } from '../context/DataContext.jsx';
import { Card, Page, Stat, chart } from '../components/ui.jsx';

export default function Traffic() {
  const { traffic, protocols } = useData();
  const [hours, setHours] = useState(24);
  const data = traffic.slice(-hours);
  const sum = (k) => data.reduce((t, x) => t + x[k], 0);
  return (
    <Page title="Traffic analytics" subtitle="Demo traffic volume and protocol mix"
      actions={<div className="flex gap-2">{[6, 12, 24].map((h) => <button key={h} className={`btn ${h === hours ? 'btn-solid' : ''}`} onClick={() => setHours(h)}>{h}h</button>)}</div>}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Inbound MB" value={sum('inbound')} /><Stat label="Outbound MB" value={sum('outbound')} />
        <Stat label="Peak inbound MB/h" value={data.length ? Math.max(...data.map((x) => x.inbound)) : 0} />
      </div>
      <Card title="Volume (solid in, dashed out)">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid {...chart.grid} /><XAxis dataKey="time" {...chart.axis} /><YAxis {...chart.axis} /><Tooltip {...chart.tooltip} />
            <Line dataKey="inbound" name="Inbound" stroke="#fff" dot={false} strokeWidth={2} />
            <Line dataKey="outbound" name="Outbound" stroke="#a1a1aa" strokeDasharray="5 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Protocol share, % (24h)">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={protocols} layout="vertical">
            <XAxis type="number" {...chart.axis} /><YAxis type="category" dataKey="name" width={90} {...chart.axis} /><Tooltip {...chart.tooltip} />
            <Bar dataKey="value" name="Share %" fill="#e4e4e7" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Page>
  );
}
