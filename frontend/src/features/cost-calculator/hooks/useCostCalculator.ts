import { useState } from 'react';
import type { CloudModel } from '../../../types/database.types';

export const useCostCalculator = () => {
  const [models, setModels] = useState<CloudModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [promptTokens, setPromptTokens] = useState(1000);
  const [completionTokens, setCompletionTokens] = useState(500);
  const [providerFilter, setProviderFilter] = useState<string>('all');
  
  // Since we don't have a direct endpoint for just cloud models yet, 
  // wait, the project plan says to fetch from Supabase REST directly or via backend.
  // For now, let's assume we can fetch via Supabase client.
  
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
