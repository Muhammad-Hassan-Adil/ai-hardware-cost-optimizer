import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Slider } from '../../../components/common/Slider';
import { useCostCalculator } from '../hooks/useCostCalculator';
import { Clock, Zap } from 'lucide-react';

export const BatchVsRealtime: React.FC = () => {
  const { models } = useCostCalculator();
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [requestsPerMonth, setRequestsPerMonth] = useState(10000);
  const [inputTokens, setInputTokens] = useState(2000);
  const [outputTokens, setOutputTokens] = useState(500);

  const activeModels = models.filter(m => m.is_active).sort((a, b) => a.friendly_name.localeCompare(b.friendly_name));

  useEffect(() => {
    if (!selectedModelId && activeModels.length > 0) {
      const defaultId = activeModels.find(m => m.friendly_name.includes('GPT-4o'))?.id || activeModels[0].id;
      setSelectedModelId(defaultId);
    }
  }, [activeModels, selectedModelId]);

  const selectedModel = activeModels.find(m => m.id === selectedModelId);

  const costs = useMemo(() => {
    if (!selectedModel) return null;
    
    const costPerRequest = 
      ((selectedModel.prompt_price_per_1m_usd / 1000000) * inputTokens) + 
      ((selectedModel.completion_price_per_1m_usd / 1000000) * outputTokens);
    
    const realtimeMonthly = costPerRequest * requestsPerMonth;
    
    // Most providers offer 50% off for batch API
    const batchMonthly = realtimeMonthly * 0.5;
    const savings = realtimeMonthly - batchMonthly;
    
    return {
      realtimeMonthly,
      batchMonthly,
      savings
    };
  }, [selectedModel, requestsPerMonth, inputTokens, outputTokens]);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Batch vs Realtime API Savings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Model
            </label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
            >
              {activeModels.map(m => (
                <option key={m.id} value={m.id}>{m.friendly_name}</option>
              ))}
            </select>
          </div>
          
          <Slider
            label="Requests per Month"
            min={1000} max={1000000} step={1000}
            value={requestsPerMonth}
            onChange={setRequestsPerMonth}
          />
        </div>

        <div className="space-y-6">
          <Slider
            label="Avg Input Tokens per Request"
            min={10} max={128000} step={100}
            value={inputTokens}
            onChange={setInputTokens}
          />
          <Slider
            label="Avg Output Tokens per Request"
            min={10} max={32000} step={100}
            value={outputTokens}
            onChange={setOutputTokens}
          />
        </div>
      </div>

      {costs && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
              <Zap className="text-amber-500 mb-3" size={24} />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Realtime API</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                ${costs.realtimeMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-slate-500">per month</p>
            </div>

            <div className="bg-brand-50 dark:bg-brand-900/10 rounded-xl p-6 border border-brand-200 dark:border-brand-800/50 flex flex-col items-center text-center">
              <Clock className="text-brand-500 mb-3" size={24} />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Batch API (50% off)</p>
              <p className="text-3xl font-bold text-brand-600 dark:text-brand-400 mb-2">
                ${costs.batchMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-slate-500">per month</p>
            </div>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800/50 flex flex-col items-center justify-center text-center">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-2">Total Savings</p>
              <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2">
                ${costs.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-600 font-medium">every month</p>
            </div>

          </div>
          
          <p className="mt-4 text-xs text-center text-slate-500">
            Note: Batch APIs (like OpenAI Batch or Anthropic Message Batch) require submitting requests in a file and returning results within 24 hours. They are ideal for bulk processing where immediate responses are not required.
          </p>
        </div>
      )}
    </Card>
  );
};
