import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '../../../components/common/Card';
import { api } from '../../../services/api';
import type { LocalModel } from '../../../types/database.types';
import { calculateHardwareMatch, type HardwareMatchRequest } from '../utils/memoryMath';
import { Cpu, Zap, HardDrive, Sparkles } from 'lucide-react';

interface AutoRecommenderProps {
  baseHardware: {
    gpuVramGb: number;
    gpuMemoryBandwidthGbps: number;
    systemRamGb?: number;
    systemRamBandwidthGbps?: number;
  };
}

interface Recommendation {
  model: LocalModel;
  quantization: any;
  tier: 1 | 2;
  tokensPerSecond: number;
}

export const AutoRecommender: React.FC<AutoRecommenderProps> = ({ baseHardware }) => {
  const [models, setModels] = useState<LocalModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLocalModels()
      .then(setModels)
      .catch(e => console.error("Failed to load models:", e))
      .finally(() => setLoading(false));
  }, []);

  const recommendations = useMemo(() => {
    if (!models.length || baseHardware.gpuVramGb === 0) return [];
    
    const validRecs: Recommendation[] = [];

    for (const model of models) {
      if (!model.quantizations) continue;

      for (const quant of model.quantizations) {
        const req: HardwareMatchRequest = {
          ...baseHardware,
          parametersBillion: model.parameter_size_billion,
          bitsPerWeight: quant.bits_per_weight,
          targetSequenceLength: 4096,
        };

        const result = calculateHardwareMatch(req);

        if (result.status === 'VRAM_FIT') {
          validRecs.push({ model, quantization: quant, tier: 1, tokensPerSecond: result.estimatedTokensPerSecond });
        } else if (result.status === 'SYSTEM_OFFLOAD') {
          validRecs.push({ model, quantization: quant, tier: 2, tokensPerSecond: result.estimatedTokensPerSecond });
        }
      }
    }

    validRecs.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier; 
      if (b.model.parameter_size_billion !== a.model.parameter_size_billion) {
        return b.model.parameter_size_billion - a.model.parameter_size_billion;
      }
      return b.quantization.bits_per_weight - a.quantization.bits_per_weight;
    });

    const finalRecs: Recommendation[] = [];
    const seenModelIds = new Set<string>();

    for (const rec of validRecs) {
      if (!seenModelIds.has(rec.model.id)) {
        seenModelIds.add(rec.model.id);
        finalRecs.push(rec);
        if (finalRecs.length >= 3) break;
      }
    }

    return finalRecs;
  }, [models, baseHardware]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-slate-500">
          <Sparkles className="animate-pulse" /> Analyzing your hardware...
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-6 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
        <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">Needs More VRAM</h3>
        <p className="text-amber-700 dark:text-amber-300/80 text-sm">
          Add at least a custom GPU to see which models will run on your setup.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow-sm">
          <Sparkles size={20} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Optimal Models For Your Rig</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec, idx) => (
          <Card key={idx} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/80">
            {/* Rank Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-bl from-indigo-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm">
              #{idx + 1}
            </div>

            <div className="p-5">
              <h4 className="font-bold text-lg text-slate-900 dark:text-white truncate mb-1">
                {rec.model.name}
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
                <Cpu size={14} /> {rec.model.parameter_size_billion}B Parameters
              </p>

              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                  <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <HardDrive size={14} /> Quantization
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                    {rec.quantization.quant_type}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                  <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Zap size={14} /> Est. Speed
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                    {rec.tokensPerSecond.toFixed(1)} t/s
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${rec.tier === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {rec.tier === 1 ? '100% VRAM Fit (Fast)' : 'System RAM Offload (Slow)'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
