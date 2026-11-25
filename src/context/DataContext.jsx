import { createContext, useCallback, useContext, useEffect, useState } from 'react';
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
    setData(null);
    setError('');
    try {
      const [devices, alerts, traffic, protocols] = await Promise.all([
        api.getDevices(), api.getAlerts(), api.getTraffic(), api.getProtocols(),
      ]);
      setData({ devices, alerts, traffic, protocols });
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = async (key, call, id, status) => {
    try {
      await call(id, status);
      setData((d) => ({ ...d, [key]: d[key].map((x) => (x.id === id ? { ...x, status } : x)) }));
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) {
    return <div className="p-10"><Empty title="Could not load data" hint={error} /><div className="text-center"><button className="btn" onClick={load}>Retry</button></div></div>;
  }
  if (!data) return <Loading />;

  const value = {
    ...data,
    reload: load,
    select: setSelectedId,
    setDeviceStatus: (id, s) => update('devices', api.setDeviceStatus, id, s),
    setAlertStatus: (id, s) => update('alerts', api.setAlertStatus, id, s),
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <DeviceDrawer device={data.devices.find((d) => d.id === selectedId)} onClose={() => setSelectedId(null)} />
    </Ctx.Provider>
  );
}
