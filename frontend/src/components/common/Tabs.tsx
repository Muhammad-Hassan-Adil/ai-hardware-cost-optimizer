import React from 'react';

interface TabsProps {
  tabs: string[];
  activeTab: number;
  onChange: (index: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          onClick={() => onChange(index)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200
            ${activeTab === index 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};
