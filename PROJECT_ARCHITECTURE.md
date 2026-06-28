# AI Hardware & Cost Optimizer Hub - Architecture & Features

This document serves as a comprehensive guide for AI assistants and developers to understand the current state, architecture, and feature set of the "AI Hardware & Cost Optimizer Hub" project.

## 1. Tech Stack Overview
* **Frontend Framework:** React 18 (Bootstrapped with Vite)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (with Dark Mode support)
* **Routing:** React Router (`useSearchParams` is used to manage top-level tabs via `?tab=...` to ensure SPA-like instant navigation without hard reloads).
* **Animations:** Framer Motion
* **Icons:** Lucide React
* **Backend / Database:** Supabase (PostgreSQL)
* **Hosting / Deployment:** Vercel (Using `vercel.json` rewrites for SPA routing)

## 2. Project Structure
```text
frontend/
├── src/
│   ├── components/       # Reusable UI components (Cards, Buttons, Layout wrappers)
│   ├── features/         # Domain-specific feature modules
│   │   ├── cost-calculator/    # Cloud Cost Calculator tab logic & components
│   │   ├── hardware-matcher/   # Local Hardware Matcher & Builder logic
│   ├── pages/            # Top-level standalone pages (About, Privacy, Terms)
│   ├── services/         # API clients (Supabase client, OpenRouter integration)
│   ├── types/            # Global TypeScript definitions (Database schemas, models)
│   ├── utils/            # Helper functions (e.g., memoryMath.ts for VRAM calculations)
│   ├── App.tsx           # Main layout, routing state manager, header/footer
│   └── main.tsx          # React DOM entry point
├── vercel.json           # Vercel configuration for SPA routing rewrites
├── tailwind.config.js    # Tailwind configuration
└── package.json
```

## 3. Core Features

### A. The Global Layout (`App.tsx`)
* **Header:** Features the site title on the left, and three primary navigation tabs on the right alongside a Dark/Light mode toggle.
* **Footer:** Contains links to standalone legal pages (About, Privacy Policy, Terms of Service).
* **Routing:** The main view is dictated by the `?tab=` URL parameter (values: `matcher`, `builder`, `cloud`). Legal pages use standard path routing (e.g., `/about`) and explicitly navigate back to the home page (`navigate('/')`) rather than relying on browser history.

### B. Local Hardware Matcher (`?tab=matcher`)
* **Purpose:** Allows a user to input their current hardware, budget, and intended usage (e.g., "Heavy Fine-tuning", "Light Inference") to find the best hardware upgrade path.
* **Logic:** Computes hardware bottlenecks and recommends specific GPU upgrades that fit the budget.

### C. Hardware Builder (`?tab=builder`)
* **Purpose:** An interactive "PC Builder" interface where users can stack multiple GPUs and System RAM configurations.
* **Features:**
  * **Dynamic VRAM Calculation:** Calculates total VRAM and System RAM.
  * **Live Hardware Fetching:** Users can select "Other (Fetch Live)" to dynamically pull in new hardware data.
  * **Context-Aware Auto-Recommender (`AutoRecommender.tsx`):** Based on the selected hardware limits, this engine evaluates quantization levels, context lengths, and parameter sizes to recommend three distinct AI models that can run locally:
    1. **Max Capability:** The largest parameter model that fits into the available VRAM.
    2. **Balanced:** A medium-sized model running at high precision (e.g., 8-bit).
    3. **Max Speed:** A smaller, highly-quantized model sorted for maximum tokens-per-second throughput.

### D. Cloud Cost Calculator (`?tab=cloud`)
* **Purpose:** Calculates the exact API cost for running specific models on cloud providers (e.g., OpenAI, Anthropic, OpenRouter).
* **Features:**
  * **Supabase Integration:** Fetches live pricing models from a `cloud_models` and `cloud_providers` Supabase database.
  * **Token Math:** Users can paste a prompt to dynamically estimate token counts locally (`tokenEstimator.ts`), or manually adjust input/output token sliders. The app instantly updates the cost breakdowns.
  * **Pricing Table (`PricingTable.tsx`):** A responsive data table displaying the model name, provider, context window, and dynamic cost. It features real-time search filtering (by model name or ID) and built-in pagination restricted to exactly 15 rows per page.

## 4. Key Utilities & Logic
* **`memoryMath.ts` (Core Engine):** This utility file is critical. It contains the complex logic for evaluating if an LLM can run on a user's hardware. It calculates VRAM requirements based on:
  * Parameter Count (e.g., 8B, 70B)
  * Quantization (e.g., 4-bit, 8-bit, 16-bit)
  * KV Cache requirements based on context window.
  * Determines "Tier 1" (Full VRAM fit - fast) vs "Tier 2" (System RAM offload - slower).

## 5. Upcoming / Partially Implemented Features
* **Database Integration:** The system has a mock fetcher to ingest dynamic GPU data from a backend, which automatically inserts into the Supabase `gpus` table and updates the React state.
* **External LLM APIs:** Future integrations plan to query models like Anthropic Haiku or Llama 3 via `openrouter_service.ts` to fetch missing hardware specs and validate them using JSON-schema structured outputs.
