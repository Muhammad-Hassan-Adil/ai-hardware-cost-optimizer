import React, { useState, useMemo } from 'react';
import { Card } from '../../../components/common/Card';
import { Slider } from '../../../components/common/Slider';
import { useCostCalculator } from '../hooks/useCostCalculator';

export const BudgetCalculator: React.FC = () => {
  const { models } = useCostCalculator();
  const [budget, setBudget] = useState(100);
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);

  const activeModels = models.filter(m => m.is_active);

  const calculatedRequests = useMemo(() => {
    return activeModels.map(m => {
      const costPerRequest = 
        ((m.prompt_price_per_1m_usd / 1000000) * inputTokens) + 
        ((m.completion_price_per_1m_usd / 1000000) * outputTokens);
      
      const requests = costPerRequest > 0 ? Math.floor(budget / costPerRequest) : 0;
      
      return {
        ...m,
        costPerRequest,
        requests
      };
    }).sort((a, b) => b.requests - a.requests);
  }, [activeModels, budget, inputTokens, outputTokens]);

  const topModels = calculatedRequests.filter(m => m.requests > 0).slice(0, 10); // Show top 10 most affordable

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Budget Reverse Calculator</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Enter your budget and typical request size to see how many API calls you can afford across different models.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Total Budget ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                min="1"
                value={budget}
                onChange={(e) => setBudget(Math.max(1, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
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

      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Requests within budget</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topModels.map(m => (
            <div key={m.id} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
              <div className="overflow-hidden pr-2">
                <p className="font-semibold text-slate-900 dark:text-white truncate" title={m.friendly_name}>
                  {m.friendly_name}
                </p>
                <p className="text-xs text-slate-500">
                  ${m.costPerRequest < 0.0001 ? '<0.0001' : m.costPerRequest.toFixed(4)} / req
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-brand-600 dark:text-brand-400">
                  {formatNumber(m.requests)}
                </p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Requests</p>
              </div>
            </div>
          ))}
          {topModels.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-500">
              No models available or budget is too low.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
