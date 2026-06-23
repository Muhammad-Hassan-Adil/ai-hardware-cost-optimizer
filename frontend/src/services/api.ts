import type { GPU, LocalModel, HardwareMatchRequest, HardwareMatchResponse } from '../types/database.types';

// We use the Vite environment variable if available, otherwise fallback to the live Render backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-hardware-cost-optimizer.onrender.com/api/v1';

export const api = {
  async getGPUs(): Promise<GPU[]> {
    const response = await fetch(`${API_BASE_URL}/hardware/gpus`);
    if (!response.ok) throw new Error('Failed to fetch GPUs');
    return response.json();
  },

  async getLocalModels(): Promise<LocalModel[]> {
    const response = await fetch(`${API_BASE_URL}/hardware/models/local`);
    if (!response.ok) throw new Error('Failed to fetch Local Models');
    return response.json();
  },

  async matchHardware(req: HardwareMatchRequest): Promise<HardwareMatchResponse> {
    const response = await fetch(`${API_BASE_URL}/hardware/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!response.ok) throw new Error('Failed to match hardware');
    return response.json();
  }
};
