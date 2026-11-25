// Real backend adapter. No endpoints are assumed.
// Implement each function once the Python API is defined, returning the same
// shapes as src/data/mockData.js. Base URL: import.meta.env.VITE_API_BASE_URL
const todo = (name) => async () => {
  throw new Error(`apiAdapter.${name} is not implemented yet`);
};

export const apiAdapter = {
  getDevices: todo('getDevices'),
  getAlerts: todo('getAlerts'),
  getTraffic: todo('getTraffic'),
  getProtocols: todo('getProtocols'),
  setDeviceStatus: todo('setDeviceStatus'), // (id, status)
  setAlertStatus: todo('setAlertStatus'), // (id, status)
  analyzePcap: todo('analyzePcap'), // (file, onStep) => { fileName, packets, hosts, flagged }
};
