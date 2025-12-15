import { ServiceNode } from './types';

export const SIMULATION_TICK_MS = 1000;
export const ANIMATION_DURATION_MS = 800;

export const INITIAL_SERVICES: ServiceNode[] = [
  { id: 's1', name: 'Auth Service', type: 'auth', load: 10, latency: 45, weight: 0.25, active: false, failed: false },
  { id: 's2', name: 'Data Store', type: 'data', load: 25, latency: 120, weight: 0.25, active: false, failed: false },
  { id: 's3', name: 'Redis Cache', type: 'cache', load: 5, latency: 15, weight: 0.25, active: false, failed: false },
  { id: 's4', name: 'Compute Node', type: 'compute', load: 40, latency: 85, weight: 0.25, active: false, failed: false },
];

export const COLORS = {
  traditional: '#0ea5e9', // Sky-500
  traditionalLight: '#e0f2fe',
  neuromorphic: '#f97316', // Orange-500 (Vibrant, Electric)
  neuromorphicLight: '#ffedd5', // Orange-100
  text: '#0f172a', // Slate-900
  subtext: '#334155', // Slate-700
  success: '#10b981', // Emerald-500
  danger: '#ef4444', // Red-500 (Only for failure)
  lineInactive: '#cbd5e1', // Visible Grey
};

export const INITIAL_STATS = {
  avgLatency: 0,
  p95Latency: 0,
  throughput: 0,
  successRate: 100,
  totalRequests: 0,
};