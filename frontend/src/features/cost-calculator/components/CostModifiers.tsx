import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface CostModifiersState {
  promptCaching: boolean;
  anthropicCacheWrite: boolean;
  extendedThinking: boolean;
  batchApi: boolean;
}

interface CostModifiersProps {
  modifiers: CostModifiersState;
  setModifiers: React.Dispatch<React.SetStateAction<CostModifiersState>>;
}

export const CostModifiers: React.FC<CostModifiersProps> = ({ modifiers, setModifiers }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModifier = (key: keyof CostModifiersState) => {
    setModifiers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card className="overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
      >
        <h3 className="text-sm font-medium text-slate-900 dark:text-white">Advanced Modifiers</h3>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
      </button>

      {isOpen && (
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={modifiers.promptCaching}
                onChange={() => toggleModifier('promptCaching')}
              />
              <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
              <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Prompt Caching</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Applies a 90% discount (x0.1) on input text tokens assuming full cache hit.</div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={modifiers.anthropicCacheWrite}
                onChange={() => toggleModifier('anthropicCacheWrite')}
                disabled={!modifiers.promptCaching}
              />
              <div className={`w-5 h-5 border-2 rounded transition-colors ${modifiers.promptCaching ? 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 peer-checked:bg-blue-600 peer-checked:border-blue-600' : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed'}`}></div>
              <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={!modifiers.promptCaching ? 'opacity-50' : ''}>
              <div className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Anthropic Cache Write Surcharge</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Adds 25% to the base input cost for writing to the cache (Anthropic models only). Requires Prompt Caching to be enabled.</div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={modifiers.extendedThinking}
                onChange={() => toggleModifier('extendedThinking')}
              />
              <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
              <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Extended Thinking (o1-like reasoning)</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Multiplies output tokens by 3–5x. We use 4x for calculations.</div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={modifiers.batchApi}
                onChange={() => toggleModifier('batchApi')}
              />
              <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
              <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Batch API Mode</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Applies a 50% discount to the total final cost.</div>
            </div>
          </label>
        </div>
      )}
    </Card>
  );
};
