import re
from typing import Dict, Any
from app.services.openrouter_service import call_openrouter_for_gpu_specs

def fetch_gpu_specs(name: str) -> Dict[str, Any]:
    """
    Phase 2: Real LLM fetcher for GPU specs via OpenRouter.
    """
    name_lower = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', name_lower).strip('-')
    
    # Call OpenRouter LLM to parse specifications
    specs = call_openrouter_for_gpu_specs(name)
    
    return {
        "name": name,
        "slug": slug,
        **specs
    }
