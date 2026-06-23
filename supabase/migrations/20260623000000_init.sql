-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- 1. GPUs Table (Predefined popular GPUs for SEO and selections)
-- -------------------------------------------------------------
CREATE TABLE public.gpus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    vram_gb NUMERIC(6, 2) NOT NULL, -- e.g., 16.00 or 24.00
    memory_bandwidth_gb_s NUMERIC(8, 2) NOT NULL, -- e.g., 288.00 or 1008.00
    bus_width_bits INT NOT NULL, -- e.g., 128 or 384
    tdp_watts INT, -- Thermal Design Power
    manufacturer VARCHAR(100) NOT NULL, -- NVIDIA, AMD, Apple, Intel
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gpus_slug ON public.gpus(slug);
CREATE INDEX idx_gpus_vram ON public.gpus(vram_gb);

-- -------------------------------------------------------------
-- 2. Local Models Table (Catalog of local LLMs)
-- -------------------------------------------------------------
CREATE TABLE public.local_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    family VARCHAR(100) NOT NULL, -- e.g., Llama-3, Mistral, Qwen
    slug VARCHAR(255) NOT NULL UNIQUE,
    parameter_size_billion NUMERIC(6, 2) NOT NULL, -- e.g., 7.00, 70.00
    context_length INT NOT NULL DEFAULT 8192,
    huggingface_repo VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_local_models_slug ON public.local_models(slug);

-- -------------------------------------------------------------
-- 3. Model Quantizations Table (VRAM sizes at varying quant bits)
-- -------------------------------------------------------------
CREATE TABLE public.model_quantizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES public.local_models(id) ON DELETE CASCADE,
    quant_type VARCHAR(50) NOT NULL, -- e.g., Q4_K_M, Q8_0, FP16, AWQ
    bits_per_weight NUMERIC(4, 2) NOT NULL, -- e.g., 4.50, 8.00, 16.00
    file_size_gb NUMERIC(6, 2) NOT NULL, -- Raw quantized weights file size in GB
    recommended_vram_gb NUMERIC(6, 2) NOT NULL, -- File size + some default KV Cache overhead
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_model_id_quant ON public.model_quantizations(model_id, quant_type);

-- -------------------------------------------------------------
-- 4. Cloud Providers Table
-- -------------------------------------------------------------
CREATE TABLE public.cloud_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g., "OpenRouter", "Groq", "Together AI", "DeepInfra"
    slug VARCHAR(100) NOT NULL UNIQUE,
    api_base_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_providers_slug ON public.cloud_providers(slug);

-- -------------------------------------------------------------
-- 5. Cloud API Models Table (Real-time prices from OpenRouter Sync)
-- -------------------------------------------------------------
CREATE TABLE public.cloud_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES public.cloud_providers(id) ON DELETE CASCADE,
    openrouter_id VARCHAR(255) NOT NULL UNIQUE, -- e.g., "meta-llama/llama-3-70b-instruct"
    friendly_name VARCHAR(255) NOT NULL,
    prompt_price_per_1m_usd NUMERIC(10, 4) NOT NULL, -- e.g., 0.1500
    completion_price_per_1m_usd NUMERIC(10, 4) NOT NULL, -- e.g., 0.6000
    context_length INT NOT NULL DEFAULT 4096,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cloud_models_provider ON public.cloud_models(provider_id);
CREATE INDEX idx_cloud_models_active_price ON public.cloud_models(is_active, prompt_price_per_1m_usd);

-- -------------------------------------------------------------
-- 6. Programmatic SEO (pSEO) Pages Table
-- -------------------------------------------------------------
CREATE TABLE public.pseo_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    page_type VARCHAR(50) NOT NULL, -- e.g., "gpu_guide", "vram_guide", "model_guide"
    target_param_value VARCHAR(255) NOT NULL, -- e.g., "8gb-vram" or "rtx-4060-ti" or "llama-3-8b"
    meta_title VARCHAR(255) NOT NULL,
    meta_description TEXT NOT NULL,
    h1_title VARCHAR(255) NOT NULL,
    intro_content TEXT NOT NULL,
    structured_data_jsonB JSONB, -- Custom schema.org JSON-LD structured data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pseo_pages_slug ON public.pseo_pages(slug);
CREATE INDEX idx_pseo_pages_type ON public.pseo_pages(page_type);

-- -------------------------------------------------------------
-- Row Level Security (RLS) Configuration
-- (Since these are public read-only catalogs for our client)
-- -------------------------------------------------------------
ALTER TABLE public.gpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_quantizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pseo_pages ENABLE ROW LEVEL SECURITY;

-- Creating read policies for anonymous users
CREATE POLICY "Allow public read-only access on gpus" ON public.gpus FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access on local_models" ON public.local_models FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access on model_quantizations" ON public.model_quantizations FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access on cloud_providers" ON public.cloud_providers FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access on cloud_models" ON public.cloud_models FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access on pseo_pages" ON public.pseo_pages FOR SELECT USING (true);
