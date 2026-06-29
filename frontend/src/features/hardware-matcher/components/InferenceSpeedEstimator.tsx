import React, { useState, useMemo } from 'react';
import { calculateHardwareMatch } from '../utils/memoryMath';
import type { HardwareMatchRequest } from '../utils/memoryMath';
import { Card } from '../../../components/common/Card';
import { Slider } from '../../../components/common/Slider';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export const InferenceSpeedEstimator: React.FC = () => {
  const [request, setRequest] = useState<HardwareMatchRequest>({
    gpuVramGb: 24,
    gpuMemoryBandwidthGbps: 1008,
    systemRamGb: 64,
    systemRamBandwidthGbps: 100,
    parametersBillion: 70,
    bitsPerWeight: 4, // Note: not used for the loop
    targetSequenceLength: 4096,
  });

  const quantizations = [
    { bits: 2, label: '2-bit' },
    { bits: 4, label: '4-bit' },
    { bits: 8, label: '8-bit' },
    { bits: 16, label: '16-bit (fp16)' },
  ];

  const results = useMemo(() => {
    return quantizations.map(q => {
      const res = calculateHardwareMatch({ ...request, bitsPerWeight: q.bits });
      return { ...q, result: res };
    });
  }, [request]);

  const maxSpeed = Math.max(...results.map(r => r.result.estimatedTokensPerSecond));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">System Config</h3>
        
        <div className="space-y-4">
          <Slider
            label="GPU VRAM"
            min={4} max={160} step={4}
            value={request.gpuVramGb}
            onChange={(v) => setRequest({ ...request, gpuVramGb: v })}
            suffix=" GB"
          />
          <Slider
            label="Memory Bandwidth"
            min={100} max={3000} step={10}
            value={request.gpuMemoryBandwidthGbps}
            onChange={(v) => setRequest({ ...request, gpuMemoryBandwidthGbps: v })}
            suffix=" GB/s"
          />
          <Slider
            label="System RAM"
            min={8} max={256} step={8}
            value={request.systemRamGb || 32}
            onChange={(v) => setRequest({ ...request, systemRamGb: v })}
            suffix=" GB"
          />
        </div>

        <hr className="border-slate-200 dark:border-slate-700" />

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">Model Setup</h3>
        <div className="space-y-4">
          <Slider
            label="Parameters"
            min={1} max={400} step={1}
            value={request.parametersBillion}
            onChange={(v) => setRequest({ ...request, parametersBillion: v })}
            suffix=" B"
          />
          <Slider
            label="Context Length"
            min={256} max={128000} step={256}
            value={request.targetSequenceLength || 4096}
            onChange={(v) => setRequest({ ...request, targetSequenceLength: v })}
            suffix=" tokens"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wide">
          Speed Estimates by Quantization
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="pb-3 font-medium">Quantization</th>
                <th className="pb-3 font-medium">VRAM Used</th>
                <th className="pb-3 font-medium">Tokens/sec</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map(({ bits, label, result }) => {
                const speedPct = maxSpeed > 0 ? (result.estimatedTokensPerSecond / maxSpeed) * 100 : 0;
                
                return (
                  <tr key={bits} className="text-sm">
                    <td className="py-4 font-medium text-slate-900 dark:text-white">{label}</td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {result.totalRequiredGb.toFixed(1)} GB
                    </td>
                    <td className="py-4 w-1/3">
                      <div className="flex items-center gap-2">
                        <div className="h-4 bg-blue-500 rounded-sm" style={{ width: `${Math.max(1, speedPct)}%` }}></div>
                        <span className="font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {result.estimatedTokensPerSecond > 0 ? Math.round(result.estimatedTokensPerSecond) : 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      {result.status === 'VRAM_FIT' && (
                        <div className="flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle size={14} /> <span>Fits</span>
                        </div>
                      )}
                      {result.status === 'SYSTEM_OFFLOAD' && (
                        <div className="flex items-center justify-end gap-1 text-amber-600 dark:text-amber-400 font-medium">
                          <AlertTriangle size={14} /> <span>Offload</span>
                        </div>
                      )}
                      {result.status === 'OUT_OF_MEMORY' && (
                        <div className="flex items-center justify-end gap-1 text-red-600 dark:text-red-400 font-medium">
                          <XCircle size={14} /> <span>OOM</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
