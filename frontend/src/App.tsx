import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOWrapper } from './components/seo/SEOWrapper';

import { Footer } from './components/common/Footer';
import { Navbar } from './components/common/Navbar';
import { useAppStore } from './store/appStore';

// Pages
import { About } from './pages/About';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { HomePage } from './pages/HomePage';
import { HardwareAnalyzerLanding } from './pages/HardwareAnalyzerLanding';
import { RigConfiguratorLanding } from './pages/RigConfiguratorLanding';
import { CloudPricingLanding } from './pages/CloudPricingLanding';

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
  const [searchParams] = useSearchParams();
  const { activeTab, setActiveTab } = useAppStore();

  // Sync URL to state initially, or if URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab, setActiveTab]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 w-full mt-8">
        {children}
      </main>

      <Footer />
    </div>
  );
};

const CalculatorTabs: React.FC = () => {
  const { activeTab } = useAppStore();

  // Tab 1 State (matcher)
  const { 
    request: hwRequest, 
    updateRequest: updateHwRequest, 
    result: hwResult,
    hardwareItems,
    addHardwareItem,
    updateHardwareItem,
    removeHardwareItem
  } = useHardwareMatcher();

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'matcher':
        return <HardwareAnalyzerLanding />;
      case 'builder':
        return <RigConfiguratorLanding />;
      case 'cloud':
        return <CloudPricingLanding />;
      case 'matcher-tool':
        return (
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
        );
      case 'builder-tool':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <HardwareBuilder 
                hardwareItems={hardwareItems}
                addHardwareItem={addHardwareItem}
                updateHardwareItem={updateHardwareItem}
                removeHardwareItem={removeHardwareItem}
                totalVram={hwRequest.gpuVramGb}
              />
            </div>
            <div className="space-y-6">
              <VRAMBarGraph result={hwResult} />
              <AutoRecommender baseHardware={hwRequest} />
            </div>
          </div>
        );
      case 'cloud-tool':
        return <CostCalculatorTab />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {renderContent()}
        </motion.div>
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
