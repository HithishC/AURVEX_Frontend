import { Download } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { isDemo } from '../services/api.js';
import { Card, Page } from '../components/ui.jsx';

// Quote values and neutralise spreadsheet formulas.
const cell = (v) => {
  const s = String(v);
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replaceAll('"', '""')}"`;
};

function download(name, rows) {
  const keys = Object.keys(rows[0]);
  const csv = [...(isDemo ? [cell('DEMONSTRATION DATA')] : []), keys.map(cell).join(','), ...rows.map((r) => keys.map((k) => cell(r[k])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `aurvex-${isDemo ? 'demo-' : ''}${name}.csv` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Reports() {
  const { devices, alerts, traffic } = useData();
  const reports = [['Device inventory', 'devices', devices], ['Threat alerts', 'alerts', alerts], ['Hourly traffic', 'traffic', traffic]];
  return (
    <Page title="Reports" subtitle="Export the current data as CSV">
      <div className="grid gap-4 lg:grid-cols-3">
        {reports.map(([title, file, rows]) => (
          <Card key={file} title={title}>
            <p className="mb-4 text-3xl font-light">{rows.length} <span className="text-sm text-zinc-500">rows</span></p>
            <button className="btn" disabled={!rows.length} onClick={() => download(file, rows)}><Download size={15} />Download CSV</button>
          </Card>
        ))}
      </div>
    </Page>
  );
}
