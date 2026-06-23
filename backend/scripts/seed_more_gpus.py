import os
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
    # NVIDIA RTX 4000 Series
    {"name": "NVIDIA RTX 4090", "vram_gb": 24.0, "memory_bandwidth_gb_s": 1008.0, "bus_width_bits": 384, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 4080 Super", "vram_gb": 16.0, "memory_bandwidth_gb_s": 736.0, "bus_width_bits": 256, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 4080", "vram_gb": 16.0, "memory_bandwidth_gb_s": 716.0, "bus_width_bits": 256, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 4070 Ti Super", "vram_gb": 16.0, "memory_bandwidth_gb_s": 672.0, "bus_width_bits": 256, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 4070 Ti", "vram_gb": 12.0, "memory_bandwidth_gb_s": 504.0, "bus_width_bits": 192, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 4070 Super", "vram_gb": 12.0, "memory_bandwidth_gb_s": 504.0, "bus_width_bits": 192, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 4070", "vram_gb": 12.0, "memory_bandwidth_gb_s": 504.0, "bus_width_bits": 192, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 4060 Ti (16GB)", "vram_gb": 16.0, "memory_bandwidth_gb_s": 288.0, "bus_width_bits": 128, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 4060 Ti (8GB)", "vram_gb": 8.0, "memory_bandwidth_gb_s": 288.0, "bus_width_bits": 128, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 4060", "vram_gb": 8.0, "memory_bandwidth_gb_s": 272.0, "bus_width_bits": 128, "manufacturer": "NVIDIA"},
    
    # NVIDIA RTX 3000 Series
    {"name": "NVIDIA RTX 3090 Ti", "vram_gb": 24.0, "memory_bandwidth_gb_s": 1008.0, "bus_width_bits": 384, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 3090", "vram_gb": 24.0, "memory_bandwidth_gb_s": 936.0, "bus_width_bits": 384, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 3080 Ti", "vram_gb": 12.0, "memory_bandwidth_gb_s": 912.0, "bus_width_bits": 384, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 3080 (12GB)", "vram_gb": 12.0, "memory_bandwidth_gb_s": 912.0, "bus_width_bits": 384, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 3080 (10GB)", "vram_gb": 10.0, "memory_bandwidth_gb_s": 760.0, "bus_width_bits": 320, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 3070 Ti", "vram_gb": 8.0, "memory_bandwidth_gb_s": 608.0, "bus_width_bits": 256, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 3070", "vram_gb": 8.0, "memory_bandwidth_gb_s": 448.0, "bus_width_bits": 256, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 3060 Ti", "vram_gb": 8.0, "memory_bandwidth_gb_s": 448.0, "bus_width_bits": 256, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 3060 (12GB)", "vram_gb": 12.0, "memory_bandwidth_gb_s": 360.0, "bus_width_bits": 192, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 3060 (8GB)", "vram_gb": 8.0, "memory_bandwidth_gb_s": 240.0, "bus_width_bits": 128, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 3050 (8GB)", "vram_gb": 8.0, "memory_bandwidth_gb_s": 224.0, "bus_width_bits": 128, "manufacturer": "NVIDIA"},

    # NVIDIA RTX 2000 & GTX 1600 Series
    {"name": "NVIDIA RTX 2080 Ti", "vram_gb": 11.0, "memory_bandwidth_gb_s": 616.0, "bus_width_bits": 352, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 2080 Super", "vram_gb": 8.0, "memory_bandwidth_gb_s": 496.0, "bus_width_bits": 256, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 2080", "vram_gb": 8.0, "memory_bandwidth_gb_s": 448.0, "bus_width_bits": 256, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 2070 Super", "vram_gb": 8.0, "memory_bandwidth_gb_s": 448.0, "bus_width_bits": 256, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 2070", "vram_gb": 8.0, "memory_bandwidth_gb_s": 448.0, "bus_width_bits": 256, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 2060 Super", "vram_gb": 8.0, "memory_bandwidth_gb_s": 448.0, "bus_width_bits": 256, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 2060 (12GB)", "vram_gb": 12.0, "memory_bandwidth_gb_s": 336.0, "bus_width_bits": 192, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 2060 (6GB)", "vram_gb": 6.0, "memory_bandwidth_gb_s": 336.0, "bus_width_bits": 192, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA GTX 1660 Ti", "vram_gb": 6.0, "memory_bandwidth_gb_s": 288.0, "bus_width_bits": 192, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA GTX 1660 Super", "vram_gb": 6.0, "memory_bandwidth_gb_s": 336.0, "bus_width_bits": 192, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA GTX 1660", "vram_gb": 6.0, "memory_bandwidth_gb_s": 192.0, "bus_width_bits": 192, "manufacturer": "NVIDIA"},

    # NVIDIA GTX 1000 Series
    {"name": "NVIDIA GTX 1080 Ti", "vram_gb": 11.0, "memory_bandwidth_gb_s": 484.0, "bus_width_bits": 352, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA GTX 1080", "vram_gb": 8.0, "memory_bandwidth_gb_s": 320.0, "bus_width_bits": 256, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA GTX 1070 Ti", "vram_gb": 8.0, "memory_bandwidth_gb_s": 256.0, "bus_width_bits": 256, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA GTX 1070", "vram_gb": 8.0, "memory_bandwidth_gb_s": 256.0, "bus_width_bits": 256, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA GTX 1060 (6GB)", "vram_gb": 6.0, "memory_bandwidth_gb_s": 192.0, "bus_width_bits": 192, "manufacturer": "NVIDIA"},
    
    # NVIDIA Data Center / Enterprise
    {"name": "NVIDIA H200 (141GB)", "vram_gb": 141.0, "memory_bandwidth_gb_s": 4800.0, "bus_width_bits": 5120, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA H100 (80GB)", "vram_gb": 80.0, "memory_bandwidth_gb_s": 3350.0, "bus_width_bits": 5120, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA A100 (80GB)", "vram_gb": 80.0, "memory_bandwidth_gb_s": 1935.0, "bus_width_bits": 5120, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA A100 (40GB)", "vram_gb": 40.0, "memory_bandwidth_gb_s": 1555.0, "bus_width_bits": 5120, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA V100 (32GB)", "vram_gb": 32.0, "memory_bandwidth_gb_s": 900.0, "bus_width_bits": 4096, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX 6000 Ada", "vram_gb": 48.0, "memory_bandwidth_gb_s": 960.0, "bus_width_bits": 384, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA RTX A6000", "vram_gb": 48.0, "memory_bandwidth_gb_s": 768.0, "bus_width_bits": 384, "manufacturer": "NVIDIA"},
    {"name": "NVIDIA L40S", "vram_gb": 48.0, "memory_bandwidth_gb_s": 864.0, "bus_width_bits": 384, "manufacturer": "NVIDIA"},

    # AMD Radeon RX 7000 Series
    {"name": "AMD Radeon RX 7900 XTX", "vram_gb": 24.0, "memory_bandwidth_gb_s": 960.0, "bus_width_bits": 384, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 7900 XT", "vram_gb": 20.0, "memory_bandwidth_gb_s": 800.0, "bus_width_bits": 320, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 7900 GRE", "vram_gb": 16.0, "memory_bandwidth_gb_s": 576.0, "bus_width_bits": 256, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 7800 XT", "vram_gb": 16.0, "memory_bandwidth_gb_s": 624.0, "bus_width_bits": 256, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 7700 XT", "vram_gb": 12.0, "memory_bandwidth_gb_s": 432.0, "bus_width_bits": 192, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 7600 XT", "vram_gb": 16.0, "memory_bandwidth_gb_s": 288.0, "bus_width_bits": 128, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 7600", "vram_gb": 8.0, "memory_bandwidth_gb_s": 288.0, "bus_width_bits": 128, "manufacturer": "AMD"},

    # AMD Radeon RX 6000 Series
    {"name": "AMD Radeon RX 6950 XT", "vram_gb": 16.0, "memory_bandwidth_gb_s": 576.0, "bus_width_bits": 256, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 6900 XT", "vram_gb": 16.0, "memory_bandwidth_gb_s": 512.0, "bus_width_bits": 256, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 6800 XT", "vram_gb": 16.0, "memory_bandwidth_gb_s": 512.0, "bus_width_bits": 256, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 6800", "vram_gb": 16.0, "memory_bandwidth_gb_s": 512.0, "bus_width_bits": 256, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 6750 XT", "vram_gb": 12.0, "memory_bandwidth_gb_s": 432.0, "bus_width_bits": 192, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 6700 XT", "vram_gb": 12.0, "memory_bandwidth_gb_s": 384.0, "bus_width_bits": 192, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 6650 XT", "vram_gb": 8.0, "memory_bandwidth_gb_s": 280.0, "bus_width_bits": 128, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 6600 XT", "vram_gb": 8.0, "memory_bandwidth_gb_s": 256.0, "bus_width_bits": 128, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 6600", "vram_gb": 8.0, "memory_bandwidth_gb_s": 224.0, "bus_width_bits": 128, "manufacturer": "AMD"},

    # AMD Radeon RX 5000 & Vega
    {"name": "AMD Radeon RX 5700 XT", "vram_gb": 8.0, "memory_bandwidth_gb_s": 448.0, "bus_width_bits": 256, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 5700", "vram_gb": 8.0, "memory_bandwidth_gb_s": 448.0, "bus_width_bits": 256, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 5600 XT", "vram_gb": 6.0, "memory_bandwidth_gb_s": 288.0, "bus_width_bits": 192, "manufacturer": "AMD"},
    {"name": "AMD Radeon VII", "vram_gb": 16.0, "memory_bandwidth_gb_s": 1024.0, "bus_width_bits": 4096, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX Vega 64", "vram_gb": 8.0, "memory_bandwidth_gb_s": 484.0, "bus_width_bits": 2048, "manufacturer": "AMD"},
    {"name": "AMD Radeon RX 580 (8GB)", "vram_gb": 8.0, "memory_bandwidth_gb_s": 256.0, "bus_width_bits": 256, "manufacturer": "AMD"},

    # AMD Data Center
    {"name": "AMD Instinct MI300X", "vram_gb": 192.0, "memory_bandwidth_gb_s": 5300.0, "bus_width_bits": 8192, "manufacturer": "AMD"},
    {"name": "AMD Instinct MI250X", "vram_gb": 128.0, "memory_bandwidth_gb_s": 3276.0, "bus_width_bits": 8192, "manufacturer": "AMD"},

    # Apple M1 Series
    {"name": "Apple M1 (16GB)", "vram_gb": 16.0, "memory_bandwidth_gb_s": 68.25, "bus_width_bits": 128, "manufacturer": "Apple"},
    {"name": "Apple M1 Pro (32GB)", "vram_gb": 32.0, "memory_bandwidth_gb_s": 200.0, "bus_width_bits": 256, "manufacturer": "Apple"},
    {"name": "Apple M1 Max (64GB)", "vram_gb": 64.0, "memory_bandwidth_gb_s": 400.0, "bus_width_bits": 512, "manufacturer": "Apple"},
    {"name": "Apple M1 Ultra (128GB)", "vram_gb": 128.0, "memory_bandwidth_gb_s": 800.0, "bus_width_bits": 1024, "manufacturer": "Apple"},

    # Apple M2 Series
    {"name": "Apple M2 (24GB)", "vram_gb": 24.0, "memory_bandwidth_gb_s": 100.0, "bus_width_bits": 128, "manufacturer": "Apple"},
    {"name": "Apple M2 Pro (32GB)", "vram_gb": 32.0, "memory_bandwidth_gb_s": 200.0, "bus_width_bits": 256, "manufacturer": "Apple"},
    {"name": "Apple M2 Max (96GB)", "vram_gb": 96.0, "memory_bandwidth_gb_s": 400.0, "bus_width_bits": 512, "manufacturer": "Apple"},
    {"name": "Apple M2 Ultra (192GB)", "vram_gb": 192.0, "memory_bandwidth_gb_s": 800.0, "bus_width_bits": 1024, "manufacturer": "Apple"},

    # Apple M3 Series
    {"name": "Apple M3 (24GB)", "vram_gb": 24.0, "memory_bandwidth_gb_s": 100.0, "bus_width_bits": 128, "manufacturer": "Apple"},
    {"name": "Apple M3 Pro (36GB)", "vram_gb": 36.0, "memory_bandwidth_gb_s": 150.0, "bus_width_bits": 192, "manufacturer": "Apple"},
    {"name": "Apple M3 Max (128GB)", "vram_gb": 128.0, "memory_bandwidth_gb_s": 400.0, "bus_width_bits": 512, "manufacturer": "Apple"}
]

def seed():
    print(f"Seeding {len(gpus)} GPUs into the database...")
    
    # Optional: If you want to clear old entries to avoid name constraint errors:
    try:
        supabase.table("gpus").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    except Exception as e:
        pass
        
    for gpu in gpus:
        # Create a slug automatically
        gpu["slug"] = gpu["name"].lower().replace(" ", "-").replace("(", "").replace(")", "")
        supabase.table("gpus").upsert(gpu, on_conflict="slug").execute()
    print("Complete! 🚀")

if __name__ == "__main__":
    seed()
