import json
import httpx
import re
from app.core.config import settings

def call_openrouter_for_gpu_specs(gpu_name: str) -> dict:
    if settings.GROQ_API_KEY:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        model_name = "llama3-8b-8192"
    else:
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        model_name = "meta-llama/llama-3-8b-instruct"
    
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
        "model": model_name,
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
            
            # Try to extract just the JSON object if there's surrounding text
            match = re.search(r'\{[\s\S]*\}', content)
            if match:
                content = match.group(0)
                
            return json.loads(content)
    except Exception as e:
        print(f"LLM API error: {e}")
        
        # Smart fallback: Try to extract VRAM from the name (e.g. "RTX 4050 6GB")
        vram = 16.0 # Default if we can't find anything
        match = re.search(r'(\d+)GB', gpu_name, re.IGNORECASE)
        if match:
            vram = float(match.group(1))
            
        return {
            "vram_gb": vram,
            "memory_bandwidth_gb_s": 500.0,
            "bus_width_bits": 256,
            "manufacturer": "Unknown"
        }
