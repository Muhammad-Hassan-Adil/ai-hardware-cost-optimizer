import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from './components/common/Footer';
import { Navbar } from './components/common/Navbar';

// Eager load only the homepage and layout
import { HomePage } from './pages/HomePage';

// Lazy load all feature pages
const HardwareAnalyzerLanding = lazy(() => import('./pages/HardwareAnalyzerLanding').then(m => ({ default: m.HardwareAnalyzerLanding })));
const HardwareAnalyzerTool = lazy(() => import('./features/hardware-matcher/components/HardwareAnalyzerTool').then(m => ({ default: m.HardwareAnalyzerTool })));
const BottleneckFinder = lazy(() => import('./features/hardware-matcher/components/BottleneckFinder').then(m => ({ default: m.BottleneckFinder })));
const UpgradePlanner = lazy(() => import('./features/hardware-matcher/components/UpgradePlanner').then(m => ({ default: m.UpgradePlanner })));
const InferenceSpeedEstimator = lazy(() => import('./features/hardware-matcher/components/InferenceSpeedEstimator').then(m => ({ default: m.InferenceSpeedEstimator })));

const RigConfiguratorLanding = lazy(() => import('./pages/RigConfiguratorLanding').then(m => ({ default: m.RigConfiguratorLanding })));
const RigConfiguratorTool = lazy(() => import('./features/hardware-matcher/components/RigConfiguratorTool').then(m => ({ default: m.RigConfiguratorTool })));
const PowerCostCalculator = lazy(() => import('./features/hardware-matcher/components/PowerCostCalculator').then(m => ({ default: m.PowerCostCalculator })));
const PCIeBandwidthChecker = lazy(() => import('./features/hardware-matcher/components/PCIeBandwidthChecker').then(m => ({ default: m.PCIeBandwidthChecker })));
const ShareConfig = lazy(() => import('./features/hardware-matcher/components/ShareConfig').then(m => ({ default: m.ShareConfig })));

const CloudPricingLanding = lazy(() => import('./pages/CloudPricingLanding').then(m => ({ default: m.CloudPricingLanding })));
const CostCalculatorTab = lazy(() => import('./features/cost-calculator/components/CostCalculatorTab').then(m => ({ default: m.CostCalculatorTab })));
const ModelComparison = lazy(() => import('./features/cost-calculator/components/ModelComparison').then(m => ({ default: m.ModelComparison })));
const PriceHistory = lazy(() => import('./features/cost-calculator/components/PriceHistory').then(m => ({ default: m.PriceHistory })));
const BudgetCalculator = lazy(() => import('./features/cost-calculator/components/BudgetCalculator').then(m => ({ default: m.BudgetCalculator })));
const BatchVsRealtime = lazy(() => import('./features/cost-calculator/components/BatchVsRealtime').then(m => ({ default: m.BatchVsRealtime })));

const BenchmarksTab = lazy(() => import('./features/benchmarks/components/BenchmarksTab').then(m => ({ default: m.BenchmarksTab })));

const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));

const TAB_TO_PATH: Record<string, string> = {
  'home': '/',
  'matcher': '/hardware-analyzer',
  'matcher-tool': '/hardware-analyzer/tool',
  'builder': '/rig-configurator',
  'builder-tool': '/rig-configurator/tool',
  'cloud': '/cloud-pricing',
  'cloud-tool': '/cloud-pricing/tool',
  'benchmarks': '/benchmarks',
};

const TOOL_TO_PATH: Record<string, Record<string, string>> = {
  'matcher-tool': {
    'bottleneck': '/hardware-analyzer/bottleneck',
    'upgrade': '/hardware-analyzer/upgrade',
    'speed': '/hardware-analyzer/speed',
  },
  'builder-tool': {
    'power': '/rig-configurator/power',
    'pcie': '/rig-configurator/pcie',
    'share': '/rig-configurator/share',
  },
  'cloud-tool': {
    'compare': '/cloud-pricing/compare',
    'history': '/cloud-pricing/history',
    'budget': '/cloud-pricing/budget',
    'batch': '/cloud-pricing/batch',
  },
};

const LegacyTabRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const tool = searchParams.get('tool');

  if (tab) {
    if (tool && TOOL_TO_PATH[tab]?.[tool]) {
      return <Navigate to={TOOL_TO_PATH[tab][tool]} replace />;
    }
    if (TAB_TO_PATH[tab]) {
      return <Navigate to={TAB_TO_PATH[tab]} replace />;
    }
  }

  return <Navigate to="/" replace />;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 w-full mt-8">
        <div className="max-w-6xl mx-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                {children}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Footer />
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
    <>
      <ScrollToTop />
      <Layout>
        <Routes>
          {/* Homepage */}
          <Route path="/" element={<HomePage />} />

          {/* Hardware Analyzer */}
          <Route path="/hardware-analyzer" element={<HardwareAnalyzerLanding />} />
          <Route path="/hardware-analyzer/tool" element={<HardwareAnalyzerTool />} />
          <Route path="/hardware-analyzer/bottleneck" element={<BottleneckFinder />} />
          <Route path="/hardware-analyzer/upgrade" element={<UpgradePlanner />} />
          <Route path="/hardware-analyzer/speed" element={<InferenceSpeedEstimator />} />

          {/* Rig Configurator */}
          <Route path="/rig-configurator" element={<RigConfiguratorLanding />} />
          <Route path="/rig-configurator/tool" element={<RigConfiguratorTool />} />
          <Route path="/rig-configurator/power" element={<PowerCostCalculator />} />
          <Route path="/rig-configurator/pcie" element={<PCIeBandwidthChecker />} />
          <Route path="/rig-configurator/share" element={<ShareConfig />} />

          {/* Cloud Pricing */}
          <Route path="/cloud-pricing" element={<CloudPricingLanding />} />
          <Route path="/cloud-pricing/tool" element={<CostCalculatorTab />} />
          <Route path="/cloud-pricing/compare" element={<ModelComparison />} />
          <Route path="/cloud-pricing/history" element={<PriceHistory />} />
          <Route path="/cloud-pricing/budget" element={<BudgetCalculator />} />
          <Route path="/cloud-pricing/batch" element={<BatchVsRealtime />} />

          {/* Benchmarks */}
          <Route path="/benchmarks" element={<BenchmarksTab />} />

          {/* Static pages */}
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Legacy redirects */}
          <Route path="/hardware/:slug" element={<Navigate to="/hardware-analyzer" replace />} />
          <Route path="/vram/:slug" element={<Navigate to="/hardware-analyzer" replace />} />
          <Route path="/model/:slug" element={<Navigate to="/hardware-analyzer" replace />} />

          {/* Legacy query param redirect handler */}
          <Route path="*" element={<LegacyTabRedirect />} />
        </Routes>
      </Layout>
    </>
  );
};

export default App;
