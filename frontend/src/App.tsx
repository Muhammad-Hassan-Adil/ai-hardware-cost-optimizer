import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { SEOWrapper } from './components/seo/SEOWrapper';
import { Moon, Sun } from 'lucide-react';

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
  const [isDark, setIsDark] = useState(true);

  // Apply dark class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <header className="py-8 text-center relative max-w-4xl mx-auto px-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className="absolute right-4 top-8 p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            AI Hardware & Cost Optimizer Hub
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-4">
            Accurately estimate local LLM hardware requirements or compare cloud API costs dynamically.
          </p>
        </header>

        <div className="flex justify-center">
          <div className="w-full max-w-md bg-slate-200 dark:bg-slate-800/50 p-1 rounded-lg backdrop-blur-sm border border-slate-300 dark:border-slate-700/50">
            <div className="flex gap-1">
              <Link
                to="/"
                onClick={() => setActiveTab(0)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 text-center ${
                  activeTab === 0
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Local Hardware Matcher
              </Link>
              <Link
                to="/cloud-costs"
                onClick={() => setActiveTab(1)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 text-center ${
                  activeTab === 1
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Cloud API Cost Calculator
              </Link>
            </div>
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
              <div className="lg:col-span-2 min-w-0">
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
