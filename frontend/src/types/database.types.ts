export interface GPU {
  id: string;
  name: string;
  slug: string;
  vram_gb: number;
  memory_bandwidth_gb_s: number;
  bus_width_bits: number;
  tdp_watts?: number;
  manufacturer: string;
}

export interface Quantization {
  id: string;
  model_id: string;
  quant_type: string;
  bits_per_weight: number;
  file_size_gb: number;
  recommended_vram_gb: number;
}

export interface LocalModel {
  id: string;
  name: string;
  family: string;
  slug: string;
  parameter_size_billion: number;
  context_length: number;
  huggingface_repo?: string;
  quantizations: Quantization[];
}

export interface HardwareMatchRequest {
  gpu_vram_gb: number;
  gpu_memory_bandwidth_gb_s: number;
  system_ram_gb?: number;
  system_ram_bandwidth_gb_s?: number;
  parameters_billion: number;
  bits_per_weight: number;
  target_sequence_length?: number;
}

export interface HardwareMatchResponse {
  status: "VRAM_FIT" | "SYSTEM_OFFLOAD" | "OUT_OF_MEMORY";
  m_weights_gb: number;
  m_cache_gb: number;
  total_required_gb: number;
  vram_available_gb: number;
  gpu_weight_fraction: number;
  estimated_tokens_per_second: number;
}

export interface CloudModel {
  id: string;
  provider_id: string;
  openrouter_id: string;
  friendly_name: string;
  prompt_price_per_1m_usd: number;
  completion_price_per_1m_usd: number;
  context_length: number;
  is_active: boolean;
}
