import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

gpus = [
    {"name": "NVIDIA RTX 4090", "slug": "rtx-4090", "vram_gb": 24.0, "memory_bandwidth_gb_s": 1008.0, "bus_width_bits": 384, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 3090", "slug": "rtx-3090", "vram_gb": 24.0, "memory_bandwidth_gb_s": 936.0, "bus_width_bits": 384, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 4080", "slug": "rtx-4080", "vram_gb": 16.0, "memory_bandwidth_gb_s": 716.0, "bus_width_bits": 256, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 4070 Ti", "slug": "rtx-4070-ti", "vram_gb": 12.0, "memory_bandwidth_gb_s": 504.0, "bus_width_bits": 192, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 3060", "slug": "rtx-3060", "vram_gb": 12.0, "memory_bandwidth_gb_s": 360.0, "bus_width_bits": 192, "manufacturer": "NVIDIA"},
    {"name": "AMD Radeon RX 7900 XTX", "slug": "rx-7900-xtx", "vram_gb": 24.0, "memory_bandwidth_gb_s": 960.0, "bus_width_bits": 384, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 7800 XT", "slug": "rx-7800-xt", "vram_gb": 16.0, "memory_bandwidth_gb_s": 624.0, "bus_width_bits": 256, "manufacturer": "AMD"},
    {"name": "Apple M2 Ultra (192GB)", "slug": "m2-ultra-192", "vram_gb": 192.0, "memory_bandwidth_gb_s": 800.0, "bus_width_bits": 0, "manufacturer": "Apple"},
    {"name": "NVIDIA A100 (80GB)", "slug": "a100-80", "vram_gb": 80.0, "memory_bandwidth_gb_s": 1935.0, "bus_width_bits": 5120, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA H100 (80GB)", "slug": "h100-80", "vram_gb": 80.0, "memory_bandwidth_gb_s": 3350.0, "bus_width_bits": 5120, "manufacturer": "NVIDIA"}
]

models = [
    {"name": "Llama 3 (8B)", "family": "LLaMA", "slug": "llama-3-8b", "parameter_size_billion": 8.0, "context_length": 8192, "huggingface_repo": "meta-llama/Meta-Llama-3-8B"},
    {"name": "Llama 3 (70B)", "family": "LLaMA", "slug": "llama-3-70b", "parameter_size_billion": 70.0, "context_length": 8192, "huggingface_repo": "meta-llama/Meta-Llama-3-70B"},
    {"name": "Mixtral 8x7B", "family": "Mistral", "slug": "mixtral-8x7b", "parameter_size_billion": 46.7, "context_length": 32768, "huggingface_repo": "mistralai/Mixtral-8x7B-v0.1"},
    {"name": "Mistral (7B)", "family": "Mistral", "slug": "mistral-7b", "parameter_size_billion": 7.3, "context_length": 32768, "huggingface_repo": "mistralai/Mistral-7B-v0.1"},
    {"name": "Qwen 1.5 (110B)", "family": "Qwen", "slug": "qwen-1.5-110b", "parameter_size_billion": 110.0, "context_length": 32768, "huggingface_repo": "Qwen/Qwen1.5-110B"}
]

def seed():
    print("Seeding GPUs...")
    for gpu in gpus:
        supabase.table("gpus").upsert(gpu, on_conflict="slug").execute()
    
    print("Seeding Models...")
    model_ids = {}
    for model in models:
        res = supabase.table("local_models").upsert(model, on_conflict="slug").execute()
        model_ids[model["slug"]] = res.data[0]["id"]
    
    print("Seeding Quantizations...")
    # Add quantizations for Llama 3 8B
    l8b_id = model_ids["llama-3-8b"]
    quants = [
        {"model_id": l8b_id, "quant_type": "FP16", "bits_per_weight": 16.0, "file_size_gb": 16.0, "recommended_vram_gb": 20.0},
        {"model_id": l8b_id, "quant_type": "Q8_0", "bits_per_weight": 8.0, "file_size_gb": 8.5, "recommended_vram_gb": 12.0},
        {"model_id": l8b_id, "quant_type": "Q4_K_M", "bits_per_weight": 4.5, "file_size_gb": 4.9, "recommended_vram_gb": 8.0},
    ]
    
    l70b_id = model_ids["llama-3-70b"]
    quants += [
        {"model_id": l70b_id, "quant_type": "FP16", "bits_per_weight": 16.0, "file_size_gb": 140.0, "recommended_vram_gb": 160.0},
        {"model_id": l70b_id, "quant_type": "Q4_K_M", "bits_per_weight": 4.5, "file_size_gb": 42.5, "recommended_vram_gb": 48.0},
    ]
    
    for q in quants:
        # Check if exists to avoid duplicates
        supabase.table("model_quantizations").insert(q).execute()
        
    print("Database seeding complete!")

if __name__ == "__main__":
    seed()
