
import { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { Badge, Card, Empty, SearchBox, Select } from './ui.jsx';

export default function DeviceTable({ devices = [], showStatusFilter = false }) {
  const { select } = useData();

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [risk, setRisk] = useState('all');

  const rows = devices.filter((d) => {
    const searchText = [
      d.name,
      d.ip,
      d.mac,
      d.vendor,
      d.type,
      d.connectionType,
      d.authorizationStatus,
      ...(d.connectionEvidence || []),
    ].join(' ').toLowerCase();

    return (
      searchText.includes(q.trim().toLowerCase()) &&
      (status === 'all' || d.status === status) &&
      (risk === 'all' || d.risk === risk)
    );
  });

  return (
    <Card>
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchBox
          value={q}
          onChange={setQ}
          placeholder="Search name, IP, MAC, connection..."
        />

        {showStatusFilter && (
          <Select
            label="statuses"
            value={status}
            onChange={setStatus}
            options={['approved', 'unknown', 'changed', 'insufficient evidence']}
          />
        )}

        <Select
          label="risk levels"
          value={risk}
          onChange={setRisk}
          options={['critical', 'high', 'medium', 'low']}
        />
      </div>

      {rows.length === 0 ? (
        <Empty />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-3 font-normal">Device</th>
                <th className="px-3 py-3 font-normal">IP address</th>
                <th className="px-3 py-3 font-normal">MAC address</th>
                <th className="px-3 py-3 font-normal">Vendor</th>
                <th className="px-3 py-3 font-normal">Connection</th>
                <th className="px-3 py-3 font-normal">Authorization</th>
                <th className="px-3 py-3 font-normal">Status</th>
                <th className="px-3 py-3 font-normal">Risk</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => select(d.id)}
                  className="cursor-pointer border-t border-white/10 hover:bg-white/5"
                >
                  <td className="px-3 py-4 font-medium">
                    <button className="text-left hover:underline">
                      {d.name || 'Unknown device'}
                    </button>
                  </td>

                  <td className="px-3 py-4 whitespace-nowrap">
                    {d.ip || 'Not available'}
                  </td>

                  <td className="px-3 py-4 whitespace-nowrap font-mono text-xs">
                    {d.mac || 'Unknown'}
                  </td>

                  <td className="px-3 py-4 text-zinc-400">
                    {d.vendor || 'Unknown'}
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex flex-col gap-1">
                      <Badge value={d.connectionType || 'Unknown'} />
                      {d.connectionEvidence?.length > 0 && (
                        <span
                          className="max-w-[160px] text-xs text-zinc-500"
                          title={d.connectionEvidence.join(', ')}
                        >
                          {d.connectionEvidence.join(', ')}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex flex-col gap-1">
                      <Badge value={d.authorizationStatus || 'Review Required'} />
                      <span
                        className="max-w-[190px] text-xs text-zinc-500"
                        title={d.authorizationReason || ''}
                      >
                        {d.authorizationReason || 'Needs verification'}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <Badge value={d.status || 'unknown'} />
                  </td>

                  <td className="px-3 py-4">
                    <Badge value={d.risk || 'low'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
