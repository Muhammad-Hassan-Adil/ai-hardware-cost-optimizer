import { useState, useEffect } from 'react';
import type { CloudModel } from '../../../types/database.types';
import { supabase } from '../../../services/supabaseClient';

export const useCostCalculator = () => {
  const [models, setModels] = useState<CloudModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [promptTokens, setPromptTokens] = useState(1000);
  const [completionTokens, setCompletionTokens] = useState(500);
  const [providerFilter, setProviderFilter] = useState<string>('all');
  
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
      } else if (error) {
        setError(error.message);
      }
      setLoading(false);
    };
    fetchModels();
  }, []);
  // We'll expose state to the component
  return {
    models,
    setModels,
    loading,
    setLoading,
    error,
    setError,
    promptTokens,
    setPromptTokens,
    completionTokens,
    setCompletionTokens,
    providerFilter,
    setProviderFilter
  };
};
