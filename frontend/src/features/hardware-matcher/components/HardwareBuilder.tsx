import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Slider } from '../../../components/common/Slider';
import { Plus, X, Cpu, MemoryStick, CloudDownload, Loader2 } from 'lucide-react';
import type { HardwareItem } from '../utils/memoryMath';
import { api } from '../../../services/api';
import type { GPU } from '../../../types/database.types';

interface HardwareBuilderProps {
  hardwareItems: HardwareItem[];
  addHardwareItem: (item: HardwareItem) => void;
  updateHardwareItem: (id: string, updates: Partial<HardwareItem>) => void;
  removeHardwareItem: (id: string) => void;
  totalVram: number;
}

export const HardwareBuilder: React.FC<HardwareBuilderProps> = ({ 
  hardwareItems, 
  addHardwareItem, 
  updateHardwareItem, 
  removeHardwareItem,
  totalVram
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFetchInput, setShowFetchInput] = useState(false);
  const [fetchName, setFetchName] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [dbGpus, setDbGpus] = useState<GPU[]>([]);

  React.useEffect(() => {
    api.getGPUs().then(setDbGpus).catch(console.error);
  }, []);

  const handleAddGpu = () => {
    addHardwareItem({
      id: `gpu-${Date.now()}`,
      type: 'gpu',
      name: 'Custom GPU',
      vramGb: 16,
      bandwidthGbps: 500
    });
    setShowAddMenu(false);
  };

  const handleAddRam = () => {
    addHardwareItem({
      id: `ram-${Date.now()}`,
      type: 'ram',
      name: 'System RAM',
      systemRamGb: 32,
      bandwidthGbps: 60
    });
    setShowAddMenu(false);
  };

  const handleFetchGpu = async () => {
    if (!fetchName.trim()) return;
    setIsFetching(true);
    
    try {
      const data = await api.fetchExternalGpu(fetchName.trim());
      addHardwareItem({
        id: `gpu-fetched-${Date.now()}`,
        type: 'gpu',
        name: data.name || fetchName,
        vramGb: data.vram_gb,
        bandwidthGbps: data.memory_bandwidth_gb_s
      });
    } catch (e) {
      console.error(e);
      alert("Error fetching GPU specs.");
    } finally {
      setIsFetching(false);
      setFetchName('');
      setShowFetchInput(false);
      setShowAddMenu(false);
    }
  };

  // Compute Power Rank Logic
  let computeRank = "Entry Level";
  let computePercentage = 25;
  let colorClass = "bg-blue-500";

  if (totalVram >= 64) {
    computeRank = "Enthusiast / AI Lab";
    computePercentage = 100;
    colorClass = "bg-purple-500";
  } else if (totalVram >= 32) {
    computeRank = "High End";
    computePercentage = 75;
    colorClass = "bg-indigo-500";
  } else if (totalVram >= 16) {
    computeRank = "Mid Range";
    computePercentage = 50;
    colorClass = "bg-cyan-500";
  }

  return (
    <Card className="p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">My Hardware</h3>
        
        <div className="relative">
          <button 
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
          >
            <Plus size={16} /> Add Item
          </button>
          
          {showAddMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-20">
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {dbGpus.map(gpu => (
                  <button 
                    key={gpu.id}
                    onClick={() => {
                      addHardwareItem({
                        id: `gpu-${gpu.id}-${Date.now()}`,
                        type: 'gpu',
                        name: gpu.name,
                        vramGb: gpu.vram_gb,
                        bandwidthGbps: gpu.memory_bandwidth_gb_s
                      });
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700/50"
                  >
                    <div className="font-medium truncate">{gpu.name}</div>
                    <div className="text-xs text-slate-500">{gpu.vram_gb}GB • {gpu.memory_bandwidth_gb_s}GB/s</div>
                  </button>
                ))}
              </div>
              <button 
                onClick={handleAddGpu}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Cpu size={16} /> Custom GPU
              </button>
              <button 
                onClick={handleAddRam}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-t border-slate-100 dark:border-slate-700/50"
              >
                <MemoryStick size={16} /> System RAM
              </button>
              <button 
                onClick={() => { setShowFetchInput(true); setShowAddMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-t border-slate-100 dark:border-slate-700/50"
              >
                <CloudDownload size={16} /> Other (Fetch Live)
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showFetchInput && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex gap-2">
          <input 
            type="text" 
            placeholder="e.g. Radeon Pro W7900" 
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
            value={fetchName}
            onChange={(e) => setFetchName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetchGpu()}
          />
          <button 
            onClick={handleFetchGpu}
            disabled={isFetching}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isFetching ? <Loader2 size={16} className="animate-spin" /> : 'Fetch'}
          </button>
        </div>
      )}
      
      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {hardwareItems.map(item => (
          <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                {item.type === 'gpu' ? <Cpu className="text-blue-500" size={18} /> : <MemoryStick className="text-emerald-500" size={18} />}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
              </div>
              <button 
                onClick={() => removeHardwareItem(item.id)}
                className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={18} />
              </button>
            </div>

            {item.type === 'gpu' ? (
              <div className="space-y-4">
                <Slider
                  label="VRAM"
                  min={4} max={80} step={2}
                  value={item.vramGb || 0}
                  onChange={(v) => updateHardwareItem(item.id, { vramGb: v })}
                  suffix=" GB"
                />
                <Slider
                  label="Memory Bandwidth"
                  min={100} max={2000} step={10}
                  value={item.bandwidthGbps || 0}
                  onChange={(v) => updateHardwareItem(item.id, { bandwidthGbps: v })}
                  suffix=" GB/s"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <Slider
                  label="Capacity"
                  min={8} max={128} step={8}
                  value={item.systemRamGb || 0}
                  onChange={(v) => updateHardwareItem(item.id, { systemRamGb: v })}
                  suffix=" GB"
                />
                <Slider
                  label="Memory Bandwidth"
                  min={20} max={200} step={10}
                  value={item.bandwidthGbps || 0}
                  onChange={(v) => updateHardwareItem(item.id, { bandwidthGbps: v })}
                  suffix=" GB/s"
                />
              </div>
            )}
          </div>
        ))}
        {hardwareItems.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            No hardware added. Click "Add Item" to build your rig.
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Compute Power</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{computeRank}</span>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
            style={{ width: `${computePercentage}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
          Total Pooled VRAM: {totalVram} GB
        </p>
      </div>
    </Card>
  );
};
