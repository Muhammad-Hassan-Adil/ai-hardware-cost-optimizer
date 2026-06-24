import React from 'react';
import type { HardwareMatchRequest } from '../utils/memoryMath';
import { Slider } from '../../../components/common/Slider';
import { Card } from '../../../components/common/Card';

interface GPUSelectorProps {
  request: HardwareMatchRequest;
  updateRequest: (updates: Partial<HardwareMatchRequest>) => void;
}

export const GPUSelector: React.FC<GPUSelectorProps> = ({ request, updateRequest }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Hardware Specifications</h3>
      
      <div className="space-y-6">
        <Slider
          label="GPU VRAM"
          min={4} max={80} step={2}
          value={request.gpuVramGb}
          onChange={(v) => updateRequest({ gpuVramGb: v })}
          suffix=" GB"
        />
        
        <Slider
          label="GPU Memory Bandwidth"
          min={100} max={2000} step={10}
          value={request.gpuMemoryBandwidthGbps}
          onChange={(v) => updateRequest({ gpuMemoryBandwidthGbps: v })}
          suffix=" GB/s"
        />
        
        <div className="pt-4 border-t border-slate-100">
          <Slider
            label="System RAM"
            min={8} max={128} step={8}
            value={request.systemRamGb || 32}
            onChange={(v) => updateRequest({ systemRamGb: v })}
            suffix=" GB"
          />
        </div>
      </div>
    </Card>
  );
};
