import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
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
import { GPUSelector } from './features/hardware-matcher/components/GPUSelector';
import { ModelSelector } from './features/hardware-matcher/components/ModelSelector';
import { AutoRecommender } from './features/hardware-matcher/components/AutoRecommender';
import { VRAMBarGraph } from './features/hardware-matcher/components/VRAMBarGraph';
import { PerformanceEstimator } from './features/hardware-matcher/components/PerformanceEstimator';

// Tab 2 Components
import { CostCalculatorTab } from './features/cost-calculator/components/CostCalculatorTab';

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

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTab = searchParams.get('tab') || 'matcher';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              AI Hardware & Cost Optimizer Hub
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
              <button 
                onClick={() => navigate('/?tab=matcher')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentTab === 'matcher' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Local Hardware Matcher
              </button>
              <button 
                onClick={() => navigate('/?tab=builder')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentTab === 'builder' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Hardware Builder
              </button>
              <button 
                onClick={() => navigate('/?tab=cloud')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentTab === 'cloud' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Cloud Cost Calculator
              </button>
            </nav>

            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mt-8">
        {children}
      </main>

      <Footer />
    </div>
  );
};

const CalculatorTabs: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabQuery = searchParams.get('tab') || 'matcher';
  const activeTab = tabQuery === 'matcher' ? 0 : tabQuery === 'builder' ? 1 : 2;

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

  // Tab 2 State is now encapsulated in CostCalculatorTab, but we can leave the hook here if other things need it or we can just remove it from App.tsx since it's not used here anymore.
  // Actually, I should remove it from here.

  return (
    <div className="max-w-6xl mx-auto p-6">
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
                <GPUSelector request={hwRequest} updateRequest={updateHwRequest} />
                <ModelSelector request={hwRequest} updateRequest={updateHwRequest} />
              </div>
              <div className="space-y-6">
                <VRAMBarGraph result={hwResult} />
                <PerformanceEstimator result={hwResult} />
              </div>
            </div>
          </motion.div>
        ) : activeTab === 1 ? (
          <motion.div 
            key="tab1"
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
            <CostCalculatorTab />
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
