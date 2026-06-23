### Overview

The **AI Hardware & Cost Optimizer Hub** is designed as a modern, decoupled, and entirely serverless web application. 
- **The Frontend** is a Single Page Application (SPA) built with React, TypeScript, and Tailwind CSS. It is deployed on Cloudflare Pages to leverage global edge-caching and exceptional static asset performance.
- **The Backend API** is constructed in Python using FastAPI, wrapped with Mangum, and deployed to AWS Lambda through Amazon API Gateway. This yields a zero-idle-cost backend capable of scaling horizontally and seamlessly.
- **The Database Layer** is hosted on Supabase (PostgreSQL), utilizing its high-performance RESTful API and connection pooling for rapid edge reads.
- **The Automation Layer** is an independent Python script running on AWS Lambda, scheduled via Amazon EventBridge, which periodically synchronizes cloud models and real-time pricing from OpenRouter into Supabase.

To support organic search and monetization (Google AdSense), the system implements a Programmatic SEO framework. Instead of a standard database-hidden SPA, the system dynamically parses the path (e.g., `/hardware/rtx-4060-ti` or `/vram/8gb-vram`) to pre-generate or hydrate contextual layouts with bespoke `schema.org` JSON-LD metadata injected into the document head.

---

### Supabase DDL SQL Schema

This schema includes tables for hardware, models, API pricing, and Programmatic SEO pages. It includes RLS (Row Level Security) and indexes for fast slug lookups.

```sql
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
```

---

### Directory File Tree Structure

Highly decoupled directory structures adhering to the **Separation of Concerns** constraint.

```text
ai-hardware-cost-optimizer/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI entrypoint & Mangum adapter
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py           # Registers local hardware, cloud pricing, & SEO routes
│   │   │   │   └── endpoints/
│   │   │   │       ├── hardware.py     # Endpoints for GPUs, models, quantizations
│   │   │   │       ├── costs.py        # Endpoints for cloud models & dynamic cost calculation
│   │   │   │       └── seo.py          # Endpoints for resolving pSEO slugs & schemas
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py               # Settings (Pydantic BaseSettings)
│   │   │   └── database.py             # Supabase clients & connection init
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── gpu.py                  # Pydantic schemas for input/output validation
│   │   │   ├── local_model.py
│   │   │   ├── cloud_model.py
│   │   │   └── seo.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── hardware_math.py        # Hardware fitting and offload speed calculations
│   │   │   ├── supabase_service.py     # Abstraction for Supabase CRUD
│   │   │   └── openrouter_service.py   # Client interaction with OpenRouter
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── formatters.py           # Global logging or formatters
│   ├── scripts/
│   │   └── sync_openrouter.py          # Cron/Lambda execution script (EventBridge trigger)
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_hardware_math.py       # Decoupled logic testing
│   │   └── test_api.py
│   ├── Dockerfile                      # Optional: Lambda-compatible base image
│   ├── requirements.txt
│   ├── sam-template.yaml               # AWS SAM template (or serverless.yml / CDK)
│   └── README.md
│
└── frontend/
    ├── public/
    │   ├── _headers                    # Cloudflare Pages custom routing & security headers
    │   └── robots.txt
    ├── src/
    │   ├── main.tsx
    │   ├── index.css
    │   ├── App.tsx                     # Primary layout routing/tab coordination
    │   ├── assets/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Card.tsx
    │   │   │   ├── Dropdown.tsx
    │   │   │   ├── Slider.tsx
    │   │   │   ├── Tabs.tsx
    │   │   │   └── Tooltip.tsx
    │   │   └── seo/
    │   │       ├── JSONLDMetadata.tsx  # Injects structured JSON-LD scripts dynamically
    │   │       └── SEOWrapper.tsx      # Preloads SEO-specific components for pSEO
    │   ├── features/
    │   │   ├── hardware-matcher/
    │   │   │   ├── components/
    │   │   │   │   ├── GPUSelector.tsx
    │   │   │   │   ├── ModelSelector.tsx
    │   │   │   │   ├── VRAMBarGraph.tsx
    │   │   │   │   └── PerformanceEstimator.tsx
    │   │   │   ├── hooks/
    │   │   │   │   └── useHardwareMatcher.ts # Orchestrates local VRAM calculation state
    │   │   │   └── utils/
    │   │   │       └── memoryMath.ts   # Client-side mirror of memory bandwidth computations
    │   │   └── cost-calculator/
    │   │       ├── components/
    │   │       │   ├── PricingTable.tsx
    │   │       │   ├── InteractiveTextSlider.tsx
    │   │       │   └── ProviderFilter.tsx
    │   │       ├── hooks/
    │   │       │   └── useCostCalculator.ts # Manages dynamic prompt token estimation state
    │   │       └── utils/
    │   │           └── tokenEstimator.ts # Estimates standard words-to-tokens mappings
    │   ├── services/
    │   │   ├── api.ts                  # Fetch requests to AWS Lambda backend
    │   │   └── supabaseClient.ts       # Direct Edge/REST fetch client for Supabase
    │   ├── types/
    │   │   └── database.types.ts       # Types generated or written matching PostgreSQL
    │   └── utils/
    │       └── formatters.ts
    ├── index.html
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── vite.config.ts
    ├── package.json
    └── README.md
```

