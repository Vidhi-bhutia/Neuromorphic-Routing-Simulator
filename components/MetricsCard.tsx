import React from 'react';
import { LucideIcon } from 'lucide-react';
import { RoutingStats } from '../types';
import { COLORS } from '../constants';

interface Props {
  title: string;
  subtitle: string;
  stats: RoutingStats;
  type: 'traditional' | 'neuromorphic';
  icon: LucideIcon;
}

const MetricsCard: React.FC<Props> = ({ title, subtitle, stats, type, icon: Icon }) => {
  const isNeuro = type === 'neuromorphic';
  const color = isNeuro ? COLORS.neuromorphic : COLORS.traditional;
  const bgColor = isNeuro ? 'bg-orange-50' : 'bg-sky-50'; // Updated to Orange
  const borderColor = isNeuro ? 'border-orange-100' : 'border-sky-100'; // Updated to Orange

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 ${borderColor} p-6 flex-1 min-w-[300px]`}>
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon size={24} color={color} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-900">{title}</h3>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Latency</p>
          <p className="text-3xl font-light text-slate-900">
            {stats.avgLatency.toFixed(0)}<span className="text-sm font-bold text-slate-400 ml-1">ms</span>
          </p>
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Throughput</p>
          <p className="text-3xl font-light text-slate-900">
            {Math.round(stats.throughput)}<span className="text-sm font-bold text-slate-400 ml-1">req/s</span>
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Success Rate</p>
          <p className={`text-2xl font-bold ${stats.successRate > 98 ? 'text-emerald-500' : 'text-red-500'}`}>
            {stats.successRate.toFixed(1)}%
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">P95 Latency</p>
          <p className="text-2xl font-bold text-slate-700">
             {/* Approximate P95 from Avg for simulation simplicity */}
            {(stats.avgLatency * (isNeuro ? 1.2 : 1.8)).toFixed(0)}<span className="text-xs text-slate-400 ml-1">ms</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;