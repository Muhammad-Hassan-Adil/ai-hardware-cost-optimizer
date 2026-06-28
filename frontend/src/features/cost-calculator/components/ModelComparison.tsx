import React, { useState, useMemo } from 'react';
import { X, Plus, ChevronDown, Check } from 'lucide-react';
import type { CloudModel } from '../../../types/database.types';
import { useCostCalculator } from '../hooks/useCostCalculator';
import { Card } from '../../../components/common/Card';
import { Slider } from '../../../components/common/Slider';

export const ModelComparison: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inputTokens, setInputTokens] = useState(10000);
  const [outputTokens, setOutputTokens] = useState(2000);
  const [showDropdown, setShowDropdown] = useState(false);

  const { models } = useCostCalculator();

  const activeModels = models.filter(m => m.is_active);

  // Initialize with some default models if empty and data is loaded
  React.useEffect(() => {
    if (selectedIds.length === 0 && activeModels.length > 0) {
      const gpt4o = activeModels.find(m => m.friendly_name.includes('GPT-4o') && !m.friendly_name.includes('mini'))?.id;
      const sonnet = activeModels.find(m => m.friendly_name.includes('Sonnet'))?.id;
      const flash = activeModels.find(m => m.friendly_name.includes('Flash'))?.id;
      const initial = [gpt4o, sonnet, flash].filter(Boolean) as string[];
      if (initial.length > 0) setSelectedIds(initial);
    }
  }, [activeModels.length]);

  const selectedModels = useMemo(() => {
    return selectedIds.map(id => activeModels.find(m => m.id === id)).filter(Boolean) as CloudModel[];
  }, [selectedIds, activeModels]);

  const addModel = (id: string) => {
    if (selectedIds.length < 5 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
    setShowDropdown(false);
  };

  const removeModel = (id: string) => {
    setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
  };

  const getProviderName = (m: CloudModel) => (m as any).cloud_providers?.name || 'Unknown';

  const calculatedCosts = useMemo(() => {
    return selectedModels.map(m => {
      const inCost = (m.prompt_price_per_1m_usd / 1000000) * inputTokens;
      const outCost = (m.completion_price_per_1m_usd / 1000000) * outputTokens;
      return { ...m, inCost, outCost, totalCost: inCost + outCost };
    });
  }, [selectedModels, inputTokens, outputTokens]);

  const minCost = Math.min(...calculatedCosts.map(m => m.totalCost));
  const cheapestModel = calculatedCosts.find(m => m.totalCost === minCost);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Model Comparison</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Select models to compare (2-5):
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={selectedIds.length >= 5}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 rounded-md text-sm font-medium hover:bg-brand-100 dark:hover:bg-brand-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={16} /> Add Model <ChevronDown size={14} />
              </button>
              
              {showDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-10 custom-scrollbar">
                  {activeModels.map(m => {
                    const isSelected = selectedIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        disabled={isSelected}
                        onClick={() => addModel(m.id)}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${isSelected ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-400 cursor-default' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                      >
                        <span className="truncate pr-2">{m.friendly_name}</span>
                        {isSelected && <Check size={14} className="flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedModels.map(m => (
              <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-300">
                {m.friendly_name}
                <button onClick={() => removeModel(m.id)} className="hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Slider
            label="Input Tokens"
            min={100} max={128000} step={100}
            value={inputTokens}
            onChange={setInputTokens}
          />
          <Slider
            label="Output Tokens"
            min={100} max={32000} step={100}
            value={outputTokens}
            onChange={setOutputTokens}
          />
        </div>

        {selectedModels.length > 0 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 overflow-x-auto">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Comparison Matrix</h4>
            
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4 bg-slate-50 dark:bg-slate-900/50 text-sm font-medium text-slate-600 dark:text-slate-400 w-48">Feature</th>
                  {calculatedCosts.map(m => (
                    <th key={m.id} className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {m.friendly_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                <tr className="text-sm">
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/20">Provider</td>
                  {calculatedCosts.map(m => (
                    <td key={m.id} className="py-3 px-4 text-slate-600 dark:text-slate-400">{getProviderName(m)}</td>
                  ))}
                </tr>
                <tr className="text-sm">
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/20">Tier</td>
                  {calculatedCosts.map(m => (
                    <td key={m.id} className="py-3 px-4 text-slate-600 dark:text-slate-400 capitalize">{m.tier}</td>
                  ))}
                </tr>
                <tr className="text-sm bg-blue-50/30 dark:bg-blue-900/5">
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/20">Input Cost</td>
                  {calculatedCosts.map(m => (
                    <td key={m.id} className="py-3 px-4 text-slate-900 dark:text-slate-200 font-mono">
                      ${m.inCost < 0.0001 ? '<0.0001' : m.inCost.toFixed(4)}
                    </td>
                  ))}
                </tr>
                <tr className="text-sm bg-blue-50/30 dark:bg-blue-900/5">
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/20">Output Cost</td>
                  {calculatedCosts.map(m => (
                    <td key={m.id} className="py-3 px-4 text-slate-900 dark:text-slate-200 font-mono">
                      ${m.outCost < 0.0001 ? '<0.0001' : m.outCost.toFixed(4)}
                    </td>
                  ))}
                </tr>
                <tr className="text-sm font-bold bg-brand-50/50 dark:bg-brand-900/10">
                  <td className="py-4 px-4 text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/20">Total Cost</td>
                  {calculatedCosts.map(m => (
                    <td key={m.id} className={`py-4 px-4 text-lg font-mono ${m.totalCost === minCost ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-slate-200'}`}>
                      ${m.totalCost < 0.0001 ? '<0.0001' : m.totalCost.toFixed(4)}
                    </td>
                  ))}
                </tr>
                <tr className="text-sm">
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/20">Context Window</td>
                  {calculatedCosts.map(m => (
                    <td key={m.id} className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {(m.context_length / 1000).toFixed(0)}k
                    </td>
                  ))}
                </tr>
                <tr className="text-sm">
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/20">Vision Support</td>
                  {calculatedCosts.map(m => (
                    <td key={m.id} className="py-3 px-4">
                      {m.supports_vision ? (
                        <Check size={16} className="text-emerald-500" />
                      ) : (
                        <X size={16} className="text-slate-400" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            {cheapestModel && calculatedCosts.length > 1 && (
              <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-2">
                  <span>Cheapest option:</span>
                  <span className="font-bold">{cheapestModel.friendly_name}</span>
                </div>
                {/* Visual bar graph representation */}
                <div className="space-y-2 mt-4">
                  {calculatedCosts.sort((a,b) => a.totalCost - b.totalCost).map(m => {
                    const widthPct = Math.max(2, (m.totalCost / (Math.max(...calculatedCosts.map(c => c.totalCost)))) * 100);
                    return (
                      <div key={m.id} className="flex items-center gap-3 text-xs">
                        <div className="w-32 truncate text-slate-600 dark:text-slate-400 text-right">
                          {m.friendly_name}
                        </div>
                        <div className="flex-1 flex items-center">
                          <div 
                            className={`h-4 rounded-sm ${m.id === cheapestModel.id ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} 
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
