import React, { useEffect, useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { Search } from 'lucide-react';
import type { CloudModel } from '../../../types/database.types';
import { Card } from '../../../components/common/Card';

interface PricingTableProps {
  models: CloudModel[];
  setModels: (models: CloudModel[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  promptTokens: number;
  completionTokens: number;
  providerFilter: string;
}

export const PricingTable: React.FC<PricingTableProps> = ({
  models, setModels, loading, setLoading, promptTokens, completionTokens, providerFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, providerFilter]);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('cloud_models')
        .select('*, cloud_providers!inner(slug, name)')
        .eq('is_active', true)
        .order('prompt_price_per_1m_usd', { ascending: true });
        
      if (!error && data) {
        setModels(data as any[]);
      }
      setLoading(false);
    };
    fetchModels();
  }, [setModels, setLoading]);

  const filteredModels = models.filter(m => {
    const matchesProvider = providerFilter === 'all' || (m as any).cloud_providers?.slug === providerFilter;
    const matchesSearch = m.friendly_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvider && matchesSearch;
  });

  const totalPages = Math.ceil(filteredModels.length / rowsPerPage);
  const paginatedModels = filteredModels.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search models (e.g., GPT-4, Claude)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
        />
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto w-full custom-scrollbar">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400 border-collapse min-w-[600px]">
          <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">Model</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">Provider</th>
              <th scope="col" className="px-6 py-3 text-right whitespace-nowrap">Context</th>
              <th scope="col" className="px-6 py-3 text-right whitespace-nowrap">Cost per Request</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center">Loading pricing data...</td></tr>
            ) : paginatedModels.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center">No models found</td></tr>
            ) : (
              paginatedModels.map((model) => {
                const promptCost = (model.prompt_price_per_1m_usd / 1000000) * promptTokens;
                const completionCost = (model.completion_price_per_1m_usd / 1000000) * completionTokens;
                const totalCost = promptCost + completionCost;

                return (
                  <tr key={model.id} className="bg-white dark:bg-slate-800 border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-900/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {model.friendly_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(model as any).cloud_providers?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {model.context_length.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      ${totalCost < 0.0001 ? '<$0.0001' : totalCost.toFixed(4)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 gap-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-white">{((currentPage - 1) * rowsPerPage) + 1}</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(currentPage * rowsPerPage, filteredModels.length)}</span> of <span className="font-medium text-slate-900 dark:text-white">{filteredModels.length}</span> models
            </div>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 disabled:opacity-50 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 disabled:opacity-50 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      </Card>
    </div>
  );
};