---

### Step-by-Step Roadmap

Here is a highly sequential, incremental roadmap broken into logical development phases.

#### Phase 1: Database & Backend Architecture
1. **Supabase DDL Execution**: Run SQL scripts in the Supabase console. Enable Row Level Security (RLS) policies allowing public read-only access to all key tables. Populate `gpus` with standard hardware catalog data (e.g., RTX 4090, RTX 4060 Ti, Mac Studio M2 Ultra, AMD RX 7900 XTX) and `local_models` with a set of default targets (Llama-3, Qwen-2.5, Phi-3).
2. **Backend API Initialization**: Create FastAPI project structure. Implement `core/config.py` using Pydantic Settings, integrating Supabase keys and OpenRouter API secrets. Implement `core/database.py` initializing the asynchronous Client.
3. **Decoupled Math Service (`services/hardware_math.py`)**: Code the local LLM mathematical models for weight footprints and decoding bandwidth limits (details in Technical Considerations).
4. **Backend API Endpoints**:
   - `GET /api/v1/gpus`: List predefined GPUs.
   - `GET /api/v1/models/local`: List models with quantizations.
   - `POST /api/v1/hardware/match`: Calculate fitting results (JSON output with status: VRAM_FIT, SYSTEM_OFFLOAD, OUT_OF_MEMORY, speeds).
   - `GET /api/v1/seo/resolve/{slug}`: Resolve a programmatic SEO page, matching metadata and structured JSON-LD templates.
5. **FastAPI mangum Integration**: Wire FastAPI with `Mangum` in `main.py` to allow Lambda execution. Setup `requirements.txt` and prepare the AWS deployment structure (SAM template or Docker configuration).

#### Phase 2: Python Synchronization Engine
6. **OpenRouter Sync Cron Task (`scripts/sync_openrouter.py`)**:
   - Write a standalone script that queries the OpenRouter `/api/v1/models` endpoint.
   - Parse and filter key elements (ID, display name, prompt price, completion price, context length).
   - Map prices dynamically, upsert values to Supabase `cloud_models`, and label inactive models appropriately (`is_active = FALSE`).
7. **AWS Lambda + EventBridge Deployment**: Wrap the sync script as a lambda and configure a cron scheduler executing every 24/48 hours, injecting credentials via secure Lambda environment variables.

#### Phase 3: Frontend Setup & Shared Components
8. **Vite Project & Core Configs**: Set up React TypeScript project with Vite, install Tailwind CSS, create layout, and establish direct connection client in `services/supabaseClient.ts`.
9. **Global Navigation & Tab Layout**: Create the overall Tab controller in `App.tsx` matching the user requirement (Tab 1: Local Matcher, Tab 2: Cloud Cost Calculator).
10. **JSON-LD Schema Dynamic Hydrator**: Write `JSONLDMetadata.tsx` component which manipulates `<head>` elements dynamically, injecting schema markups to satisfy Programmatic SEO requirements.

#### Phase 4: Local LLM Hardware Matcher (Tab 1)
11. **Client-side Math Model (`features/hardware-matcher/utils/memoryMath.ts`)**: Implement identical, lightweight memory calculations so calculations update instantaneously as sliders or inputs are modified.
12. **Interactive Selection Controls**: Implement `<GPUSelector />` with presets and custom user overrides (VRAM, Bus Width, Bandwidth) alongside `<ModelSelector />` for choosing parameters and target quantizations (e.g. FP16, Q8_0, Q4_K_M).
13. **Dynamic Performance Visualizers**: Create progress/bar charts rendering GPU VRAM usage vs System RAM usage, accompanied by specific decoding speed indicators (Tokens/second) and descriptive state warnings (e.g., "Full speed on VRAM", "Partial offloading to system DDR", "OOM - Model size exceeds hardware limits").

#### Phase 5: Cloud API Cost Calculator (Tab 2)
14. **Dynamic Price Directory**: Build `<PricingTable />` fetching prices directly from Supabase REST endpoint (`cloud_models` and `cloud_providers`). Implement search/filter logic enabling easy filtering by provider or context window.
15. **Interactive Text Token Slider**: 
    - Create a text-pasting text area.
    - Build client-side helper (`utils/tokenEstimator.ts`) that maps typed/pasted length to tokens (standard factor: ~0.75 words per token or direct character formulas).
    - Provide a custom range/slider modifying input/output tokens (e.g., 0 to 1M tokens) that updates pricing calculations across all active models simultaneously in a list.

