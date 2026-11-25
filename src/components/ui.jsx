import { motion } from 'framer-motion';
import { Inbox, Loader2, Search } from 'lucide-react';

export function Page({ title, subtitle, actions, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-light uppercase tracking-wider">{title}</h1>
          <p className="text-sm text-zinc-400">{subtitle}</p>
        </div>
        {actions}
      </header>
      {children}
    </motion.div>
  );
}

export const Card = ({ title, className = '', children }) => (
  <section className={`glass p-5 ${className}`}>
    {title && <h2 className="mb-4 text-sm uppercase tracking-widest text-zinc-400">{title}</h2>}
    {children}
  </section>
);

export const Stat = ({ label, value, note }) => (
  <Card>
    <p className="text-xs uppercase tracking-widest text-zinc-400">{label}</p>
    <p className="mt-2 text-4xl font-light">{value}</p>
    {note && <p className="mt-1 text-xs text-zinc-500">{note}</p>}
  </Card>
);

// Monochrome severity: shown by weight and fill, with the word always visible.
const levels = {
  critical: 'bg-white text-black border-white font-semibold',
  high: 'border-white text-white font-semibold',
  unknown: 'border-dashed border-white text-white',
  medium: 'border-zinc-500 text-zinc-300',
};
export const Badge = ({ value }) => (
  <span className={`rounded-full border px-2.5 py-0.5 text-xs uppercase ${levels[value] || 'border-zinc-700 text-zinc-500'}`}>{value}</span>
);

export const SearchBox = ({ value, onChange, placeholder = 'Search' }) => (
  <label className="relative">
    <Search size={15} className="absolute left-3 top-3 text-zinc-500" />
    <input className="field !pl-9" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
  </label>
);

export const Select = ({ label, value, onChange, options }) => (
  <select className="field" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="all">All {label}</option>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

export const Loading = () => (
  <div role="status" className="flex min-h-60 items-center justify-center gap-3 text-zinc-400">
    <Loader2 className="animate-spin" /> Loading
  </div>
);

export const Empty = ({ title = 'Nothing found', hint = 'Try a different search or filter.' }) => (
  <div className="py-10 text-center text-zinc-500">
    <Inbox className="mx-auto mb-3" />
    <p className="text-zinc-300">{title}</p>
    <p className="text-sm">{hint}</p>
  </div>
);

export const chart = {
  grid: { stroke: '#27272a', vertical: false },
  axis: { stroke: '#71717a', fontSize: 11, tickLine: false },
  tooltip: { contentStyle: { background: '#09090b', border: '1px solid #3f3f46', borderRadius: 12 }, itemStyle: { color: '#fff' }, cursor: { stroke: '#52525b', fill: '#ffffff10' } },
};
