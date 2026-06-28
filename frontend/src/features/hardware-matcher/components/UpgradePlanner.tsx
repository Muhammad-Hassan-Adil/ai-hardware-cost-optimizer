import React, { useState, useMemo } from 'react';
import { calculateHardwareMatch } from '../utils/memoryMath';
import { Card } from '../../../components/common/Card';
import { Slider } from '../../../components/common/Slider';
import { ArrowRight } from 'lucide-react';

const VRAM_TIERS = [
  { vram: 8, cost: 200, name: 'Entry GPU (8GB)', bw: 300 },
  { vram: 12, cost: 300, name: 'Mid GPU (12GB)', bw: 400 },
  { vram: 16, cost: 400, name: 'High-Mid GPU (16GB)', bw: 500 },
  { vram: 24, cost: 800, name: 'High-End GPU (24GB)', bw: 1008 },
  { vram: 48, cost: 4000, name: 'Pro GPU (48GB)', bw: 864 },
  { vram: 80, cost: 12000, name: 'Data Center GPU (80GB)', bw: 2000 }
];

export const UpgradePlanner: React.FC = () => {
  const [budget, setBudget] = useState<number>(1000);
  const [budgetType, setBudgetType] = useState<'total' | 'monthly'>('total');
  
  const [currentVram, setCurrentVram] = useState<number>(12);
  const [currentBw, setCurrentBw] = useState<number>(400);

  const effectiveBudget = budgetType === 'monthly' ? budget * 12 : budget;

  const calculateMaxParams = (vramGb: number) => {
    // Math: total_vram - 1.5 (OS) = params * ((4/8) * 1.15 + 0.1)
    // -> params = (vramGb - 1.5) / 0.675
    const params = (vramGb - 1.5) / 0.675;
    return Math.max(0, Math.floor(params));
  };

  const getSpeedForParams = (vramGb: number, bw: number, params: number) => {
    const res = calculateHardwareMatch({
      gpuVramGb: vramGb,
      gpuMemoryBandwidthGbps: bw,
      systemRamGb: 32,
      systemRamBandwidthGbps: 60,
      parametersBillion: params,
      bitsPerWeight: 4,
      targetSequenceLength: 2048,
    });
    return res.estimatedTokensPerSecond;
  };

  const currentParams = calculateMaxParams(currentVram);
  const currentSpeed = getSpeedForParams(currentVram, currentBw, currentParams);

  const roadmap = useMemo(() => {
    let currentCostSpent = 0;
    // Step 2 target
    const nextTierIdx = VRAM_TIERS.findIndex(t => t.vram > currentVram);
    let step2 = null;
    let step3 = null;
    
    if (nextTierIdx !== -1) {
      // Find what we can afford for Step 2
      const affordableTiers = VRAM_TIERS.slice(nextTierIdx).filter(t => t.cost <= effectiveBudget / 2 || t.cost <= effectiveBudget);
      if (affordableTiers.length > 0) {
        // Just take the first affordable one for step 2
        step2 = affordableTiers[0];
        currentCostSpent += step2.cost;
        
        // Find step 3
        const step3Affordable = VRAM_TIERS.slice(VRAM_TIERS.indexOf(step2) + 1).filter(t => t.cost <= effectiveBudget);
        if (step3Affordable.length > 0) {
          step3 = step3Affordable[step3Affordable.length - 1]; // take the best we can afford
        } else {
          // Can't afford a third step
          step3 = null;
        }
      }
    }

    return { step2, step3 };
  }, [currentVram, effectiveBudget]);

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="space-y-4 w-full md:w-1/2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Current Setup</h3>
          <Slider
            label="GPU VRAM"
            min={4} max={48} step={2}
            value={currentVram}
            onChange={setCurrentVram}
            suffix=" GB"
          />
          <Slider
            label="Memory Bandwidth"
            min={100} max={2000} step={10}
            value={currentBw}
            onChange={setCurrentBw}
            suffix=" GB/s"
          />
        </div>

        <div className="space-y-4 w-full md:w-1/2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Budget</h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${budgetType === 'total' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                onClick={() => setBudgetType('total')}
              >
                Total
              </button>
              <button
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${budgetType === 'monthly' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                onClick={() => setBudgetType('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>
          
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          {budgetType === 'monthly' && (
            <p className="text-xs text-slate-500 text-right">Effective 12-mo budget: ${effectiveBudget.toLocaleString()}</p>
          )}
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wide text-center">Upgrade Roadmap</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Current */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col items-center text-center relative">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500 mb-3">1</div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Now ($0)</p>
          <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Current ({currentVram}GB)</p>
          <p className="text-sm text-brand-600 dark:text-brand-400 font-medium">Runs: {currentParams > 0 ? `${currentParams}B @ 4-bit` : 'Too small'}</p>
          <p className="text-xs text-slate-500 mt-1">Speed: {currentParams > 0 ? `${currentSpeed} tok/s` : 'N/A'}</p>
          
          <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 z-10" />
        </div>

        {/* Step 2 */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl p-5 flex flex-col items-center text-center relative">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400 mb-3">2</div>
          {roadmap.step2 ? (
            <>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Next (~${roadmap.step2.cost})</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Add: {roadmap.step2.name}</p>
              <p className="text-sm text-brand-600 dark:text-brand-400 font-medium">Runs: {calculateMaxParams(roadmap.step2.vram)}B @ 4-bit</p>
              <p className="text-xs text-slate-500 mt-1">Speed: {getSpeedForParams(roadmap.step2.vram, roadmap.step2.bw, calculateMaxParams(roadmap.step2.vram))} tok/s</p>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-slate-500">Budget too low for meaningful upgrade</p>
            </div>
          )}
          
          {roadmap.step2 && <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 z-10" />}
        </div>

        {/* Step 3 */}
        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-5 flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-3">3</div>
          {roadmap.step3 ? (
            <>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Future (~${roadmap.step3.cost})</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Replace: {roadmap.step3.name}</p>
              <p className="text-sm text-brand-600 dark:text-brand-400 font-medium">Runs: {calculateMaxParams(roadmap.step3.vram)}B @ 4-bit</p>
              <p className="text-xs text-slate-500 mt-1">Speed: {getSpeedForParams(roadmap.step3.vram, roadmap.step3.bw, calculateMaxParams(roadmap.step3.vram))} tok/s</p>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-sm text-slate-500">
                {roadmap.step2 ? "Requires more budget" : "Requires more budget"}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
