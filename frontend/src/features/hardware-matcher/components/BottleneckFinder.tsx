import React, { useState, useMemo } from 'react';
import { calculateHardwareMatch } from '../utils/memoryMath';
import type { HardwareMatchRequest } from '../utils/memoryMath';
import { Card } from '../../../components/common/Card';
import { Slider } from '../../../components/common/Slider';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const BottleneckFinder: React.FC = () => {
  const [request, setRequest] = useState<HardwareMatchRequest>({
    gpuVramGb: 16,
    gpuMemoryBandwidthGbps: 400,
    systemRamGb: 32,
    systemRamBandwidthGbps: 60,
    parametersBillion: 13,
    bitsPerWeight: 4,
    targetSequenceLength: 4096,
  });

  const result = useMemo(() => calculateHardwareMatch(request), [request]);

  const determineBottlenecks = () => {
    let primary = null;
    let secondary = null;
    let upgrade = null;
    
    const vramNeeded = result.totalRequiredGb;
    const vramAvail = result.vramAvailableGb;
    const sysRamAvail = request.systemRamGb || 0;

    if (result.status === 'OUT_OF_MEMORY') {
      primary = {
        title: 'VRAM (Out of Memory)',
        desc: `${vramNeeded.toFixed(1)} GB needed, ${vramAvail.toFixed(1)} GB available`,
        status: 'critical'
      };
      if (vramNeeded > vramAvail + sysRamAvail) {
        secondary = {
          title: 'System RAM insufficient',
          desc: `Needs ${vramNeeded.toFixed(1)} GB total across VRAM + RAM`,
          status: 'critical'
        };
      }
    } else if (result.status === 'SYSTEM_OFFLOAD') {
      primary = {
        title: 'VRAM (Requires Offload)',
        desc: `${vramNeeded.toFixed(1)} GB needed, ${vramAvail.toFixed(1)} GB available`,
        status: 'warning'
      };
      if (result.estimatedTokensPerSecond < 5) {
        secondary = {
          title: 'Memory Bandwidth Bottleneck',
          desc: `System RAM bandwidth (${request.systemRamBandwidthGbps} GB/s) is severely limiting speed`,
          status: 'warning'
        };
      } else {
        secondary = {
          title: 'Bandwidth Adequate',
          desc: `System RAM is keeping up (${result.estimatedTokensPerSecond} tok/s)`,
          status: 'ok'
        };
      }
    } else {
      if (result.estimatedTokensPerSecond < 10) {
        primary = {
          title: 'GPU Bandwidth',
          desc: `VRAM is sufficient, but GPU bandwidth (${request.gpuMemoryBandwidthGbps} GB/s) is slow`,
          status: 'warning'
        };
      } else {
        primary = {
          title: 'No major bottlenecks',
          desc: 'System is running optimally',
          status: 'ok'
        };
      }
    }

    // Determine Upgrade Recommendation
    const vramTiers = [8, 12, 16, 24, 48, 80];
    const prices = {
      8: '$100-200',
      12: '$150-300',
      16: '$200-400',
      24: '$300-500',
      48: '$800-1200',
      80: '$10,000+'
    };

    if (result.status !== 'VRAM_FIT') {
      const required = vramNeeded + 1.5; // Account for OS overhead
      const nextTier = vramTiers.find(t => t >= required);
      
      if (nextTier) {
        upgrade = {
          action: `Upgrade to ${nextTier}GB VRAM GPU`,
          cost: prices[nextTier as keyof typeof prices],
          impact: 'Enables full VRAM fit, removes system offload penalty'
        };
      } else {
        upgrade = {
          action: `Upgrade to Multi-GPU setup (80GB+)`,
          cost: '$10,000+',
          impact: 'Required to fit this massive model'
        };
      }
    } else if (result.estimatedTokensPerSecond < 10) {
      upgrade = {
        action: 'Upgrade to GPU with higher memory bandwidth',
        cost: 'Depends on model',
        impact: 'Significantly increases token generation speed'
      };
    } else {
      upgrade = {
        action: 'None required',
        cost: '$0',
        impact: 'System runs this model well'
      };
    }

    return { primary, secondary, upgrade };
  };

  const { primary, secondary, upgrade } = determineBottlenecks();

  const renderStatusIcon = (status?: string) => {
    if (status === 'critical') return <AlertTriangle className="text-red-500" size={18} />;
    if (status === 'warning') return <AlertTriangle className="text-amber-500" size={18} />;
    if (status === 'ok') return <CheckCircle className="text-emerald-500" size={18} />;
    return <Info className="text-blue-500" size={18} />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hardware Config</h3>
        
        <div className="space-y-4">
          <Slider
            label="GPU VRAM"
            min={4} max={80} step={2}
            value={request.gpuVramGb}
            onChange={(v) => setRequest({ ...request, gpuVramGb: v })}
            suffix=" GB"
          />
          <Slider
            label="GPU Bandwidth"
            min={100} max={2000} step={10}
            value={request.gpuMemoryBandwidthGbps}
            onChange={(v) => setRequest({ ...request, gpuMemoryBandwidthGbps: v })}
            suffix=" GB/s"
          />
          <Slider
            label="System RAM"
            min={8} max={128} step={8}
            value={request.systemRamGb || 32}
            onChange={(v) => setRequest({ ...request, systemRamGb: v })}
            suffix=" GB"
          />
        </div>

        <hr className="border-slate-200 dark:border-slate-700" />

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">Model Config</h3>
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
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Quantization
            </label>
            <select
              value={request.bitsPerWeight}
              onChange={(e) => setRequest({ ...request, bitsPerWeight: Number(e.target.value) })}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>2-bit (Extreme)</option>
              <option value={4}>4-bit (Recommended)</option>
              <option value={8}>8-bit (High Quality)</option>
              <option value={16}>16-bit (Uncompressed)</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Bottleneck Analysis</h3>
        
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Bottleneck</p>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{renderStatusIcon(primary?.status)}</div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{primary?.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{primary?.desc}</p>
              </div>
            </div>
          </div>

          {secondary && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Secondary</p>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{renderStatusIcon(secondary.status)}</div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{secondary.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{secondary.desc}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recommended Upgrade</p>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
              <p className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                → {upgrade?.action}
              </p>
              <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-300">
                <li><span className="text-slate-500 dark:text-slate-400">Est. cost:</span> {upgrade?.cost}</li>
                <li><span className="text-slate-500 dark:text-slate-400">Impact:</span> {upgrade?.impact}</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
