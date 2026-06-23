import React from 'react';

interface TabsProps {
  tabs: string[];
  activeTab: number;
  onChange: (index: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex space-x-1 bg-slate-200 dark:bg-slate-800/50 p-1 rounded-lg backdrop-blur-sm border border-slate-300 dark:border-slate-700/50">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          onClick={() => onChange(index)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200
            ${activeTab === index 
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};
