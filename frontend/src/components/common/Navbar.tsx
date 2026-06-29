import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';

// Dropdown data structure
const navData = {
  matcher: {
    title: 'Hardware Analyzer',
    landing: '/hardware-analyzer',
    items: [
      { label: 'Analyze Compatibility', href: '/hardware-analyzer/tool', icon: '🔍' },
      { label: 'Find Bottlenecks', href: '/hardware-analyzer/bottleneck', icon: '🔥' },
      { label: 'Upgrade Path Planner', href: '/hardware-analyzer/upgrade', icon: '📈' },
      { label: 'Inference Speed', href: '/hardware-analyzer/speed', icon: '⚡' },
    ]
  },
  builder: {
    title: 'Rig Configurator',
    landing: '/rig-configurator',
    items: [
      { label: 'Build Your Rig', href: '/rig-configurator/tool', icon: '🔧' },
      { label: 'Power & Cost', href: '/rig-configurator/power', icon: '⚡' },
      { label: 'PCIe Bandwidth', href: '/rig-configurator/pcie', icon: '🔌' },
      { label: 'Share Config', href: '/rig-configurator/share', icon: '🔗' },
    ]
  },
  cloud: {
    title: 'Cloud Pricing',
    landing: '/cloud-pricing',
    items: [
      { label: 'API Cost Calculator', href: '/cloud-pricing/tool', icon: '💰' },
      { label: 'Compare Models', href: '/cloud-pricing/compare', icon: '📊' },
      { label: 'Price History', href: '/cloud-pricing/history', icon: '📉' },
      { label: 'Budget Calculator', href: '/cloud-pricing/budget', icon: '🧮' },
      { label: 'Batch vs Realtime', href: '/cloud-pricing/batch', icon: '⚡' },
    ]
  }
};

type TabKey = keyof typeof navData;

export const Navbar: React.FC = () => {
  const { isDark, setIsDark } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [hoveredTab, setHoveredTab] = useState<TabKey | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHoveredTab(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseEnter = (tab: TabKey) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setHoveredTab(tab);
    }, 100);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setHoveredTab(null);
    }, 100);
  };

  const handleTabClick = (tabKey: TabKey) => {
    navigate(navData[tabKey].landing);
    setHoveredTab(null);
  };

  const handleItemClick = (href: string) => {
    navigate(href);
    setHoveredTab(null);
  };

  // Determine active main tab for mobile select
  const getActiveTabKey = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/hardware-analyzer')) return 'matcher';
    if (location.pathname.startsWith('/rig-configurator')) return 'builder';
    if (location.pathname.startsWith('/cloud-pricing')) return 'cloud';
    if (location.pathname.startsWith('/benchmarks')) return 'benchmarks';
    return 'home';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div 
          className="flex-shrink-0 cursor-pointer"
          onClick={() => { navigate('/'); }}
        >
          <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white hover:text-blue-500 transition-colors flex items-center gap-2">
            <span className="text-xl">⚡</span> GPURunner
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-1" onMouseLeave={handleMouseLeave}>
            {(Object.keys(navData) as TabKey[]).map((key) => {
              const tabInfo = navData[key];
              const isActive = location.pathname.startsWith(tabInfo.landing);
              const isHovered = hoveredTab === key;
              
              return (
                <div 
                  key={key}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(key)}
                >
                  <button 
                    onClick={() => handleTabClick(key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${isActive ? 'text-blue-500' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    {tabInfo.title}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isHovered ? 'rotate-180' : ''}`} />
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-t-md" 
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {isHovered && (
                      <motion.div 
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            {tabInfo.items[0].icon} {tabInfo.title}
                          </p>
                        </div>
                        <div className="p-2 flex flex-col gap-1">
                          {tabInfo.items.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleItemClick(item.href)}
                              className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                            >
                              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                                <span>{item.icon}</span>
                                {item.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Benchmarks Tab (No Dropdown) */}
            <div className="relative">
              <button 
                onClick={() => {
                  navigate('/benchmarks');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${location.pathname.startsWith('/benchmarks') ? 'text-blue-500' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Benchmarks
                {location.pathname.startsWith('/benchmarks') && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-t-md" 
                  />
                )}
              </button>
            </div>
          </nav>

          <div className="md:hidden flex items-center gap-2">
             <select 
               value={getActiveTabKey()}
               onChange={(e) => {
                 const val = e.target.value;
                 if (val === 'home') navigate('/');
                 else if (val === 'benchmarks') navigate('/benchmarks');
                 else navigate(navData[val as TabKey].landing);
               }}
               className="text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded-md p-1.5 text-slate-700 dark:text-slate-300"
             >
               <option value="home">Home</option>
               <option value="matcher">Analyzer</option>
               <option value="builder">Configurator</option>
               <option value="cloud">Cloud</option>
               <option value="benchmarks">Benchmarks</option>
             </select>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

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
  );
};
