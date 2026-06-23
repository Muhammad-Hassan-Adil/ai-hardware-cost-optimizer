import { GPU, LocalModel, HardwareMatchRequest, HardwareMatchResponse, CloudModel } from '../types/database.types';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

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
