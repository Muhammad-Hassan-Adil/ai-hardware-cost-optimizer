import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOWrapper } from './components/seo/SEOWrapper';
import { Moon, Sun } from 'lucide-react';
import { Footer } from './components/common/Footer';

// Pages
import { About } from './pages/About';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';

// Tab 1 Components
import { useHardwareMatcher } from './features/hardware-matcher/hooks/useHardwareMatcher';
import { HardwareBuilder } from './features/hardware-matcher/components/HardwareBuilder';
import { ModelSelector } from './features/hardware-matcher/components/ModelSelector';
import { AutoRecommender } from './features/hardware-matcher/components/AutoRecommender';
import { VRAMBarGraph } from './features/hardware-matcher/components/VRAMBarGraph';
import { PerformanceEstimator } from './features/hardware-matcher/components/PerformanceEstimator';

// Tab 2 Components
import { useCostCalculator } from './features/cost-calculator/hooks/useCostCalculator';
import { PricingTable } from './features/cost-calculator/components/PricingTable';
import { InteractiveTextSlider } from './features/cost-calculator/components/InteractiveTextSlider';
import { ProviderFilter } from './features/cost-calculator/components/ProviderFilter';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  // Apply dark class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="py-8 text-center relative max-w-4xl mx-auto px-4 w-full">
        <button
          onClick={() => setIsDark(!isDark)}
          className="absolute right-4 top-8 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <Link to="/">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            AI Hardware & Cost Optimizer Hub
          </h1>
        </Link>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-4">
          Accurately estimate local LLM hardware requirements or compare cloud API costs dynamically.
        </p>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <Footer />
    </div>
  );
};

const CalculatorTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Tab 1 State
  const { 
    request: hwRequest, 
    updateRequest: updateHwRequest, 
    result: hwResult,
    hardwareItems,
    addHardwareItem,
    updateHardwareItem,
    removeHardwareItem
  } = useHardwareMatcher();

  // Tab 2 State
  const { 
    models, setModels, loading, setLoading, 
    promptTokens, setPromptTokens, 
    completionTokens, setCompletionTokens,
    providerFilter, setProviderFilter
  } = useCostCalculator();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-center">
        <div className="w-full max-w-md bg-white dark:bg-slate-800/50 p-1 rounded-xl backdrop-blur-xl border border-slate-300 dark:border-slate-700/50 shadow-sm">
          <div className="flex gap-1 relative">
            <button
              onClick={() => setActiveTab(0)}
              className={`flex-1 relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-center ${
                activeTab === 0
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Local Hardware Matcher
            </button>
            <button
              onClick={() => setActiveTab(1)}
              className={`flex-1 relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-center ${
                activeTab === 1
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cloud API Cost Calculator
            </button>

            {/* Framer motion pill for active tab background */}
            <motion.div 
              className="absolute inset-y-1 bg-blue-600 dark:bg-blue-600 rounded-lg shadow-sm z-0"
              initial={false}
              animate={{
                left: activeTab === 0 ? '0.25rem' : '50%',
                width: 'calc(50% - 0.25rem)'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 0 ? (
          <motion.div 
            key="tab0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <HardwareBuilder 
                  hardwareItems={hardwareItems}
                  addHardwareItem={addHardwareItem}
                  updateHardwareItem={updateHardwareItem}
                  removeHardwareItem={removeHardwareItem}
                  totalVram={hwRequest.gpuVramGb}
                />
                <ModelSelector request={hwRequest} updateRequest={updateHwRequest} />
              </div>
              <div className="space-y-6">
                <VRAMBarGraph result={hwResult} />
                <PerformanceEstimator result={hwResult} />
              </div>
            </div>
            <AutoRecommender baseHardware={hwRequest} />
          </motion.div>
        ) : (
          <motion.div 
            key="tab1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ScrollToTop handles scrolling to the top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={
            <SEOWrapper>
              <CalculatorTabs />
            </SEOWrapper>
          } />
          {/* Legacy generic param routes, pointing to main app */}
          <Route path="/hardware/:slug" element={
            <SEOWrapper>
              <CalculatorTabs />
            </SEOWrapper>
          } />
          <Route path="/vram/:slug" element={
            <SEOWrapper>
              <CalculatorTabs />
            </SEOWrapper>
          } />
          <Route path="/model/:slug" element={
            <SEOWrapper>
              <CalculatorTabs />
            </SEOWrapper>
          } />
          
          {/* New Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          
          <Route path="*" element={<CalculatorTabs />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
