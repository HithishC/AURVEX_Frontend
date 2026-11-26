
import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { api, isDemo } from '../services/api.js';
import { useData } from '../context/DataContext.jsx';
import { Card, Empty, Page, Stat } from '../components/ui.jsx';

const MAX_MB = 100;

const MAGIC = [
  'd4c3b2a1',
  'a1b2c3d4',
  '4d3cb2a1',
  'a1b23c4d',
  '0a0d0d0a',
];

async function validate(file) {
  if (!/\.(pcap|pcapng)$/i.test(file.name)) {
    return 'Only .pcap and .pcapng files are supported by the backend.';
  }

  if (file.size > MAX_MB * 1024 * 1024) {
    return `File is larger than ${MAX_MB} MB.`;
  }

  const bytes = new Uint8Array(await file.slice(0, 4).arrayBuffer());

  const head = [...bytes]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return MAGIC.includes(head)
    ? ''
    : 'This does not look like a packet capture (header mismatch).';
}

export default function Pcap() {
  const { reload } = useData();

  const [error, setError] = useState('');
  const [job, setJob] = useState(null);
  const [result, setResult] = useState(null);

  const busy = job !== null && !result;

  const handle = async (file) => {
    if (!file || busy) return;

    setError('');
    setResult(null);
    setJob(null);

    const problem = await validate(file);

    if (problem) {
      setError(problem);
      return;
    }

    try {
      setJob({ step: 'Starting', pct: 0 });

      const analysis = await api.analyzePcap(file, (step, pct) => {
        setJob({ step, pct });
      });

      setResult(analysis);
      setJob({ step: 'Refreshing dashboard data', pct: 100 });

      await reload();

      setJob(null);
    } catch (e) {
      setJob(null);
      setError(e.message || 'Analysis failed.');
    }
  };

  const counts = result?.counts || {};

  return (
    <Page
      title="PCAP analysis"
      subtitle={
        isDemo
          ? 'Simulated processing: your file stays in the browser and is not analysed.'
          : 'Upload a capture file to analyse it using the backend.'
      }
    >
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handle(e.dataTransfer.files[0]);
        }}
        className="glass block cursor-pointer !border-dashed p-12 text-center hover:!border-white focus-within:!border-white"
      >
        <UploadCloud className="mx-auto mb-3" size={36} />

        <p>Drop a capture file here, or click to choose</p>

        <p className="text-xs text-zinc-500">
          .pcap or .pcapng up to {MAX_MB} MB
        </p>

        <input
          type="file"
          accept=".pcap,.pcapng"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            handle(e.target.files[0]);
            e.target.value = '';
          }}
        />
      </label>

      {error && (
        <p role="alert" className="rounded-xl border border-white p-3 text-sm">
          Error: {error}
        </p>
      )}

      {job && (
        <Card title="Processing status">
          <p className="mb-2 text-sm">
            {job.step} · {job.pct}%
          </p>

          <div className="h-2 rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-white transition-all"
              style={{ width: `${job.pct}%` }}
            />
          </div>
        </Card>
      )}

      {result ? (
        <>
          <p className="text-sm text-zinc-400">
            {isDemo ? 'Sample results' : 'Backend analysis results'} for{' '}
            {result.fileName}
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Observation rows" value={result.observations} />
            <Stat label="Hosts detected" value={result.hosts} />
            <Stat label="Flagged devices" value={result.flagged} />
          </div>

          <Card title="Authorization summary">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Stat
                label="Authorized"
                value={counts.authorized ?? 0}
              />

              <Stat
                label="Unauthorized"
                value={counts.unauthorized ?? 0}
              />

              <Stat
                label="Review required"
                value={counts.review_required ?? 0}
              />
            </div>
          </Card>

          <Card title="Connection type summary">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Wi-Fi" value={counts.wifi ?? 0} />

              <Stat label="Ethernet" value={counts.ethernet ?? 0} />

              <Stat
                label="Unknown connection"
                value={counts.unknown_connection ?? 0}
              />

              <Stat
                label="Mixed connection"
                value={counts.mixed_connection ?? 0}
              />
            </div>

            <p className="mt-4 text-xs text-zinc-500">
              Connection types are based on available packet capture evidence.
              They do not always establish the device's physical connection.
            </p>
          </Card>

          <Card title="Detection summary">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Stat label="Known" value={counts.known ?? 0} />

              <Stat label="Unknown" value={counts.unknown ?? 0} />

              <Stat label="Changed" value={counts.changed ?? 0} />

              <Stat
                label="Insufficient evidence"
                value={counts.insufficient_evidence ?? 0}
              />

              <Stat label="High risk" value={counts.high_risk ?? 0} />
            </div>

            <p className="mt-4 break-all text-xs text-zinc-500">
              Analysis ID: {result.analysisId || 'Not available'}
            </p>
          </Card>
        </>
      ) : (
        !job && (
          <Card>
            <Empty
              title="No capture processed yet"
              hint="Choose a PCAP or PCAPNG file to start."
            />
          </Card>
        )
      )}
    </Page>
  );
}
