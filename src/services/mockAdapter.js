import * as db from '../data/mockData.js';

const reply = (value) => new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), 400));

export const mockAdapter = {
  getDevices: () => reply(db.devices),
  getAlerts: () => reply(db.alerts),
  getTraffic: () => reply(db.traffic),
  getProtocols: () => reply(db.protocols),
  setDeviceStatus: (id, status) => reply({ id, status }),
  setAlertStatus: (id, status) => reply({ id, status }),
  // Simulation only: the file is never uploaded or parsed.
  async analyzePcap(file, onStep) {
    const steps = ['Uploading', 'Parsing packets', 'Extracting features', 'Scoring', 'Complete'];
    for (let i = 0; i < steps.length; i += 1) {
      onStep(steps[i], Math.round(((i + 1) / steps.length) * 100));
      await reply(null);
    }
    return { fileName: file.name, packets: 18432, hosts: 11, flagged: 3 };
  },
};
