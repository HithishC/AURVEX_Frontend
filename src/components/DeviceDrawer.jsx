import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { Badge } from './ui.jsx';

function Content({ device, onClose }) {
  const { setDeviceStatus, alerts } = useData();
  const related = alerts.filter((a) => a.deviceId === device.id);
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  const fields = [['Type', device.type], ['IP', device.ip], ['MAC', device.mac], ['Vendor', device.vendor], ['Last seen', device.lastSeen], ['Anomaly score', device.score]];
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl">{device.name}</h2>
        <button className="btn !p-2" onClick={onClose} aria-label="Close"><X size={16} /></button>
      </div>
      <div className="my-3 flex gap-2"><Badge value={device.status} /><Badge value={device.risk} /></div>
      <dl className="text-sm">
        {fields.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-white/10 py-2"><dt className="text-zinc-500">{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
      <h3 className="mt-5 mb-2 text-xs uppercase text-zinc-500">Related alerts</h3>
      {related.length ? related.map((a) => <p key={a.id} className="mb-2 text-sm">{a.id} · {a.title}</p>) : <p className="text-sm text-zinc-500">None</p>}
      <div className="mt-6 flex gap-3">
        <button className="btn btn-solid" disabled={device.status === 'approved'} onClick={() => setDeviceStatus(device.id, 'approved')}>Approve</button>
        <button className="btn" disabled={device.status === 'blocked' || device.type === 'Gateway'} onClick={() => setDeviceStatus(device.id, 'blocked')}>Mark blocked</button>
      </div>
      <p className="mt-3 text-xs text-zinc-500">Demonstration only. No real device is changed.</p>
    </>
  );
}

export default function DeviceDrawer({ device, onClose }) {
  return (
    <AnimatePresence>
      {device && (
        <motion.aside initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ type: 'tween' }}
          className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto border-l border-white/15 bg-black/95 p-6" role="dialog" aria-label="Device details">
          <Content device={device} onClose={onClose} />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
