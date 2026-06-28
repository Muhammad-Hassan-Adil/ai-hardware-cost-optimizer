import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { useHardwareMatcher } from '../hooks/useHardwareMatcher';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const PCIE_BW = {
  3: { 16: 16, 8: 8, 4: 4, 1: 1 },
  4: { 16: 32, 8: 16, 4: 8, 1: 2 },
  5: { 16: 64, 8: 32, 4: 16, 1: 4 }
};

export const PCIeBandwidthChecker: React.FC = () => {
  const { hardwareItems } = useHardwareMatcher();
  
  const gpus = hardwareItems.filter(i => i.type === 'gpu');
  const gpuCount = gpus.length;

  const [pcieGen, setPcieGen] = useState<3 | 4 | 5>(4);
  const [slots, setSlots] = useState<number[]>([16, 8, 4]);

  const handleSlotChange = (index: number, val: number) => {
    const newSlots = [...slots];
    newSlots[index] = val;
    setSlots(newSlots);
  };

  const getTheoreticalMax = () => PCIE_BW[pcieGen][16 as keyof typeof PCIE_BW[typeof pcieGen]];
  const getActual = (lanes: number) => PCIE_BW[pcieGen][lanes as keyof typeof PCIE_BW[typeof pcieGen]] || 0;

  const MIN_ACCEPTABLE_BW = 16; // e.g. x8 on PCIe 4.0 is 16 GB/s

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">PCIe Bandwidth Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">Detected GPU Count:</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{gpuCount}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              PCIe Generation
            </label>
            <select
              value={pcieGen}
              onChange={(e) => setPcieGen(Number(e.target.value) as 3 | 4 | 5)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
            >
              <option value={3}>PCIe 3.0</option>
              <option value={4}>PCIe 4.0</option>
              <option value={5}>PCIe 5.0</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Slot Configurations
            </label>
            <div className="space-y-3">
              {[0, 1, 2, 3].map((idx) => {
                // Show at least as many slots as GPUs, or minimum 3
                if (idx >= Math.max(gpuCount, 3)) return null;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-16">Slot {idx + 1}</span>
                    <select
                      value={slots[idx] || 16}
                      onChange={(e) => handleSlotChange(idx, Number(e.target.value))}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                    >
                      <option value={16}>x16 (Full)</option>
                      <option value={8}>x8 (Half)</option>
                      <option value={4}>x4 (Quarter)</option>
                      <option value={1}>x1 (Mining)</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Bandwidth Analysis</h4>
          
          <div className="space-y-4">
            <div className="flex text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <div className="w-20">Slot</div>
              <div className="w-24">Theoretical</div>
              <div className="w-24">Actual</div>
              <div className="flex-1">Status</div>
            </div>

            {[0, 1, 2, 3].map((idx) => {
              if (idx >= Math.max(gpuCount, 3)) return null;
              const lanes = slots[idx] || 16;
              const theoretical = getTheoreticalMax();
              const actual = getActual(lanes);
              
              const isUsed = idx < gpuCount;
              
              let statusNode = null;
              let statusClass = "";
              
              if (actual >= theoretical) {
                statusNode = <><CheckCircle size={14} /> <span>Full speed</span></>;
                statusClass = "text-emerald-600 dark:text-emerald-400";
              } else if (actual >= MIN_ACCEPTABLE_BW) {
                statusNode = <><AlertTriangle size={14} /> <span>Half bandwidth</span></>;
                statusClass = "text-amber-600 dark:text-amber-400";
              } else {
                statusNode = <><XCircle size={14} /> <span>Bottleneck</span></>;
                statusClass = "text-red-600 dark:text-red-400";
              }

              return (
                <div key={idx} className={`flex items-center text-sm ${!isUsed ? 'opacity-40' : ''}`}>
                  <div className="w-20 font-medium text-slate-700 dark:text-slate-300">Slot {idx + 1}</div>
                  <div className="w-24 text-slate-500">{theoretical} GB/s</div>
                  <div className="w-24 font-bold text-slate-900 dark:text-white">{actual} GB/s</div>
                  <div className={`flex-1 flex items-center gap-1.5 font-medium ${statusClass}`}>
                    {statusNode}
                    {!isUsed && <span className="text-xs ml-2 text-slate-400 font-normal">(Empty)</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {gpuCount > 1 && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
                <h5 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} /> Inter-GPU Bottleneck
                </h5>
                <p className="text-sm text-amber-700 dark:text-amber-500 mb-2">
                  Multi-GPU inference requires heavy data transfer between cards.
                </p>
                {(() => {
                  const usedSlots = slots.slice(0, gpuCount);
                  const minLanes = Math.min(...usedSlots);
                  const minBw = getActual(minLanes);
                  
                  if (minBw < MIN_ACCEPTABLE_BW) {
                    return (
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        Critical Bottleneck: Transfer speeds limited to {minBw} GB/s. 
                        Recommendation: Move GPU to x8 or x16 slot.
                      </p>
                    );
                  } else {
                    return (
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        Transfer speeds limited to {minBw} GB/s. This is generally acceptable for tensor parallelism.
                      </p>
                    );
                  }
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
