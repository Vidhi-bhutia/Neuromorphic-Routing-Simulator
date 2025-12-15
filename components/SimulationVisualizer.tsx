import React from 'react';
import { Network, Database, Server, Cpu, Lock, XCircle } from 'lucide-react';
import { ServiceNode } from '../types';
import { COLORS } from '../constants';

interface Props {
  type: 'traditional' | 'neuromorphic';
  nodes: ServiceNode[];
  activePathIndex?: number; // For traditional
  lastWinnerId?: string | null; // For neuro
}

const SimulationVisualizer: React.FC<Props> = ({ type, nodes, activePathIndex, lastWinnerId }) => {
  const isNeuro = type === 'neuromorphic';
  const primaryColor = isNeuro ? COLORS.neuromorphic : COLORS.traditional;
  const secondaryColor = isNeuro ? COLORS.neuromorphicLight : COLORS.traditionalLight;

  const getIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'auth': return <Lock size={20} strokeWidth={2.5} />;
      case 'data': return <Database size={20} strokeWidth={2.5} />;
      case 'cache': return <Server size={20} strokeWidth={2.5} />;
      case 'compute': return <Cpu size={20} strokeWidth={2.5} />;
      default: return <Server size={20} strokeWidth={2.5} />;
    }
  };

  // Fixed coordinate system for reliable SVG paths
  const WIDTH = 600;
  const HEIGHT = 300;
  const GATEWAY_X = 60;
  const GATEWAY_Y = HEIGHT / 2;
  const END_X = 480;

  return (
    <div className="relative h-72 w-full bg-white rounded-xl border-2 border-slate-200 shadow-sm p-4 flex items-center justify-between overflow-hidden">
      
      {/* --- SVG LAYER --- */}
      {/* We use a fixed viewBox to ensure coordinates for paths and animations match perfectly */}
      <div className="absolute inset-0 w-full h-full z-0">
        <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
          
          <defs>
             {/* Gradient for active lines */}
             <linearGradient id={`grad-${type}`} x1="0%" y1="0%" x2="100%" y2="0%">
               <stop offset="0%" stopColor={primaryColor} stopOpacity="0.2" />
               <stop offset="50%" stopColor={primaryColor} stopOpacity="1" />
               <stop offset="100%" stopColor={primaryColor} stopOpacity="0.2" />
             </linearGradient>
          </defs>

          {nodes.map((node, index) => {
            const isActive = isNeuro ? node.id === lastWinnerId : index === activePathIndex;
            const isFailed = node.failed;
            
            // Calculate destination Y based on index (distribute vertically)
            const gap = HEIGHT / (nodes.length + 1);
            const endY = gap * (index + 1);

            // Bezier Control Points
            const cp1X = GATEWAY_X + (END_X - GATEWAY_X) * 0.4;
            const cp2X = GATEWAY_X + (END_X - GATEWAY_X) * 0.4;
            
            // The path definition string
            const pathD = `M ${GATEWAY_X} ${GATEWAY_Y} C ${cp1X} ${GATEWAY_Y}, ${cp2X} ${endY}, ${END_X} ${endY}`;
            const pathId = `path-${type}-${node.id}`;

            return (
              <g key={node.id}>
                {/* 1. Background Track Line (Always visible) */}
                <path 
                  d={pathD}
                  fill="none"
                  stroke={COLORS.lineInactive}
                  strokeWidth="2"
                  strokeDasharray="4 6" // Dashed line for infrastructure look
                  strokeOpacity="0.4"
                />

                {/* 2. Active Pulse Line */}
                <path 
                  d={pathD}
                  id={pathId} // ID for mpath reference
                  fill="none"
                  stroke={isFailed ? COLORS.danger : (isActive ? `url(#grad-${type})` : 'transparent')}
                  strokeWidth={isActive ? 3 : 0}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {/* 3. The Moving Packet (Travels ALONG the path) */}
                {isActive && (
                  <circle r={isFailed ? 4 : 5} fill={isFailed ? COLORS.danger : primaryColor}>
                    {/* <mpath> ensures the circle follows the path definition exactly */}
                    <animateMotion dur={isNeuro ? "0.6s" : "0.8s"} repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1">
                       <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* --- DOM NODES LAYER (Overlay on top of SVG) --- */}
      
      {/* Gateway (Left) */}
      <div className="relative z-10 ml-2 md:ml-6 flex flex-col items-center gap-2" style={{ top: '0%' }}>
        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-white border-2 shadow-md z-20 ${isNeuro ? 'border-orange-200' : 'border-sky-200'}`}>
          <Network className={isNeuro ? 'text-orange-500' : 'text-sky-600'} size={28} strokeWidth={2} />
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded backdrop-blur-sm">Gateway</span>
      </div>

      {/* Service Nodes (Right) */}
      <div className="relative z-10 h-full flex flex-col justify-around mr-2 md:mr-6 w-56">
        {nodes.map((node, idx) => {
          const isActive = isNeuro ? node.id === lastWinnerId : idx === activePathIndex;
          
          return (
            <div key={node.id} className="flex items-center justify-end gap-3 transition-all duration-300">
               {/* Metrics */}
               <div className="flex flex-col items-end min-w-[60px]">
                  {node.failed ? (
                     <span className="text-[10px] font-black text-red-500 bg-red-50 px-1 rounded uppercase tracking-tighter">OFFLINE</span>
                  ) : (
                    <>
                      <span className={`text-xs font-mono font-bold ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                        {node.latency.toFixed(0)}ms
                      </span>
                      {isNeuro && (
                        <div className="w-16 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 transition-all duration-500"
                            style={{ width: `${node.weight * 100}%` }}
                          />
                        </div>
                      )}
                    </>
                  )}
               </div>

               {/* Node Icon */}
               <div 
                 className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300 relative
                    ${node.failed 
                      ? 'bg-red-50 border-red-500 shadow-none' 
                      : isActive 
                        ? (isNeuro ? 'bg-orange-50 border-orange-500 scale-110 shadow-lg shadow-orange-100' : 'bg-sky-50 border-sky-500 scale-110 shadow-lg shadow-sky-100') 
                        : 'bg-white border-slate-300 text-slate-300'
                    }
                 `}
               >
                  {!node.failed && isActive && (
                    <div className={`absolute inset-0 rounded-xl border-2 ${isNeuro ? 'border-orange-200' : 'border-sky-200'} animate-ping opacity-30`} />
                  )}
                  
                  <div className={node.failed ? 'text-red-500' : (isActive ? (isNeuro ? 'text-orange-500' : 'text-sky-600') : 'text-slate-400')}>
                    {node.failed ? <XCircle size={24} /> : getIcon(node.type)}
                  </div>
               </div>
               
               {/* Label */}
               <div className="flex flex-col w-24 text-right">
                 <span className={`text-sm font-bold truncate ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                   {node.name}
                 </span>
               </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default SimulationVisualizer;