export interface GPU {
  id: string;
  name: string;
  slug: string;
  vram_gb: number;
  memory_bandwidth_gb_s: number;
  bus_width_bits: number;
  tdp_watts?: number;
  manufacturer: string;
  created_at?: string;
  updated_at?: string;
}

export interface Quantization {
  id: string;
  model_id: string;
  quant_type: string;
  bits_per_weight: number;
  file_size_gb: number;
  recommended_vram_gb: number;
  created_at?: string;
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
  created_at?: string;
  updated_at?: string;
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
  supports_vision: boolean;
  tier: "lightweight" | "standard" | "frontier";
  created_at?: string;
  last_synced_at?: string;
}

export interface PromptAnalysis {
  id: string;
  created_at: string;
  prompt_text: string;
  image_count: number;
  image_size: string;
  analysis: any; // Or type it strictly according to the Ollama output
  total_input_tokens: number;
  total_output_tokens: number;
  confidence: number;
}

export interface ModelBenchmark {
  id: string;
  model_id: string;
  mmlu: number | null;
  gsm8k: number | null;
  human_eval: number | null;
  created_at: string;
  cloud_models?: {
    friendly_name: string;
    prompt_price_per_1m_usd: number;
    completion_price_per_1m_usd: number;
    tier: string;
  };
}

export interface PriceHistory {
  id: string;
  model_id: string;
  date: string;
  prompt_price_per_1m_usd: number;
  completion_price_per_1m_usd: number;
  created_at: string;
}

export interface CloudProvider {
  id: string;
  name: string;
  slug: string;
  api_base_url: string;
  created_at: string;
}
