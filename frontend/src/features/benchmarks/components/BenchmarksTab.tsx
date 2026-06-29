import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { supabase } from '../../../services/supabaseClient';
import { Trophy, Code, BrainCircuit, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export const BenchmarksTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'mmlu' | 'gsm8k' | 'human_eval' | 'name'>('mmlu');

  const { data: benchmarks, isLoading: loading } = useQuery({
    queryKey: ['benchmarks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('model_benchmarks')
        .select(`
          *,
          cloud_models (
            friendly_name,
            prompt_price_per_1m_usd,
            completion_price_per_1m_usd,
            tier
          )
        `);
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 60 * 1000,
    enabled: true,
  });

  const filtered = (benchmarks || []).filter((b: any) => 
    b.cloud_models?.friendly_name?.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a: any, b: any) => {
    if (sortBy === 'name') return (a.cloud_models?.friendly_name || '').localeCompare(b.cloud_models?.friendly_name || '');
    return (b[sortBy] || 0) - (a[sortBy] || 0);
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Trophy className="text-amber-500" />
            Model Benchmarks
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
            Compare AI models across standardized benchmarks. MMLU measures general knowledge, GSM8K measures math reasoning, and HumanEval measures coding proficiency.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white"
            >
              <option value="mmlu">MMLU (General)</option>
              <option value="gsm8k">GSM8K (Math)</option>
              <option value="human_eval">HumanEval (Code)</option>
              <option value="name">Model Name</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Model</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  <div className="flex items-center justify-end gap-1">
                    <BrainCircuit size={14} /> MMLU
                  </div>
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Trophy size={14} /> GSM8K
                  </div>
                </th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Code size={14} /> HumanEval
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    <div className="animate-pulse">Loading benchmark data...</div>
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    No models found matching your search.
                  </td>
                </tr>
              ) : (
                sorted.map((b: any, idx) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      {idx === 0 && sortBy !== 'name' && <Trophy className="text-yellow-500" size={16} />}
                      {b.cloud_models?.friendly_name || 'Unknown'}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-slate-900 dark:text-slate-200">
                      {b.mmlu ? `${b.mmlu}%` : '-'}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-slate-900 dark:text-slate-200">
                      {b.gsm8k ? `${b.gsm8k}%` : '-'}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-slate-900 dark:text-slate-200">
                      {b.human_eval ? `${b.human_eval}%` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
