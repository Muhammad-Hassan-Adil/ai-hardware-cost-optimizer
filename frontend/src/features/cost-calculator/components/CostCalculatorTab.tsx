import React, { useState } from 'react';
import { useCostCalculator } from '../hooks/useCostCalculator';
import { CostModifiers, type CostModifiersState } from './CostModifiers';
import { PricingTable } from './PricingTable';
import { ProviderFilter } from './ProviderFilter';
import { estimateTokens } from '../utils/tokenEstimator';
import { Card } from '../../../components/common/Card';
import { Slider } from '../../../components/common/Slider';
import { Search } from 'lucide-react';

export const CostCalculatorTab: React.FC = () => {
  const { 
    models, loading,
    promptTokens, setPromptTokens,
    completionTokens, setCompletionTokens,
    providerFilter, setProviderFilter
  } = useCostCalculator();

  const [text, setText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modifiers, setModifiers] = useState<CostModifiersState>({
    promptCaching: false,
    anthropicCacheWrite: false,
    extendedThinking: false,
    batchApi: false,
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    const estimated = estimateTokens(newText);
    if (estimated > 0) {
      setPromptTokens(estimated);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Token Input Fields */}
      <Card className="p-6 space-y-6 bg-white dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Token Estimation</h3>
        
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Paste your prompt to estimate tokens:</label>
          <textarea
            rows={4}
            value={text}
            onChange={handleTextChange}
            className="block p-2.5 w-full text-sm text-slate-900 bg-slate-50 rounded-lg border border-slate-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            placeholder="Paste some text here..."
          ></textarea>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-6">
          <Slider
            label="Input Tokens (Prompt)"
            min={1} max={128000} step={100}
            value={promptTokens}
            onChange={setPromptTokens}
          />
          
          <Slider
            label="Output Tokens (Completion)"
            min={1} max={32000} step={100}
            value={completionTokens}
            onChange={setCompletionTokens}
          />
        </div>
      </Card>

      {/* 2. Modifiers Layer */}
      <CostModifiers 
        modifiers={modifiers}
        setModifiers={setModifiers}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cost Breakdown</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="w-full sm:w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
            />
          </div>
          <div className="w-full sm:w-48">
            <ProviderFilter providerFilter={providerFilter} setProviderFilter={setProviderFilter} />
          </div>
        </div>
      </div>

      {/* 3. Cost Breakdown Display */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading models...</div>
      ) : (
        <PricingTable 
          models={models}
          promptTokens={promptTokens}
          completionTokens={completionTokens}
          modifiers={modifiers}
          providerFilter={providerFilter}
          searchQuery={searchQuery}
        />
      )}
    </div>
  );
};
