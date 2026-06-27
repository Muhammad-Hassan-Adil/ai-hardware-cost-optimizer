import React, { useState } from 'react';
import { useCostCalculator } from '../hooks/useCostCalculator';
import { PromptDecomposer } from './PromptDecomposer';
import { CostModifiers, type CostModifiersState } from './CostModifiers';
import { ModelCostBreakdown } from './ModelCostBreakdown';
import { SmartRouting } from './SmartRouting';
import { ProviderFilter } from './ProviderFilter';
import type { ImageResolution } from '../utils/tokenizer_service';
import type { PromptAnalysisResult } from '../utils/analyzer_service';

export const CostCalculatorTab: React.FC = () => {
  const { 
    models, loading,
    providerFilter, setProviderFilter
  } = useCostCalculator();

  const [prompt, setPrompt] = useState('');
  const [imageCount, setImageCount] = useState(0);
  const [imageResolution, setImageResolution] = useState<ImageResolution>('medium');
  const [analysis, setAnalysis] = useState<PromptAnalysisResult | null>(null);
  const [modifiers, setModifiers] = useState<CostModifiersState>({
    promptCaching: false,
    anthropicCacheWrite: false,
    extendedThinking: false,
    batchApi: false,
  });

  return (
    <div className="space-y-8">
      {/* 1. Prompt Decomposer Input */}
      <PromptDecomposer 
        prompt={prompt}
        setPrompt={setPrompt}
        imageCount={imageCount}
        setImageCount={setImageCount}
        imageResolution={imageResolution}
        setImageResolution={setImageResolution}
        analysis={analysis}
        setAnalysis={setAnalysis}
      />

      {/* 2. Modifiers Layer */}
      <CostModifiers 
        modifiers={modifiers}
        setModifiers={setModifiers}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cost Breakdown</h2>
        <div className="w-full md:w-64">
          <ProviderFilter providerFilter={providerFilter} setProviderFilter={setProviderFilter} />
        </div>
      </div>

      {/* 3. Cost Breakdown Display */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading models...</div>
      ) : (
        <ModelCostBreakdown 
          models={models}
          prompt={prompt}
          imageCount={imageCount}
          imageResolution={imageResolution}
          modifiers={modifiers}
          analysis={analysis}
          providerFilter={providerFilter}
        />
      )}

      {/* 4. Tiered Routing Recommendation */}
      {analysis && !loading && (
        <SmartRouting 
          models={models}
          analysis={analysis}
          providerFilter={providerFilter}
        />
      )}

    </div>
  );
};
