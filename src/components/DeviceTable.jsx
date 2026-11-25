import { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { Badge, Card, Empty, SearchBox, Select } from './ui.jsx';

export default function DeviceTable({ devices, showStatusFilter = false }) {
  const { select } = useData();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [risk, setRisk] = useState('all');
  const rows = devices.filter((d) =>
    [d.name, d.ip, d.mac, d.vendor, d.type].join(' ').toLowerCase().includes(q.trim().toLowerCase())
    && (status === 'all' || d.status === status)
    && (risk === 'all' || d.risk === risk));

  return (
    <Card>
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Search name, IP, MAC" />
        {showStatusFilter && <Select label="statuses" value={status} onChange={setStatus} options={['approved', 'unknown', 'blocked']} />}
        <Select label="risk levels" value={risk} onChange={setRisk} options={['critical', 'high', 'medium', 'low']} />
      </div>
      {rows.length === 0 ? <Empty /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>{['Device', 'IP address', 'MAC address', 'Vendor', 'Status', 'Risk'].map((h) => <th key={h} className="px-3 py-2 font-normal">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} onClick={() => select(d.id)} className="cursor-pointer border-t border-white/10 hover:bg-white/5">
                  <td className="px-3 py-3"><button className="cursor-pointer text-left underline-offset-4 hover:underline">{d.name}</button><div className="text-xs text-zinc-500">{d.type}</div></td>
                  <td className="px-3">{d.ip}</td>
                  <td className="px-3">{d.mac}</td>
                  <td className="px-3 text-zinc-400">{d.vendor}</td>
                  <td className="px-3"><Badge value={d.status} /></td>
                  <td className="px-3"><Badge value={d.risk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
