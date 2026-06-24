import re
from typing import Dict, Any

def fetch_gpu_specs(name: str) -> Dict[str, Any]:
    """
    Phase 1: Mock fetcher for GPU specs.
    In Phase 2, this will be replaced with a real LLM call via OpenRouter.
    """
    name_lower = name.lower()
    
    # Mock Dictionary
    mock_db = {
        "w7900": {"vram_gb": 48.0, "memory_bandwidth_gb_s": 864.0, "bus_width_bits": 384, "manufacturer": "AMD"},
        "rtx 5090": {"vram_gb": 32.0, "memory_bandwidth_gb_s": 1536.0, "bus_width_bits": 512, "manufacturer": "NVIDIA"},
        "a100": {"vram_gb": 80.0, "memory_bandwidth_gb_s": 1935.0, "bus_width_bits": 5120, "manufacturer": "NVIDIA"},
        "rtx 4090": {"vram_gb": 24.0, "memory_bandwidth_gb_s": 1008.0, "bus_width_bits": 384, "manufacturer": "NVIDIA"},
        "m3 max": {"vram_gb": 128.0, "memory_bandwidth_gb_s": 400.0, "bus_width_bits": 512, "manufacturer": "Apple"},
    }
    
    for key, specs in mock_db.items():
        if key in name_lower:
            return {
                "name": name,
                "slug": re.sub(r'[^a-z0-9]+', '-', name_lower).strip('-'),
                **specs
            }
            
    # Fallback
    return {
        "name": name,
        "slug": re.sub(r'[^a-z0-9]+', '-', name_lower).strip('-'),
        "vram_gb": 16.0,
        "memory_bandwidth_gb_s": 500.0,
        "bus_width_bits": 256,
        "manufacturer": "Unknown"
    }
