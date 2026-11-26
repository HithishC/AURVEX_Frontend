
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const TOKEN_KEY = 'aurvex_access_token';

function authHeaders() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  if (!API_BASE) {
    throw new Error('VITE_API_BASE_URL is not configured.');
  }

  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(isFormData
        ? {}
        : options.body
          ? { 'Content-Type': 'application/json' }
          : {}),
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = Array.isArray(payload.detail)
      ? payload.detail.map((item) => item.msg).join(', ')
      : payload.detail;

    throw new Error(
      detail || payload.message || `Server error (${response.status})`,
    );
  }

  return payload;
}

function getProtocols(device) {
  return (device.protocols || []).map((protocol) =>
    String(protocol).toUpperCase()
  );
}

function isDhcpDevice(device) {
  return getProtocols(device).includes('DHCP');
}

function displayName(device) {
  if (device.hostname?.trim()) return device.hostname;
  if (device.vendor?.trim()) return device.vendor;

  if (isDhcpDevice(device)) return 'DHCP device';

  return device.ip && device.ip !== '0.0.0.0'
    ? device.ip
    : device.mac || 'Unknown device';
}

function displayIp(ip) {
  if (!ip || ip === '0.0.0.0') return 'Not assigned';
  return ip;
}

function normalizeRisk(band, score = 0) {
  const value = String(band || '').toLowerCase();

  if (value.includes('critical')) return 'critical';
  if (value.includes('high')) return 'high';
  if (value.includes('medium')) return 'medium';
  if (value.includes('low')) return 'low';

  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';

  return 'low';
}

function mapDevice(device, approved = false) {
  const score = Number(device.risk_score || 0);
  const backendStatus = String(device.status || '').toLowerCase();
  const dhcp = isDhcpDevice(device);

  return {
    id: device.mac || device.ip || `${device.hostname || 'unknown'}-${device.first_seen || ''}`,
    name: displayName(device),
    type: dhcp ? 'DHCP' : 'Device',

    ip: displayIp(device.ip),
    mac: device.mac || 'Unknown',
    vendor: device.vendor?.trim() || 'Unknown',

    status: approved || backendStatus === 'known'
      ? 'approved'
      : backendStatus === 'changed'
        ? 'changed'
        : backendStatus === 'insufficient evidence'
          ? 'insufficient evidence'
          : 'unknown',

    risk: normalizeRisk(device.risk_band, score),
    score: score / 100,

    lastSeen: device.last_seen || device.updated_at || 'Not available',

    ports: device.ports || device.observed_ports || [],
    protocols: device.protocols || [],

    riskReasons: device.risk_reasons || [],
    mismatchFields: device.mismatch_fields || [],
    observations: device.observations || 0,
    firstSeen: device.first_seen || null,
  };
}

function mapAlert(alert) {
  const score = Number(alert.risk_score || 0);
  const severity = normalizeRisk(alert.risk_band, score);

  const reasons = Array.isArray(alert.risk_reasons)
    ? alert.risk_reasons
    : Array.isArray(alert.reasons)
      ? alert.reasons
      : [];

  return {
    id: String(alert.id),
    deviceId: alert.mac,
    severity,
    title: `${alert.status || 'Network'} device detected`,
    time: alert.created_at || 'Time unavailable',
    detail: reasons.length
      ? reasons.join(', ')
      : `Backend detection status: ${alert.status || 'Unknown'}. Risk score: ${score}.`,
    action: 'Review this device and compare its observed details with the approved inventory.',
    status: 'open',
  };
}

async function getLatestAnalysis() {
  const history = await request('/api/analyses?limit=1');
  const latest = history.analyses?.[0];

  if (!latest?.id) return null;

  return request(`/api/analyses/${encodeURIComponent(latest.id)}`);
}

async function getDevices() {
  const [inventoryResponse, latestAnalysis] = await Promise.all([
    request('/api/inventory'),
    getLatestAnalysis(),
  ]);

  const approvedDevices = inventoryResponse.devices || [];
  const approvedMacs = new Set(
    approvedDevices.map((device) => String(device.mac || '').toLowerCase())
  );

  const deviceMap = new Map();

  for (const device of approvedDevices) {
    const mapped = mapDevice(device, true);
    if (mapped.id) deviceMap.set(mapped.id, mapped);
  }

  for (const result of latestAnalysis?.results || []) {
    const isApproved = approvedMacs.has(
      String(result.mac || '').toLowerCase()
    );

    const mapped = mapDevice(result, isApproved);

    if (!mapped.id) continue;

    deviceMap.set(mapped.id, mapped);
  }

  return [...deviceMap.values()];
}

async function getAlerts() {
  const response = await request('/api/alerts?limit=100');
  return (response.alerts || []).map(mapAlert);
}

async function approveDevice(device) {
  if (!device.mac || device.mac === 'Unknown') {
    throw new Error('Cannot approve this device because its MAC address is missing.');
  }

  const payload = {
    mac: device.mac,
    ip: device.ip === 'Not assigned' ? '' : device.ip,
    hostname: device.name === 'DHCP device' ? '' : device.name,
    vendor: device.vendor === 'Unknown' ? '' : device.vendor,
    ports: device.ports || [],
    protocols: device.protocols || [],
    allowed_ports: [],
  };

  return request('/api/inventory', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function analyzePcap(file, onStep = () => {}) {
  const formData = new FormData();
  formData.append('file', file);

  onStep('Uploading capture to server', 10);

  const result = await request('/api/analyze/pcap', {
    method: 'POST',
    body: formData,
  });

  onStep('Analysis completed', 100);

  const counts = result.counts || {};

  return {
    fileName: result.source_name || file.name,
    observations: Number(result.observation_rows || 0),
    hosts: Number(counts.total || result.results?.length || 0),
    flagged: Number(
      (counts.unknown || 0) +
      (counts.changed || 0) +
      (counts.insufficient_evidence || 0)
    ),
    analysisId: result.analysis_id,
    counts,
    results: result.results || [],
    graph: result.graph || { nodes: [], edges: [] },
  };
}

export const apiAdapter = {
  getDevices,
  getAlerts,
  approveDevice,

  getTraffic: async () => [],
  getProtocols: async () => [],

  setDeviceStatus: async () => {
    throw new Error('Device status updates are not supported by the backend yet.');
  },

  setAlertStatus: async () => {
    throw new Error('Alert status updates are not supported by the backend yet.');
  },

  analyzePcap,
};
