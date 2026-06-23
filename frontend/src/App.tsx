import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SEOWrapper } from './components/seo/SEOWrapper';
import { Tabs } from './components/common/Tabs';

// Tab 1 Components
import { useHardwareMatcher } from './features/hardware-matcher/hooks/useHardwareMatcher';
import { GPUSelector } from './features/hardware-matcher/components/GPUSelector';
import { ModelSelector } from './features/hardware-matcher/components/ModelSelector';
import { VRAMBarGraph } from './features/hardware-matcher/components/VRAMBarGraph';
import { PerformanceEstimator } from './features/hardware-matcher/components/PerformanceEstimator';

// Tab 2 Components
import { useCostCalculator } from './features/cost-calculator/hooks/useCostCalculator';
import { PricingTable } from './features/cost-calculator/components/PricingTable';
import { InteractiveTextSlider } from './features/cost-calculator/components/InteractiveTextSlider';
import { ProviderFilter } from './features/cost-calculator/components/ProviderFilter';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Tab 1 State
  const { request: hwRequest, updateRequest: updateHwRequest, result: hwResult } = useHardwareMatcher();

  // Tab 2 State
  const { 
    models, setModels, loading, setLoading, 
    promptTokens, setPromptTokens, 
    completionTokens, setCompletionTokens,
    providerFilter, setProviderFilter
  } = useCostCalculator();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            AI Hardware & Cost Optimizer Hub
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Accurately estimate local LLM hardware requirements or compare cloud API costs dynamically.
          </p>
        </header>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Tabs 
              tabs={['Local Hardware Matcher', 'Cloud API Cost Calculator']} 
              activeTab={activeTab} 
              onChange={setActiveTab} 
            />
          </div>
        </div>

        {activeTab === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <GPUSelector request={hwRequest} updateRequest={updateHwRequest} />
              <ModelSelector request={hwRequest} updateRequest={updateHwRequest} />
            </div>
            <div className="space-y-6">
              <VRAMBarGraph result={hwResult} />
              <PerformanceEstimator result={hwResult} />
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <InteractiveTextSlider 
                  promptTokens={promptTokens} setPromptTokens={setPromptTokens}
                  completionTokens={completionTokens} setCompletionTokens={setCompletionTokens}
                />
                <ProviderFilter providerFilter={providerFilter} setProviderFilter={setProviderFilter} />
              </div>
              <div className="lg:col-span-2">
                <PricingTable 
                  models={models} setModels={setModels}
                  loading={loading} setLoading={setLoading}
                  promptTokens={promptTokens} completionTokens={completionTokens}
                  providerFilter={providerFilter}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/hardware/:slug" element={
          <SEOWrapper>
            <AppContent />
          </SEOWrapper>
        } />
        <Route path="/vram/:slug" element={
          <SEOWrapper>
            <AppContent />
          </SEOWrapper>
        } />
        <Route path="/model/:slug" element={
          <SEOWrapper>
            <AppContent />
          </SEOWrapper>
        } />
        <Route path="/" element={
          <SEOWrapper>
            <AppContent />
          </SEOWrapper>
        } />
        <Route path="*" element={
          <SEOWrapper>
            <AppContent />
          </SEOWrapper>
        } />
      </Routes>
    </Router>
  );
};

export default App;
