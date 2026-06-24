import json
import httpx
from app.core.config import settings

def call_openrouter_for_gpu_specs(gpu_name: str) -> dict:
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    You are a technical AI hardware expert. The user wants specifications for the following GPU: "{gpu_name}".
    Return ONLY a valid JSON object matching this exact schema, with no markdown formatting, no explanation, and no backticks:
    {{
        "vram_gb": <float, e.g. 24.0>,
        "memory_bandwidth_gb_s": <float, e.g. 1008.0>,
        "bus_width_bits": <int, e.g. 384>,
        "manufacturer": <string, e.g. "NVIDIA", "AMD", "Intel", "Apple", or "Unknown">
    }}
    If the exact specs are unknown or unreleased, provide your best educated estimate based on leaks or the tier of the card.
    """
    
    payload = {
        "model": "meta-llama/llama-3-8b-instruct",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0,
    }
    
    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            # Clean up the response if the LLM still returns markdown blocks
            content = content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
    except Exception as e:
        print(f"OpenRouter API error: {e}")
        # Return fallback on error
        return {
            "vram_gb": 16.0,
            "memory_bandwidth_gb_s": 500.0,
            "bus_width_bits": 256,
            "manufacturer": "Unknown"
        }
