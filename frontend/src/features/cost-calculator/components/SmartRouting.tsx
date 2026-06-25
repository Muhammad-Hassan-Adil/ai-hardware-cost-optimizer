import React, { useMemo } from 'react';
import type { CloudModel } from '../../../types/database.types';
import type { PromptAnalysisResult } from '../utils/analyzer_service';
import { Card } from '../../../components/common/Card';
import { Bot, Zap, ArrowRight, TrendingDown } from 'lucide-react';

interface SmartRoutingProps {
  models: CloudModel[];
  analysis: PromptAnalysisResult;
  providerFilter: string;
}

export const SmartRouting: React.FC<SmartRoutingProps> = ({ models, analysis, providerFilter }) => {
  const routingPlan = useMemo(() => {
    const activeModels = models.filter(m => m.is_active && (providerFilter === 'all' || (m as any).cloud_providers?.slug === providerFilter));
    if (activeModels.length === 0) return null;

    // Helper to calculate total cost for a given subtask on a given model
    // Note: since this is just a general estimate, we use the estimated units * output_tokens
    const getTaskCost = (model: CloudModel, inputTokens: number, outputTokens: number) => {
      const inCost = (model.prompt_price_per_1m_usd / 1000000) * inputTokens;
      const outCost = (model.completion_price_per_1m_usd / 1000000) * outputTokens;
      return inCost + outCost;
    };

    // For smart routing, we need an estimate of input tokens per subtask.
    // We will just use a generic average or allocate the total input tokens evenly for comparison.
    // But since the baseline uses the same input tokens, the delta will be correct regardless.
    const assumedInputTokens = 1000; // placeholder for relative cost comparison

    const tasks = analysis.subtasks.map(task => {
      const outputTokens = task.units * task.output_tokens_per_unit;
      
      let candidateModels = activeModels;

      if (task.type === 'vision' || analysis.vision_required) {
        candidateModels = candidateModels.filter(m => m.supports_vision);
      }
      if (task.type === 'reasoning') {
        candidateModels = candidateModels.filter(m => m.tier !== 'lightweight');
      }

      if (candidateModels.length === 0) candidateModels = activeModels; // fallback

      // Find cheapest
      let cheapestModel = candidateModels[0];
      let minCost = getTaskCost(cheapestModel, assumedInputTokens, outputTokens);

      for (const m of candidateModels) {
        const cost = getTaskCost(m, assumedInputTokens, outputTokens);
        if (cost < minCost) {
          minCost = cost;
          cheapestModel = m;
        }
      }

      return {
        task,
        outputTokens,
        model: cheapestModel,
        cost: minCost,
        assumedInputTokens
      };
    });

    // Find the most expensive model overall to act as the baseline
    let mostExpensiveModel = activeModels[0];
    let maxTotalCost = 0;

    const totalOutputTokens = analysis.total_output_tokens;
    
    for (const m of activeModels) {
      // Total cost if everything was sent to this model
      const totalCost = getTaskCost(m, assumedInputTokens * tasks.length, totalOutputTokens);
      if (totalCost > maxTotalCost) {
        maxTotalCost = totalCost;
        mostExpensiveModel = m;
      }
    }

    const optimalRoutedCost = tasks.reduce((sum, t) => sum + t.cost, 0);
    const savings = maxTotalCost - optimalRoutedCost;
    const savingsPercentage = maxTotalCost > 0 ? (savings / maxTotalCost) * 100 : 0;

    return {
      tasks,
      mostExpensiveModel,
      maxTotalCost,
      optimalRoutedCost,
      savings,
      savingsPercentage
    };

  }, [models, analysis, providerFilter]);

  if (!routingPlan) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-indigo-950/30 border-indigo-100 dark:border-indigo-900/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Smart Routing Recommendation</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Dynamically maps subtasks to the most cost-efficient capable models.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Baseline (Using {routingPlan.mostExpensiveModel.friendly_name})</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">${routingPlan.maxTotalCost.toFixed(4)}</div>
        </div>
        
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-100 dark:ring-indigo-900">
          <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">Optimal Routed Cost</div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">${routingPlan.optimalRoutedCost.toFixed(4)}</div>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/50">
          <div className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">Potential Savings</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            {routingPlan.savingsPercentage.toFixed(1)}%
          </div>
          <div className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">${routingPlan.savings.toFixed(4)} saved per run</div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Recommended Path</h3>
        {routingPlan.tasks.map((t, idx) => (
          <div key={idx} className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
            <div className="flex-1">
              <div className="font-medium text-slate-900 dark:text-slate-200">{t.task.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{t.task.type} • {t.outputTokens} tokens</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            <div className="flex-1 flex justify-end">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700">
                <Bot className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.model.friendly_name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
