
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ShieldCheck, Loader2 } from 'lucide-react';

import { useData } from '../context/DataContext.jsx';
import { Badge } from './ui.jsx';

function Content({ device, onClose }) {
  const { alerts, approveDevice } = useData();

  const [approving, setApproving] = useState(false);
  const [approvalError, setApprovalError] = useState('');

  const related = alerts.filter(
    (alert) => alert.deviceId === device.id
  );

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKey);

    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const fields = [
    ['Type', device.type],
    ['IP address', device.ip],
    ['MAC address', device.mac],
    ['Vendor', device.vendor],
    ['Last seen', device.lastSeen],
    ['First seen', device.firstSeen],
    ['Anomaly score', `${Math.round((device.score || 0) * 100)}%`],
  ];

  const handleApprove = async () => {
    const confirmed = window.confirm(
      `Approve ${device.name} (${device.mac}) and add it to approved inventory?`
    );

    if (!confirmed) return;

    setApproving(true);
    setApprovalError('');

    try {
      await approveDevice(device);
    } catch (error) {
      setApprovalError(error.message || 'Device approval failed.');
    } finally {
      setApproving(false);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl">{device.name}</h2>

        <button
          className="btn !p-2"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      <div className="my-3 flex flex-wrap gap-2">
        <Badge value={device.status || 'unknown'} />
        <Badge value={device.risk || 'low'} />
      </div>

      <h3 className="mb-2 mt-5 text-xs uppercase text-zinc-500">
        Device information
      </h3>

      <dl className="text-sm">
        {fields.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-3 border-b border-white/10 py-2"
          >
            <dt className="text-zinc-500">{label}</dt>
            <dd className="max-w-[65%] break-all text-right">
              {value || 'Not available'}
            </dd>
          </div>
        ))}
      </dl>

      <h3 className="mb-3 mt-6 text-xs uppercase text-zinc-500">
        Network connection
      </h3>

      <div className="rounded-xl border border-white/10 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-zinc-400">Connection type</span>
          <Badge value={device.connectionType || 'Unknown'} />
        </div>

        <p className="mb-2 mt-4 text-xs text-zinc-500">
          Connection evidence
        </p>

        {device.connectionEvidence?.length ? (
          <ul className="list-inside list-disc space-y-1 text-sm">
            {device.connectionEvidence.map((evidence, index) => (
              <li key={`${evidence}-${index}`}>{evidence}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">
            No connection evidence available.
          </p>
        )}

        <p className="mt-3 text-xs text-zinc-500">
          Classification is based on packet capture metadata and may not
          establish the device's physical connection.
        </p>
      </div>

      <h3 className="mb-3 mt-6 text-xs uppercase text-zinc-500">
        Authorization
      </h3>

      <div className="rounded-xl border border-white/10 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-zinc-400">Device authorization</span>
          <Badge value={device.authorizationStatus || 'Review Required'} />
        </div>

        <p className="mb-1 mt-4 text-xs text-zinc-500">
          Authorization reason
        </p>

        <p className="text-sm">
          {device.authorizationReason || 'Additional verification is required.'}
        </p>
      </div>

      {device.riskReasons?.length > 0 && (
        <>
          <h3 className="mb-2 mt-6 text-xs uppercase text-zinc-500">
            Risk reasons
          </h3>

          <ul className="list-inside list-disc space-y-1 text-sm text-zinc-300">
            {device.riskReasons.map((reason, index) => (
              <li key={`${reason}-${index}`}>{reason}</li>
            ))}
          </ul>
        </>
      )}

      {device.mismatchFields?.length > 0 && (
        <>
          <h3 className="mb-2 mt-6 text-xs uppercase text-zinc-500">
            Inventory mismatches
          </h3>

          <ul className="list-inside list-disc space-y-1 text-sm text-zinc-300">
            {device.mismatchFields.map((field, index) => (
              <li key={`${field}-${index}`}>{field}</li>
            ))}
          </ul>
        </>
      )}

      {device.status === 'unknown' && (
        <div className="mt-6">
          <button
            className="btn flex w-full items-center justify-center gap-2"
            onClick={handleApprove}
            disabled={approving}
          >
            {approving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                Approve device
              </>
            )}
          </button>

          {approvalError && (
            <p className="mt-3 text-sm text-red-400" role="alert">
              {approvalError}
            </p>
          )}
        </div>
      )}

      <h3 className="mb-2 mt-6 text-xs uppercase text-zinc-500">
        Related alerts
      </h3>

      {related.length ? (
        related.map((alert) => (
          <p key={alert.id} className="mb-2 text-sm">
            {alert.id} · {alert.title}
          </p>
        ))
      ) : (
        <p className="text-sm text-zinc-500">No related alerts</p>
      )}

      <p className="mt-6 text-xs text-zinc-500">
        Approval adds this device to your approved inventory.
        Blocking is not currently supported by the backend API.
      </p>
    </>
  );
}

export default function DeviceDrawer({ device, onClose }) {
  return (
    <AnimatePresence>
      {device && (
        <motion.aside
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: 'tween' }}
          className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto border-l border-white/15 bg-black/95 p-6"
          role="dialog"
          aria-label="Device details"
        >
          <Content device={device} onClose={onClose} />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
