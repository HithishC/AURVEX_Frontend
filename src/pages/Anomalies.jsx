import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useData } from '../context/DataContext.jsx';
import { Card, Empty, Page, chart } from '../components/ui.jsx';

export default function Anomalies() {
  const { devices, select } = useData();
  const [threshold, setThreshold] = useState(0.6);
  const data = [...devices].sort((a, b) => b.score - a.score);
  const flagged = data.filter((d) => d.score >= threshold);
  return (
    <Page title="AI anomaly detection" subtitle="Isolation Forest view. Scores are demonstration values, not model output.">
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ['How it works', 'Isolation Forest builds many random trees. Each split picks a feature and a value, separating the data points.'],
          ['Why it finds outliers', 'Unusual points need fewer splits to isolate. A shorter average path gives a higher anomaly score.'],
          ['Possible features', 'Packets per second, bytes out, distinct destinations, ports contacted and active hours. The backend decides the final set.'],
        ].map(([t, body]) => <Card key={t} title={t}><p className="text-sm text-zinc-300">{body}</p></Card>)}
      </div>
      <Card title="Anomaly score by device">
        <label className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          Display threshold {threshold.toFixed(2)}
          <input type="range" min="0.3" max="0.9" step="0.05" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="accent-white" />
        </label>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ bottom: 60 }}>
            <CartesianGrid {...chart.grid} /><XAxis dataKey="name" {...chart.axis} angle={-30} textAnchor="end" interval={0} /><YAxis domain={[0, 1]} {...chart.axis} /><Tooltip {...chart.tooltip} />
            <ReferenceLine y={threshold} stroke="#fff" strokeDasharray="4 4" />
            <Bar dataKey="score" name="Score" onClick={(_, i) => select(data[i].id)} cursor="pointer">
              {data.map((d) => <Cell key={d.id} fill={d.score >= threshold ? '#ffffff' : '#52525b'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card title={`Above threshold (${flagged.length})`}>
        {flagged.length === 0 ? <Empty title="No devices above threshold" hint="Lower the threshold." /> : flagged.map((d) => (
          <button key={d.id} onClick={() => select(d.id)} className="flex w-full cursor-pointer justify-between border-b border-white/10 py-3 text-sm hover:bg-white/5"><span>{d.name} · {d.ip}</span><span>{d.score.toFixed(2)}</span></button>
        ))}
      </Card>
    </Page>
  );
}
