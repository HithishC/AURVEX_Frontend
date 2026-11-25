import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { api, isDemo } from '../services/api.js';
import { Card, Empty, Page, Stat } from '../components/ui.jsx';

const MAX_MB = 100;
// First four bytes of classic pcap (both byte orders, micro/nanosecond) and pcapng.
const MAGIC = ['d4c3b2a1', 'a1b2c3d4', '4d3cb2a1', 'a1b23c4d', '0a0d0d0a'];

async function validate(file) {
  if (!/\.(pcap|pcapng|cap)$/i.test(file.name)) return 'Only .pcap, .pcapng or .cap files are accepted.';
  if (file.size > MAX_MB * 1024 * 1024) return `File is larger than ${MAX_MB} MB.`;
  const bytes = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  const head = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return MAGIC.includes(head) ? '' : 'This does not look like a packet capture (header mismatch).';
}

export default function Pcap() {
  const [error, setError] = useState('');
  const [job, setJob] = useState(null);
  const [result, setResult] = useState(null);
  const busy = job !== null && !result;

  const handle = async (file) => {
    if (!file || busy) return;
    setError(''); setResult(null); setJob(null);
    const problem = await validate(file);
    if (problem) { setError(problem); return; }
    try {
      setJob({ step: 'Starting', pct: 0 });
      setResult(await api.analyzePcap(file, (step, pct) => setJob({ step, pct })));
    } catch (e) {
      setJob(null); setError(e.message);
    }
  };

  return (
    <Page title="PCAP analysis" subtitle={isDemo ? 'Simulated processing: your file stays in the browser and is not analysed.' : 'Upload a capture for analysis'}>
      <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handle(e.dataTransfer.files[0]); }}
        className="glass block cursor-pointer !border-dashed p-12 text-center hover:!border-white focus-within:!border-white">
        <UploadCloud className="mx-auto mb-3" size={36} />
        <p>Drop a capture file here, or click to choose</p>
        <p className="text-xs text-zinc-500">.pcap, .pcapng, .cap up to {MAX_MB} MB</p>
        <input type="file" accept=".pcap,.pcapng,.cap" className="sr-only" disabled={busy} onChange={(e) => { handle(e.target.files[0]); e.target.value = ''; }} />
      </label>
      {error && <p role="alert" className="rounded-xl border border-white p-3 text-sm">Error: {error}</p>}
      {job && (
        <Card title="Processing status">
          <p className="mb-2 text-sm">{job.step} · {job.pct}%</p>
          <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-white transition-all" style={{ width: `${job.pct}%` }} /></div>
        </Card>
      )}
      {result ? (
        <>
          <p className="text-sm text-zinc-400">{isDemo ? 'Sample results (not computed from your file)' : 'Results'} for {result.fileName}</p>
          <div className="grid gap-4 sm:grid-cols-3"><Stat label="Packets" value={result.packets} /><Stat label="Hosts" value={result.hosts} /><Stat label="Flagged" value={result.flagged} /></div>
        </>
      ) : !job && <Card><Empty title="No capture processed yet" hint="Choose a file to start." /></Card>}
    </Page>
  );
}
