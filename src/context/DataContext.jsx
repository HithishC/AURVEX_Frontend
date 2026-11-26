
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { api } from '../services/api.js';
import { Loading, Empty } from '../components/ui.jsx';
import DeviceDrawer from '../components/DeviceDrawer.jsx';

const Ctx = createContext(null);

export const useData = () => useContext(Ctx);

export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    setError('');

    try {
      const [devices, alerts, traffic, protocols] = await Promise.all([
        api.getDevices(),
        api.getAlerts(),
        api.getTraffic(),
        api.getProtocols(),
      ]);

      setData({ devices, alerts, traffic, protocols });
    } catch (e) {
      setError(e.message || 'Unable to load data.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (key, call, id, status) => {
    try {
      await call(id, status);

      setData((current) => ({
        ...current,
        [key]: current[key].map((item) =>
          item.id === id ? { ...item, status } : item
        ),
      }));
    } catch (e) {
      setError(e.message);
    }
  };

  const approveDevice = async (device) => {
    try {
      await api.approveDevice(device);
      await load();
      setSelectedId(null);
    } catch (e) {
      setError(e.message || 'Could not approve device.');
      throw e;
    }
  };

  if (error && !data) {
    return (
      <div className="p-10">
        <Empty title="Could not load data" hint={error} />
        <div className="text-center">
          <button className="btn" onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return <Loading />;

  const value = {
    ...data,
    reload: load,
    select: setSelectedId,
    approveDevice,

    setDeviceStatus: (id, status) =>
      update('devices', api.setDeviceStatus, id, status),

    setAlertStatus: (id, status) =>
      update('alerts', api.setAlertStatus, id, status),
  };

  return (
    <Ctx.Provider value={value}>
      {children}

      <DeviceDrawer
        device={data.devices.find((device) => device.id === selectedId)}
        onClose={() => setSelectedId(null)}
      />
    </Ctx.Provider>
  );
}
