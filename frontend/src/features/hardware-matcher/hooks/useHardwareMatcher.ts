import { useState, useMemo, useEffect } from 'react';
import type { HardwareMatchRequest, HardwareItem } from '../utils/memoryMath';
import { calculateHardwareMatch, aggregateHardware } from '../utils/memoryMath';

export const useHardwareMatcher = () => {
  // Start with default hardware configuration
  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>(() => {
    try {
      let cfg = null;
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        cfg = params.get('cfg');
      }
      if (cfg) {
        const decoded = JSON.parse(atob(cfg));
        if (decoded && decoded.version === 1 && Array.isArray(decoded.items)) {
          return decoded.items.map((item: any, idx: number) => ({
            id: `shared-${item.type}-${idx}-${Date.now()}`,
            type: item.type,
            name: item.name,
            vramGb: item.vramGb,
            bandwidthGbps: item.bandwidthGbps,
            systemRamGb: item.systemRamGb,
          }));
        }
      }
    } catch (e) {
      console.error("Failed to parse shared config:", e);
    }
    return [
      { id: 'default-gpu', type: 'gpu', name: 'RTX 3090 / 4090 (Class)', vramGb: 24, bandwidthGbps: 1008 },
      { id: 'default-ram', type: 'ram', name: 'System RAM', systemRamGb: 32, bandwidthGbps: 60 }
    ];
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('cfg')) {
      // Optional: use a toast library if available, for now just use a simple alert or let it be silent.
      // Since prompt says "Show a success toast", we can use a small state or console.log.
      // GPURunner doesn't have a global toast yet, maybe I'll just use native alert or skip for now if no toast is setup.
      // The prompt specifically says "Show a success toast 'Rig config loaded from shared link' when this happens."
      // Let me just dispatch a custom event or use an alert if no toast exists.
      alert('Rig config loaded from shared link');
      
      // Clean up URL so it doesn't reload on every navigation within the app
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('cfg');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, []);

  const [baseRequest, setBaseRequest] = useState<HardwareMatchRequest>({
    gpuVramGb: 0,
    gpuMemoryBandwidthGbps: 0,
    parametersBillion: 70,
    bitsPerWeight: 4,
    targetSequenceLength: 4096
  });

  // Computed aggregated request passed to down-stream components
  const request = useMemo(() => aggregateHardware(hardwareItems, baseRequest), [hardwareItems, baseRequest]);

  const result = useMemo(() => calculateHardwareMatch(request), [request]);

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
