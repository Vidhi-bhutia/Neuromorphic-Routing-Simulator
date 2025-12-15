import { ServiceNode, SimulationState } from '../types';
import { INITIAL_SERVICES, INITIAL_STATS } from '../constants';

// Helper to generate a random normal distribution number
const randomNormal = (mean: number, stdDev: number) => {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
};

const updateNodeLatency = (node: ServiceNode, volatility: number): number => {
  if (node.failed) return 3000; // High penalty for failure

  // Simulate network jitter and load impact
  const baseLatency = node.type === 'cache' ? 15 : node.type === 'auth' ? 45 : node.type === 'compute' ? 85 : 120;
  const loadFactor = (node.load / 100) * 50; 
  const jitter = randomNormal(0, volatility);
  return Math.max(5, baseLatency + loadFactor + jitter);
};

export const getInitialState = (): SimulationState => ({
  isRunning: false,
  elapsedTime: 0,
  traditional: {
    nodes: JSON.parse(JSON.stringify(INITIAL_SERVICES)),
    stats: { ...INITIAL_STATS },
    currentPathIndex: 0,
  },
  neuromorphic: {
    nodes: JSON.parse(JSON.stringify(INITIAL_SERVICES)),
    stats: { ...INITIAL_STATS },
    lastWinnerId: null,
  },
  history: [],
});

export const tickSimulation = (currentState: SimulationState, failedNodesOverrides: Record<string, boolean> = {}): SimulationState => {
  if (!currentState.isRunning) return currentState;

  const newState = { ...currentState };
  newState.elapsedTime += 1;

  // Sync failure state from overrides (Chaos Control)
  const applyFailures = (nodes: ServiceNode[]) => {
    nodes.forEach(node => {
      if (failedNodesOverrides[node.id] !== undefined) {
        node.failed = failedNodesOverrides[node.id];
      }
    });
  };
  applyFailures(newState.traditional.nodes);
  applyFailures(newState.neuromorphic.nodes);

  // --- Traditional Routing (Round Robin) ---
  const tNodes = newState.traditional.nodes;
  const tIndex = (newState.traditional.currentPathIndex + 1) % tNodes.length;
  newState.traditional.currentPathIndex = tIndex;
  
  tNodes.forEach((node, idx) => {
    const isSelected = idx === tIndex;
    node.active = isSelected;
    if (isSelected && !node.failed) node.load = Math.min(100, node.load + 5); 
    else node.load = Math.max(0, node.load - 2);
    
    node.latency = updateNodeLatency(node, 20);
  });

  const tSelectedNode = tNodes[tIndex];
  
  // Stats
  const tStats = newState.traditional.stats;
  tStats.totalRequests++;
  
  // Calculate Success (Failed node = 0 success)
  const tCurrentSuccess = tSelectedNode.failed ? 0 : (tSelectedNode.load > 90 ? 0.8 : 1.0);
  
  // Traditional stats accumulate failures quickly because it blindly hits the failed node
  tStats.successRate = (tStats.successRate * 0.95) + (tCurrentSuccess * 100 * 0.05);

  tStats.avgLatency = (tStats.avgLatency * 0.9) + (tSelectedNode.latency * 0.1); 
  const tCurrentThroughput = tSelectedNode.failed ? 0 : Math.min(1000, 1000 / Math.max(1, tStats.avgLatency)) * 5;
  tStats.throughput = (tStats.throughput * 0.9) + (tCurrentThroughput * 0.1);


  // --- Neuromorphic Routing (Spike-Timing / Winner-Takes-All) ---
  const nNodes = newState.neuromorphic.nodes;
  
  // 1. Select Winner
  // Increased exponent from 5 to 12. This makes the selection much "stricter".
  // If a node has slightly lower weight (due to failure), its probability drops to near zero instantly.
  const totalWeight = nNodes.reduce((sum, n) => sum + Math.exp(n.weight * 12), 0);
  let random = Math.random() * totalWeight;
  let winnerIndex = 0;
  for (let i = 0; i < nNodes.length; i++) {
    random -= Math.exp(nNodes[i].weight * 12);
    if (random <= 0) {
      winnerIndex = i;
      break;
    }
  }

  newState.neuromorphic.lastWinnerId = nNodes[winnerIndex].id;

  nNodes.forEach((node, idx) => {
    const isSelected = idx === winnerIndex;
    node.active = isSelected;
    
    if (isSelected && !node.failed) node.load = Math.min(100, node.load + 5);
    else node.load = Math.max(0, node.load - 2);

    node.latency = updateNodeLatency(node, 20);

    // --- STDP Learning ---
    const targetLatency = 40; 
    let delta = targetLatency - node.latency;
    
    // HEAVY PUNISHMENT FOR FAILURE
    if (node.failed) {
        delta = -1000; // Massive penalty
    }

    const eta = 0.1; // Learning rate increased to adapt faster
    
    if (isSelected) {
        node.weight = Math.max(0.001, Math.min(0.999, node.weight + (delta * 0.001 * eta)));
    } else {
        // If not selected, weight remains mostly static or decays slightly
        // If failed, we want it to stay low, so don't decay upwards
        node.weight = Math.max(0.001, node.weight * 0.999);
    }
  });

  // Re-normalize
  const weightSum = nNodes.reduce((acc, n) => acc + n.weight, 0);
  nNodes.forEach(n => n.weight /= weightSum);

  const nSelectedNode = nNodes[winnerIndex];

  // Stats
  const nStats = newState.neuromorphic.stats;
  nStats.totalRequests++;
  
  // Since Neuro avoids failed nodes, nCurrentSuccess stays high
  const nCurrentSuccess = nSelectedNode.failed ? 0 : (nSelectedNode.load > 95 ? 0.9 : 1.0);
  nStats.successRate = (nStats.successRate * 0.95) + (nCurrentSuccess * 100 * 0.05);

  nStats.avgLatency = (nStats.avgLatency * 0.9) + (nSelectedNode.latency * 0.1);
  const nCurrentThroughput = nSelectedNode.failed ? 0 : Math.min(1000, 1000 / Math.max(1, nStats.avgLatency)) * 6.5;
  nStats.throughput = (nStats.throughput * 0.9) + (nCurrentThroughput * 0.1);

  // --- History ---
  if (newState.elapsedTime % 2 === 0) {
    newState.history = [
      ...newState.history.slice(-30),
      {
        timestamp: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
        tradLatency: Math.round(tStats.avgLatency),
        neuroLatency: Math.round(nStats.avgLatency),
        tradThroughput: Math.round(tStats.throughput),
        neuroThroughput: Math.round(nStats.throughput),
      },
    ];
  }

  return newState;
};