#### Phase 6: Programmatic SEO Implementation & Production Polish
16. **Dynamic Routing / Hydration Handler**: Set up React Routing. If a URL slug is matched (e.g. `/hardware/rtx-3060-12gb`), call `GET /api/v1/seo/resolve/{slug}`, hydrate custom title, intro text, and run the memory math utilizing the parsed slug context (preloading RTX 3060 specifications).
17. **Cloudflare Pages Routing**: Write public configuration files (`_headers`, `_redirects` for SPAs) resolving all subpaths back to `index.html` to support standard dynamic browser paths without routing errors on refresh.

---

### Technical Considerations

#### Local Hardware Memory & Bandwidth Math Formulas

To deliver professional-grade, physically accurate estimations in Tab 1, we implement the following model:

1. **Total Weight Footprint ($M_{weights}$)**:
   $$M_{weights} = \text{Parameters (Billion)} \times \frac{\text{Bits-per-weight}}{8} \times 1.15 \text{ (System Overhead Allowance)}$$
2. **Context Memory KV-Cache ($M_{cache}$)**:
   For Llama-like architectures, key-value caches scale with sequence length, batch size, active layers, and key-value heads:
   $$M_{cache} = 2 \times \text{layers} \times \text{heads} \times \text{head\_dim} \times \text{sequence\_length} \times 2 \text{ (bytes per FP16 element)}$$
   *Simplification client-side:* $M_{cache} \approx \text{Parameters} \times 0.1 \times \left(\frac{\text{target sequence length}}{2048}\right)$ (or customized dynamically if detailed specifications are available).
3. **Allocation Analysis**:
   - Let $V_{total}$ be User VRAM, and $V_{avail} = V_{total} - 1.5\text{ GB (OS and UI allocation overhead)}$.
   - If $M_{weights} + M_{cache} \le V_{avail}$: **Full VRAM Fit**. Speed is GPU Bandwidth bottlenecked.
   - If $M_{weights} + M_{cache} > V_{avail} + \text{System RAM}$: **Out of Memory (OOM)**.
   - Otherwise: **Hybrid Offload**. 
     $$\text{GPU Weight Fraction } (f_{gpu}) = \frac{V_{avail}}{M_{weights} + M_{cache}}$$
4. **Estimated Token Speed Calculation (Autoregressive phase)**:
   Memory transfer limits the speed of single-user autoregressive decoding. 
   $$\text{Processing Time per token } (T) = \frac{\text{Weights allocated to GPU}}{\text{GPU Memory Bandwidth}} + \frac{\text{Weights allocated to System RAM}}{\text{System RAM Memory Bandwidth}}$$
   $$\text{Tokens per second} = \frac{1}{T}$$
   *Example*: Offloading 50% of weights to DDR5 system RAM (60 GB/s) and 50% to VRAM (300 GB/s) yields a significantly reduced speed compared to 100% VRAM execution. This demonstrates the exact physical performance cost of offloading.

#### Programmatic SEO Strategy

For popular setups (e.g., "Best LLMs for 12GB VRAM" or "Can RTX 4070 Run Llama 3 70B"):
1. The backend server returns tailored metadata alongside `JSON-LD` schemas for a `TechArticle` or `FAQPage`.
2. The `<JSONLDMetadata />` component inside the React frontend mounts this structure dynamically:
   ```html
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "FAQPage",
     "mainEntity": [{
       "@type": "Question",
       "name": "Can NVIDIA RTX 4070 Run Llama 3 70B?",
       "acceptedAnswer": {
         "@type": "Answer",
         "text": "Llama 3 70B at Q4 quantization requires approx 40GB of VRAM. An RTX 4070 has 12GB. It will require heavy offloading to System RAM, reducing speeds to around 1-3 tokens per second."
       }
     }]
   }
   </script>
   ```

---

### Success Criteria

- **Serverless API Functionality**: Backend API responds with latency under 200ms for warm starts, handling calculation logic and Supabase edge lookups smoothly.
- **Accurate Local Matcher Math**: Calculating quantization weight constraints matches physical realities (e.g., Llama-3-8B Q4 fits inside 8GB VRAM with ~2B cache overhead, while FP16 fails).
- **Synchronous OpenRouter Execution**: Sync cron successfully updates database API values with zero duplicates, handling missing or modified model definitions gracefully.
- **Client Performance**: The cost slider updates price estimations across 30+ model combinations in real time (<16ms frame time) as the slider moves.
- **SEO Schema Verification**: Google Rich Results Test successfully validates the dynamically mounted `schema.org` JSON-LD structure on programmatic paths.

---
