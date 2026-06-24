import { useState, useEffect } from 'react';
import type { HardwareMatchRequest, HardwareMatchResult, HardwareItem } from '../utils/memoryMath';
import { calculateHardwareMatch, aggregateHardware } from '../utils/memoryMath';

export const useHardwareMatcher = () => {
  // Start with default hardware configuration
  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>([
    { id: 'default-gpu', type: 'gpu', name: 'RTX 3090 / 4090 (Class)', vramGb: 24, bandwidthGbps: 1008 },
    { id: 'default-ram', type: 'ram', name: 'System RAM', systemRamGb: 32, bandwidthGbps: 60 }
  ]);

  const [baseRequest, setBaseRequest] = useState<HardwareMatchRequest>({
    gpuVramGb: 0,
    gpuMemoryBandwidthGbps: 0,
    parametersBillion: 70,
    bitsPerWeight: 4,
    targetSequenceLength: 4096
  });

  const [result, setResult] = useState<HardwareMatchResult | null>(null);

  // Computed aggregated request passed to down-stream components
  const request = aggregateHardware(hardwareItems, baseRequest);

  useEffect(() => {
    const res = calculateHardwareMatch(request);
    setResult(res);
  }, [request]);

  const updateRequest = (updates: Partial<HardwareMatchRequest>) => {
    setBaseRequest(prev => ({ ...prev, ...updates }));
  };

  const addHardwareItem = (item: HardwareItem) => {
    setHardwareItems(prev => [...prev, item]);
  };

  const updateHardwareItem = (id: string, updates: Partial<HardwareItem>) => {
    setHardwareItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeHardwareItem = (id: string) => {
    setHardwareItems(prev => prev.filter(item => item.id !== id));
  };

  return { 
    request, 
    updateRequest, 
    result,
    hardwareItems,
    addHardwareItem,
    updateHardwareItem,
    removeHardwareItem
  };
};
