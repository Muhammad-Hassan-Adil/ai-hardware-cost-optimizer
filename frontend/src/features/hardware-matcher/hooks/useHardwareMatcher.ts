import { useState, useEffect } from 'react';
import type { HardwareMatchRequest, HardwareMatchResult } from '../utils/memoryMath';
import { calculateHardwareMatch } from '../utils/memoryMath';

export const useHardwareMatcher = () => {
  const [request, setRequest] = useState<HardwareMatchRequest>({
    gpuVramGb: 24,
    gpuMemoryBandwidthGbps: 1008,
    systemRamGb: 32,
    systemRamBandwidthGbps: 60,
    parametersBillion: 70,
    bitsPerWeight: 4,
    targetSequenceLength: 4096
  });

  const [result, setResult] = useState<HardwareMatchResult | null>(null);

  useEffect(() => {
    const res = calculateHardwareMatch(request);
    setResult(res);
  }, [request]);

  const updateRequest = (updates: Partial<HardwareMatchRequest>) => {
    setRequest(prev => ({ ...prev, ...updates }));
  };

  return { request, updateRequest, result };
};
