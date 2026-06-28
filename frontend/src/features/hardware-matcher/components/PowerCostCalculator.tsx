import React, { useState, useMemo } from 'react';
import { Card } from '../../../components/common/Card';
import { Slider } from '../../../components/common/Slider';
import { useHardwareMatcher } from '../hooks/useHardwareMatcher';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { Zap } from 'lucide-react';

const ELECTRICITY_RATES = [
  { id: 'us', label: 'US avg', rate: 0.12 },
  { id: 'eu', label: 'EU avg', rate: 0.28 },
  { id: 'uk', label: 'UK avg', rate: 0.29 },
  { id: 'au', label: 'Australia', rate: 0.25 },
  { id: 'custom', label: 'Custom', rate: 0.15 },
];

export const PowerCostCalculator: React.FC = () => {
  const { hardwareItems } = useHardwareMatcher();
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [rateId, setRateId] = useState('us');
  const [customRate, setCustomRate] = useState(0.12);

  const { data: dbGpus = [] } = useQuery({
    queryKey: ['gpus'],
    queryFn: () => api.getGPUs(),
    enabled: typeof window !== 'undefined'
  });

  const getTdpForVram = (vram: number) => {
    if (vram >= 80) return 700;
    if (vram >= 48) return 450;
    if (vram >= 24) return 350;
    if (vram >= 16) return 200;
    if (vram >= 12) return 150;
    return 120;
  };

  const currentRate = rateId === 'custom' 
    ? customRate 
    : ELECTRICITY_RATES.find(r => r.id === rateId)?.rate || 0.12;

  const gpuPowerDetails = useMemo(() => {
    return hardwareItems.filter(i => i.type === 'gpu').map(item => {
      // Try to parse DB id from item.id e.g., gpu-[uuid]-[timestamp]
      const parts = item.id.split('-');
      let tdp = null;
      if (parts.length >= 3) {
        const potentialId = parts.slice(1, -1).join('-');
        const matched = dbGpus.find(g => g.id === potentialId);
        if (matched && matched.tdp_watts) {
          tdp = matched.tdp_watts;
        }
      }
      
      if (tdp === null) {
        tdp = getTdpForVram(item.vramGb || 8);
      }
      
      return { ...item, tdp };
    });
  }, [hardwareItems, dbGpus]);

  const totalGpuPower = gpuPowerDetails.reduce((sum, item) => sum + item.tdp, 0);
  const baseSystemPower = 150; // CPU, Motherboard, Storage
  const totalPower = totalGpuPower + baseSystemPower;

  // Costs (at 100% load during those hours)
  const kw = totalPower / 1000;
  const costPerHour = kw * currentRate;
  const costPerDay = costPerHour * hoursPerDay;
  const costPerMonth = costPerDay * 30.4; // avg days in month
  const costPerYear = costPerDay * 365;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="text-amber-500" size={24} />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Power & Cost Calculator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Hardware Power Draw</h4>
            <div className="space-y-2 mb-4">
              {gpuPowerDetails.map(gpu => (
                <div key={gpu.id} className="flex justify-between items-center text-sm">
                  <span className="text-slate-700 dark:text-slate-300 truncate pr-4">{gpu.name}</span>
                  <span className="font-mono text-slate-900 dark:text-white">{gpu.tdp}W</span>
                </div>
              ))}
              {gpuPowerDetails.length === 0 && (
                <div className="text-sm text-slate-500 italic">No GPUs added.</div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-700 dark:text-slate-300">System (CPU/Mobo/Storage)</span>
                <span className="font-mono text-slate-900 dark:text-white">{baseSystemPower}W</span>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="font-semibold text-slate-900 dark:text-white">Total Est. TDP</span>
              <span className="font-bold text-lg text-brand-600 dark:text-brand-400">{totalPower}W</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-6">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Usage Pattern</h4>
            
            <Slider
              label="Hours per day active"
              min={1} max={24} step={1}
              value={hoursPerDay}
              onChange={setHoursPerDay}
              suffix="h"
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Electricity Rate</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {ELECTRICITY_RATES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRateId(r.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${rateId === r.id ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              
              {rateId === 'custom' ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={customRate}
                    onChange={(e) => setCustomRate(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Using ${currentRate}/kWh
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Cost Estimates</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-slate-600 dark:text-slate-400">Per hour</span>
                <span className="text-xl font-semibold text-slate-900 dark:text-white">${costPerHour.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-slate-600 dark:text-slate-400">Per day</span>
                <span className="text-xl font-semibold text-slate-900 dark:text-white">${costPerDay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-slate-600 dark:text-slate-400">Per month</span>
                <span className="text-xl font-semibold text-slate-900 dark:text-white">${costPerMonth.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-slate-600 dark:text-slate-400">Per year</span>
                <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">${costPerYear.toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2 text-sm">
            <div className="flex justify-between items-center text-slate-500">
              <span>At 100% load (continuous training)</span>
              <span className="font-mono">${((totalPower/1000) * currentRate * 24 * 365).toFixed(0)}/yr</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>At 30% load (typical inference server)</span>
              <span className="font-mono">${((totalPower/1000 * 0.3) * currentRate * 24 * 365).toFixed(0)}/yr</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
