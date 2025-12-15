export interface ServiceNode {
  id: string;
  name: string;
  type: 'auth' | 'data' | 'cache' | 'compute';
  load: number; // 0-100
  latency: number; // ms
  weight: number; // 0-1 (For neuromorphic)
  active: boolean; // Is currently processing
  failed: boolean; // Simulates a crashed service
}

export interface RoutingStats {
  avgLatency: number;
  p95Latency: number;
  throughput: number; // req/sec
  successRate: number; // percentage
  totalRequests: number;
}

export interface SimulationState {
  isRunning: boolean;
  elapsedTime: number;
  traditional: {
    nodes: ServiceNode[];
    stats: RoutingStats;
    currentPathIndex: number; // For round robin
  };
  neuromorphic: {
    nodes: ServiceNode[];
    stats: RoutingStats;
    lastWinnerId: string | null; // For STDP visualization
  };
  history: {
    timestamp: string;
    tradLatency: number;
    neuroLatency: number;
    tradThroughput: number;
    neuroThroughput: number;
  }[];
}