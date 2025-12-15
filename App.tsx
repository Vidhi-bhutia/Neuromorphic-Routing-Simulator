import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Activity, BrainCircuit, Zap, AlertOctagon, Power } from 'lucide-react';
import { SimulationState } from './types';
import { SIMULATION_TICK_MS, INITIAL_SERVICES } from './constants';
import { getInitialState, tickSimulation } from './services/simulationEngine';

// Components
import SimulationVisualizer from './components/SimulationVisualizer';
import MetricsCard from './components/MetricsCard';
import ChartSection from './components/ChartSection';

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState>(getInitialState());
  const [failedNodes, setFailedNodes] = useState<Record<string, boolean>>({});
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (state.isRunning) {
      timerRef.current = window.setInterval(() => {
        setState((prev) => tickSimulation(prev, failedNodes));
      }, SIMULATION_TICK_MS);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isRunning, failedNodes]);

  const toggleSimulation = () => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const resetSimulation = () => {
    setState(getInitialState());
    setFailedNodes({});
  };

  const toggleNodeFailure = (id: string) => {
    setFailedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Derived Stats for Summary
  const latencyImprovement = state.history.length > 5 
    ? ((1 - (state.neuromorphic.stats.avgLatency / Math.max(1, state.traditional.stats.avgLatency))) * 100).toFixed(0)
    : '0';
  
  const throughputGain = state.history.length > 5
    ? ((state.neuromorphic.stats.throughput / Math.max(1, state.traditional.stats.throughput)) * 100 - 100).toFixed(0)
    : '0';
  
  const successDiff = (state.neuromorphic.stats.successRate - state.traditional.stats.successRate).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3 mb-2">
            <BrainCircuit className="text-orange-500" size={40} strokeWidth={2.5} />
            Neuromorphic Routing Simulator
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-3xl">
            A visual comparison of <span className="font-bold text-sky-600">Static Round-Robin</span> vs. <span className="font-bold text-orange-600">Adaptive Spike-Timing</span> routing protocols under load and failure conditions.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border-2 border-slate-200">
          <div className="px-4 font-mono font-bold text-slate-700 text-lg border-r-2 border-slate-100">
            {new Date(state.elapsedTime * 1000).toISOString().substr(11, 8)}
          </div>
          <button 
            onClick={toggleSimulation}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-sm ${state.isRunning ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}
          >
            {state.isRunning ? <><Pause size={20} fill="currentColor" /> PAUSE</> : <><Play size={20} fill="currentColor" /> START SIMULATION</>}
          </button>
          <button 
            onClick={resetSimulation}
            className="p-3 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all font-bold"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      {/* --- CHAOS CONTROL PANEL --- */}
      <section className="mb-8 bg-slate-100 rounded-xl p-4 border border-slate-200">
        <div className="flex flex-col md:flex-row items-center gap-4">
           <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-wider text-sm mr-4">
              <AlertOctagon size={18} /> Chaos Control
           </div>
           <div className="flex flex-wrap gap-3">
             {INITIAL_SERVICES.map(s => (
               <button
                 key={s.id}
                 onClick={() => toggleNodeFailure(s.id)}
                 className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                   failedNodes[s.id] 
                   ? 'bg-red-500 border-red-500 text-white shadow-red-200 shadow-lg' 
                   : 'bg-white border-slate-300 text-slate-600 hover:border-red-300 hover:text-red-500'
                 }`}
               >
                 <Power size={14} />
                 {failedNodes[s.id] ? `RESTORE ${s.name}` : `KILL ${s.name}`}
               </button>
             ))}
           </div>
           <div className="ml-auto text-xs text-slate-500 font-medium hidden md:block">
             * Clicking 'Kill' simulates a total service outage. Watch the Success Rate difference.
           </div>
        </div>
      </section>

      {/* --- LIVE SIMULATION VISUALS --- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-sky-600 uppercase tracking-wide flex items-center gap-2">
              <Activity size={24} /> Traditional Routing
            </h2>
            <span className="text-xs font-bold px-3 py-1 bg-sky-100 text-sky-800 rounded-full">ROUND ROBIN</span>
          </div>
          <SimulationVisualizer 
            type="traditional" 
            nodes={state.traditional.nodes} 
            activePathIndex={state.traditional.currentPathIndex}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-orange-600 uppercase tracking-wide flex items-center gap-2">
              <BrainCircuit size={24} /> Neuromorphic Routing
            </h2>
            <span className="text-xs font-bold px-3 py-1 bg-orange-100 text-orange-800 rounded-full border border-orange-200">ADAPTIVE STDP</span>
          </div>
          <SimulationVisualizer 
            type="neuromorphic" 
            nodes={state.neuromorphic.nodes}
            lastWinnerId={state.neuromorphic.lastWinnerId}
          />
        </div>
      </div>

      {/* --- METRICS COMPARISON --- */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <MetricsCard 
          title="Traditional Metrics" 
          subtitle="Static Logic"
          stats={state.traditional.stats} 
          type="traditional" 
          icon={Activity} 
        />
        <MetricsCard 
          title="Neuromorphic Metrics" 
          subtitle="Adaptive Logic"
          stats={state.neuromorphic.stats} 
          type="neuromorphic" 
          icon={BrainCircuit} 
        />
      </div>

      {/* --- CHARTS --- */}
      <ChartSection history={state.history} />

      {/* --- RESULTS SUMMARY --- */}
      <section className="mt-12 bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        {/* Decorative BG */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500 opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
          <div className="max-w-xl">
            <h3 className="text-3xl font-black mb-4 flex items-center gap-3">
              <Zap className="text-yellow-400" fill="currentColor" /> 
              Key Findings
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed font-medium">
              The Neuromorphic model demonstrates superior resilience. When a node fails (simulated via Chaos Control), 
              the traditional model blindly routes 25% of traffic to the dead node, causing a 25% failure rate. 
              The <span className="text-orange-400 font-bold">STDP model</span> rapidly "punishes" the failed path, 
              reducing its selection probability to near zero within seconds.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-8 md:gap-12 w-full md:w-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-emerald-400 mb-2">{latencyImprovement}%</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Faster Response</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-sky-400 mb-2">{throughputGain}%</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">More Requests</div>
            </div>
             <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-orange-400 mb-2">+{successDiff}%</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reliability</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;