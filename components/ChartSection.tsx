import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, BarChart, Bar } from 'recharts';
import { SimulationState } from '../types';
import { COLORS } from '../constants';

interface Props {
  history: SimulationState['history'];
}

const ChartSection: React.FC<Props> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Latency Chart */}
      <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
        <h4 className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">Latency Evolution (Lower is better)</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="timestamp" hide />
              <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                itemStyle={{ fontSize: '13px', fontWeight: '600' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: '600', fontSize: '12px' }} />
              <Line 
                type="monotone" 
                dataKey="tradLatency" 
                name="Traditional" 
                stroke={COLORS.traditional} 
                strokeWidth={3} 
                dot={false} 
                animationDuration={500}
              />
              <Line 
                type="monotone" 
                dataKey="neuroLatency" 
                name="Neuromorphic" 
                stroke={COLORS.neuromorphic} 
                strokeWidth={3} 
                dot={false}
                animationDuration={500} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Throughput Chart */}
      <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
        <h4 className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">System Throughput (Higher is better)</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={history.slice(-10)}> {/* Show fewer bars for clarity */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="timestamp" hide />
              <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: '600', fontSize: '12px' }} />
              <Bar 
                dataKey="tradThroughput" 
                name="Traditional" 
                fill={COLORS.traditional} 
                radius={[6, 6, 0, 0]}
                barSize={16}
                animationDuration={500}
              />
              <Bar 
                dataKey="neuroThroughput" 
                name="Neuromorphic" 
                fill={COLORS.neuromorphic} 
                radius={[6, 6, 0, 0]}
                barSize={16}
                animationDuration={500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartSection;