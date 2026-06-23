import React from 'react';
import type { HardwareMatchResult } from '../utils/memoryMath';
import { Card } from '../../../components/common/Card';

interface VRAMBarGraphProps {
  result: HardwareMatchResult | null;
}

export const VRAMBarGraph: React.FC<VRAMBarGraphProps> = ({ result }) => {
  if (!result) return null;

  const totalVram = result.vramAvailableGb + 1.5; // Include OS overhead for visual scaling
  const weightPct = Math.min((result.mWeightsGb * result.gpuWeightFraction) / totalVram * 100, 100);
  const cachePct = Math.min((result.mCacheGb) / totalVram * 100, 100);
  const isOOM = result.status === 'OUT_OF_MEMORY';

  return (
    <Card className="p-6">
      <div className="flex justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">VRAM Usage</h3>
        <span className={`font-semibold ${isOOM ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
          {result.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="relative h-8 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden flex">
        <div 
          className={`h-full ${isOOM ? 'bg-red-500' : 'bg-blue-500'} transition-all duration-300`} 
          style={{ width: `${weightPct}%` }}
          title={`Weights: ${result.mWeightsGb} GB`}
        />
        <div 
          className={`h-full ${isOOM ? 'bg-red-400' : 'bg-indigo-400'} transition-all duration-300`} 
          style={{ width: `${cachePct}%` }}
          title={`KV Cache: ${result.mCacheGb} GB`}
        />
      </div>

      <div className="flex justify-between text-sm mt-2 text-slate-500 dark:text-slate-400">
        <span>0 GB</span>
        <span>{totalVram} GB</span>
      </div>

      <div className="mt-4 flex space-x-4 text-sm">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isOOM ? 'bg-red-500' : 'bg-blue-500'}`}></div>
          Weights ({result.mWeightsGb.toFixed(1)} GB)
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isOOM ? 'bg-red-400' : 'bg-indigo-400'}`}></div>
          KV Cache ({result.mCacheGb.toFixed(1)} GB)
        </div>
      </div>
    </Card>
  );
};
