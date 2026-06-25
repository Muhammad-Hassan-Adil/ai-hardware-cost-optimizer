import React, { useMemo } from 'react';
import type { CloudModel } from '../../../types/database.types';
import type { PromptAnalysisResult } from '../utils/ollama_service';
import type { CostModifiersState } from './CostModifiers';
import { estimateTextTokens, estimateImageTokens, type ImageResolution } from '../utils/tokenizer_service';
import { Card } from '../../../components/common/Card';
import { Info } from 'lucide-react';

interface ModelCostBreakdownProps {
  models: CloudModel[];
  prompt: string;
  imageCount: number;
  imageResolution: ImageResolution;
  modifiers: CostModifiersState;
  analysis: PromptAnalysisResult | null;
  providerFilter: string;
}

export const ModelCostBreakdown: React.FC<ModelCostBreakdownProps> = ({
  models, prompt, imageCount, imageResolution, modifiers, analysis, providerFilter
}) => {

  const groupedModels = useMemo(() => {
    let filtered = models.filter(m => m.is_active);
    if (providerFilter !== 'all') {
      filtered = filtered.filter(m => (m as any).cloud_providers?.slug === providerFilter);
    }

    const calculated = filtered.map(model => {
      const providerSlug = (model as any).cloud_providers?.slug || 'unknown';
      const providerName = (model as any).cloud_providers?.name || 'Unknown';
      
      const isAnthropic = providerSlug.includes('anthropic');
      const isApprox = isAnthropic || providerSlug.includes('google') || providerSlug.includes('gemini');
      
      const textTokens = estimateTextTokens(prompt, providerSlug);
      const imageTokens = estimateImageTokens(imageCount, imageResolution, providerSlug);
      const totalInputTokens = textTokens + imageTokens;
      
      let outputTokens = analysis ? analysis.total_output_tokens : 0;
      if (modifiers.extendedThinking) {
        outputTokens *= 4; // 4x multiplier for reasoning
      }

      const baseInputCost = (model.prompt_price_per_1m_usd / 1000000) * totalInputTokens;
      let inputCost = baseInputCost;
      let surcharge = 0;

      if (modifiers.promptCaching) {
        inputCost = baseInputCost * 0.1;
        if (modifiers.anthropicCacheWrite && isAnthropic) {
          surcharge = baseInputCost * 0.25;
        }
      }

      const outputCost = (model.completion_price_per_1m_usd / 1000000) * outputTokens;
      
      let subtotal = inputCost + surcharge + outputCost;
      let discount = 0;

      if (modifiers.batchApi) {
        discount = subtotal * 0.5;
        subtotal *= 0.5;
      }

      return {
        ...model,
        providerSlug,
        providerName,
        isApprox,
        textTokens,
        imageTokens,
        totalInputTokens,
        outputTokens,
        inputCost,
        surcharge,
        outputCost,
        subtotal,
        discount
      };
    });

    calculated.sort((a, b) => a.subtotal - b.subtotal);

    const grouped: Record<string, typeof calculated> = {};
    calculated.forEach(item => {
      if (!grouped[item.providerName]) grouped[item.providerName] = [];
      grouped[item.providerName].push(item);
    });

    return grouped;
  }, [models, prompt, imageCount, imageResolution, modifiers, analysis, providerFilter]);

  if (Object.keys(groupedModels).length === 0) {
    return <div className="text-center py-8 text-slate-500">No models found for the selected criteria.</div>;
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedModels).map(([providerName, providerModels]) => (
        <div key={providerName} className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
            {providerName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {providerModels.map(item => (
              <Card key={item.id} className="p-5 flex flex-col h-full hover:shadow-md transition-shadow dark:bg-slate-900">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{item.friendly_name}</h4>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-[10px] rounded uppercase font-bold tracking-wider">
                      {item.isApprox ? 'Approx Input' : 'Exact Input'}
                    </span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-[10px] rounded uppercase font-bold tracking-wider">
                      Est Output
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 text-sm">
                  <div className="flex justify-between items-center group">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      Input Cost
                      {item.isApprox && (
                        <span className="relative cursor-help" title="Token counts for this provider are approximated using character length or cl100k_base.">
                          <Info className="w-3 h-3 text-slate-400" />
                        </span>
                      )}
                    </span>
                    <span className="text-slate-900 dark:text-slate-200">
                      ${item.inputCost < 0.0001 ? '<0.0001' : item.inputCost.toFixed(4)}
                      <span className="text-xs text-slate-400 ml-1">({item.isApprox ? '~' : ''}{item.totalInputTokens.toLocaleString()} t)</span>
                    </span>
                  </div>
                  
                  {item.surcharge > 0 && (
                    <div className="flex justify-between items-center text-orange-600 dark:text-orange-400">
                      <span>Cache Write Surcharge</span>
                      <span>+${item.surcharge.toFixed(4)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Output Cost</span>
                    <span className="text-slate-900 dark:text-slate-200">
                      ${item.outputCost < 0.0001 ? '<0.0001' : item.outputCost.toFixed(4)}
                      <span className="text-xs text-slate-400 ml-1">({item.outputTokens.toLocaleString()} t)</span>
                    </span>
                  </div>

                  {item.discount > 0 && (
                    <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                      <span>Batch Discount</span>
                      <span>-${item.discount.toFixed(4)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center font-bold">
                  <span className="text-slate-900 dark:text-white">Subtotal</span>
                  <span className="text-blue-600 dark:text-blue-400 text-lg">
                    ${item.subtotal < 0.0001 ? '<0.0001' : item.subtotal.toFixed(4)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
