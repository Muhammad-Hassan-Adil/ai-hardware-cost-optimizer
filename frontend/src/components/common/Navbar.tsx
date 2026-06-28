import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, ChevronDown, Lock } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';

// Dropdown data structure
const navData = {
  matcher: {
    title: 'Hardware Analyzer',
    landing: '?tab=matcher',
    items: [
      { label: 'Analyze Compatibility', href: '?tab=matcher-tool', icon: '🔍' },
      { label: 'Find Bottlenecks', href: '?tab=matcher-tool&tool=bottleneck', icon: '🔥', soon: true },
      { label: 'Upgrade Path Planner', href: '?tab=matcher-tool&tool=upgrade', icon: '📈', soon: true },
      { label: 'Inference Speed', href: '?tab=matcher-tool&tool=speed', icon: '⚡', soon: true },
    ]
  },
  builder: {
    title: 'Rig Configurator',
    landing: '?tab=builder',
    items: [
      { label: 'Build Your Rig', href: '?tab=builder-tool', icon: '🔧' },
      { label: 'Power & Cost', href: '?tab=builder-tool&tool=power', icon: '⚡', soon: true },
      { label: 'PCIe Bandwidth', href: '?tab=builder-tool&tool=pcie', icon: '🔌', soon: true },
      { label: 'Share Config', href: '?tab=builder-tool&tool=share', icon: '🔗', soon: true },
    ]
  },
  cloud: {
    title: 'Cloud Pricing',
    landing: '?tab=cloud',
    items: [
      { label: 'API Cost Calculator', href: '?tab=cloud-tool', icon: '💰' },
      { label: 'Compare Models', href: '?tab=cloud-tool&tool=compare', icon: '📊', soon: true },
      { label: 'Price History', href: '?tab=cloud-tool&tool=history', icon: '📉', soon: true },
      { label: 'Budget Calculator', href: '?tab=cloud-tool&tool=budget', icon: '🧮', soon: true },
      { label: 'Batch vs Realtime', href: '?tab=cloud-tool&tool=batch', icon: '⚡', soon: true },
    ]
  }
};

type TabKey = keyof typeof navData;

export const Navbar: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useAppStore();
  
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
    setActiveTab(tabKey);
    navigate(navData[tabKey].landing);
    setHoveredTab(null);
  };

  const handleItemClick = (href: string, isSoon: boolean) => {
    if (isSoon) return;
    
    // Parse href to extract tab (e.g., ?tab=matcher-tool)
    const urlParams = new URLSearchParams(href.split('?')[1]);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
    navigate(href);
    setHoveredTab(null);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div 
          className="flex-shrink-0 cursor-pointer"
          onClick={() => { setActiveTab('home'); navigate('/?tab=home'); }}
        >
          <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white hover:text-brand-500 transition-colors flex items-center gap-2">
            <span className="text-xl">⚡</span> GPURunner
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-1" onMouseLeave={handleMouseLeave}>
            {(Object.keys(navData) as TabKey[]).map((key) => {
              const tabInfo = navData[key];
              const isActive = activeTab.startsWith(key);
              const isHovered = hoveredTab === key;
              
              return (
                <div 
                  key={key}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(key)}
                >
                  <button 
                    onClick={() => handleTabClick(key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${isActive ? 'text-brand-500' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    {tabInfo.title}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isHovered ? 'rotate-180' : ''}`} />
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-t-md" 
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
                        className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="p-4 bg-slate-50 dark:bg-surface-900 border-b border-slate-100 dark:border-surface-700">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            {tabInfo.items[0].icon} {tabInfo.title}
                          </p>
                        </div>
                        <div className="p-2 flex flex-col gap-1">
                          {tabInfo.items.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleItemClick(item.href, !!item.soon)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group ${item.soon ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-surface-700 cursor-pointer'}`}
                            >
                              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                                <span>{item.icon}</span>
                                {item.label}
                              </span>
                              {item.soon && (
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-surface-900 px-1.5 py-0.5 rounded">
                                  <Lock size={10} /> Soon
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          <div className="md:hidden flex items-center gap-2">
             <select 
               value={activeTab.split('-')[0]}
               onChange={(e) => {
                 const tab = e.target.value as TabKey | 'home';
                 setActiveTab(tab);
                 navigate(tab === 'home' ? '/?tab=home' : navData[tab as TabKey].landing);
               }}
               className="text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded-md p-1.5 text-slate-700 dark:text-slate-300"
             >
               <option value="home">Home</option>
               <option value="matcher">Analyzer</option>
               <option value="builder">Configurator</option>
               <option value="cloud">Cloud</option>
             </select>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-surface-700 transition-colors flex-shrink-0"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
