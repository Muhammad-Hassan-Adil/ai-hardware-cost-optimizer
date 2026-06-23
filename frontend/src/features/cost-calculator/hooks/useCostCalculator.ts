import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { CloudModel } from '../../../types/database.types';

export const useCostCalculator = () => {
  const [models, setModels] = useState<CloudModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [promptTokens, setPromptTokens] = useState(1000);
  const [completionTokens, setCompletionTokens] = useState(500);
  const [providerFilter, setProviderFilter] = useState<string>('all');




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
