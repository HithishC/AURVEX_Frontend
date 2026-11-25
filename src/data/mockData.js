// DEMONSTRATION DATA ONLY. Nothing here was captured from a real network.
const row = (id, name, type, ip, mac, vendor, status, risk, score, lastSeen) =>
  ({ id, name, type, ip, mac, vendor, status, risk, score, lastSeen });

// "score" is an illustrative anomaly score from 0 to 1 (higher = more unusual).
export const devices = [
  row('d01', 'Core Gateway', 'Gateway', '192.168.1.1', '02:00:5E:10:00:01', 'Demo Networks', 'approved', 'low', 0.31, '2026-11-26 03:40'),
  row('d02', 'Finance Laptop', 'Laptop', '192.168.1.12', '02:00:5E:10:00:12', 'Demo Compute', 'approved', 'low', 0.38, '2026-11-26 03:39'),
  row('d03', 'Payment Terminal 1', 'POS', '192.168.1.20', '02:00:5E:10:00:20', 'Demo Pay', 'approved', 'low', 0.41, '2026-11-26 03:38'),
  row('d04', 'Payment Terminal 2', 'POS', '192.168.1.21', '02:00:5E:10:00:21', 'Demo Pay', 'approved', 'medium', 0.58, '2026-11-26 03:37'),
  row('d05', 'Database Server', 'Server', '192.168.1.30', '02:00:5E:10:00:30', 'Demo Compute', 'approved', 'low', 0.36, '2026-11-26 03:40'),
  row('d06', 'Office Printer', 'Printer', '192.168.1.41', '02:00:5E:10:00:41', 'Demo Print', 'approved', 'low', 0.29, '2026-11-26 02:55'),
  row('d07', 'Lobby Camera', 'Camera', '192.168.1.52', '02:00:5E:10:00:52', 'Demo Vision', 'approved', 'medium', 0.55, '2026-11-26 03:31'),
  row('d08', 'Admin Workstation', 'Laptop', '192.168.1.60', '02:00:5E:10:00:60', 'Demo Compute', 'approved', 'low', 0.34, '2026-11-26 03:36'),
  row('d09', 'Unidentified host', 'Unknown', '192.168.1.87', '06:1A:9F:3C:77:B2', 'Unresolved', 'unknown', 'critical', 0.86, '2026-11-26 03:40'),
  row('d10', 'Unlisted access point', 'Access Point', '192.168.1.99', '0A:44:D1:08:5E:19', 'Unresolved', 'unknown', 'high', 0.74, '2026-11-26 03:33'),
  row('d11', 'Unidentified phone', 'Phone', '192.168.1.104', '0E:72:4B:AA:10:C8', 'Unresolved', 'unknown', 'medium', 0.61, '2026-11-26 03:12'),
];

const alert = (id, severity, title, deviceId, time, detail, action) =>
  ({ id, severity, title, deviceId, time, detail, action, status: 'open' });

export const alerts = [
  alert('A-1006', 'critical', 'Unknown host contacting database server', 'd09', '2026-11-26 03:36', 'Repeated connection attempts from an unapproved address to the database server.', 'Isolate the host and review database access logs.'),
  alert('A-1005', 'high', 'Possible rogue access point', 'd10', '2026-11-26 03:21', 'An access point that is not in the inventory appeared on the local network.', 'Locate the device physically and disconnect it if unauthorised.'),
  alert('A-1004', 'medium', 'Unapproved phone joined network', 'd11', '2026-11-26 03:12', 'A new MAC address requested a network lease.', 'Confirm the owner, then approve or block.'),
  alert('A-1003', 'medium', 'Unusual outbound volume', 'd04', '2026-11-26 02:48', 'Payment terminal sent more data than its demo baseline.', 'Compare destinations with the payment provider list.'),
  alert('A-1002', 'medium', 'Off-hours camera traffic', 'd07', '2026-11-26 02:05', 'Camera traffic pattern differs from its demo baseline.', 'Check camera firmware and configuration.'),
  alert('A-1001', 'low', 'Printer reconnected', 'd06', '2026-11-26 01:30', 'Printer left and rejoined the network.', 'No action needed unless it repeats.'),
];

export const traffic = Array.from({ length: 24 }, (_, h) => {
  const inbound = Math.round(220 + 130 * Math.sin((h - 6) / 3.8) + (h % 5) * 14);
  return { time: `${String(h).padStart(2, '0')}:00`, inbound, outbound: Math.round(inbound * 0.62 + (h % 3) * 21) };
});

export const protocols = [
  { name: 'HTTPS', value: 54 }, { name: 'DNS', value: 17 }, { name: 'TCP other', value: 16 },
  { name: 'UDP other', value: 9 }, { name: 'ARP', value: 4 },
];
