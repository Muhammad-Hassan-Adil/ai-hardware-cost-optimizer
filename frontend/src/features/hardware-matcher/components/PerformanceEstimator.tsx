import React from 'react';
import { HardwareMatchResult } from '../utils/memoryMath';
import { Card } from '../../../components/common/Card';

interface PerformanceEstimatorProps {
  result: HardwareMatchResult | null;
}

export const PerformanceEstimator: React.FC<PerformanceEstimatorProps> = ({ result }) => {
  if (!result) return null;

  return (
    <Card className="p-6 bg-slate-900 text-white">
      <h3 className="text-lg font-semibold text-slate-300 mb-4">Estimated Performance</h3>
      
      <div className="flex items-end space-x-2 mb-2">
        <span className="text-4xl font-bold text-blue-400">
          {result.estimatedTokensPerSecond > 0 ? result.estimatedTokensPerSecond : '0'}
        </span>
        <span className="text-slate-400 mb-1">Tokens / second</span>
      </div>

      <p className="text-sm text-slate-400 mt-4 border-t border-slate-700 pt-4">
        {result.status === 'VRAM_FIT' && "Model fits entirely in GPU VRAM, providing maximum bandwidth."}
        {result.status === 'SYSTEM_OFFLOAD' && `Model requires partial offload. ${(result.gpuWeightFraction * 100).toFixed(0)}% of weights are on GPU, the rest on System RAM.`}
        {result.status === 'OUT_OF_MEMORY' && "Model exceeds total combined GPU and System memory."}
      </p>
    </Card>
  );
};
