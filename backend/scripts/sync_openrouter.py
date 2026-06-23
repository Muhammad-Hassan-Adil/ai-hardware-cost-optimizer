import sys
import os
import httpx
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import get_supabase_client

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/models"

def fetch_openrouter_models():
    print(f"[{datetime.now()}] Fetching models from OpenRouter...")
    headers = {}
    if settings.OPENROUTER_API_KEY:
        headers["Authorization"] = f"Bearer {settings.OPENROUTER_API_KEY}"
    
    with httpx.Client() as client:
        response = client.get(OPENROUTER_API_URL, headers=headers)
        response.raise_for_status()
        return response.json().get("data", [])

def sync_models():

    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    from supabase import create_client
    db = create_client(url, key)

    provider_slug = "openrouter"
    provider_name = "OpenRouter"

    prov_res = db.table("cloud_providers").select("*").eq("slug", provider_slug).execute()
    
    if not prov_res.data:
        print(f"[{datetime.now()}] Creating '{provider_name}' provider in database.")
        prov_insert = db.table("cloud_providers").insert({
            "name": provider_name,
            "slug": provider_slug,
            "api_base_url": "https://openrouter.ai/api/v1"
        }).execute()
        provider_id = prov_insert.data[0]["id"]
    else:
        provider_id = prov_res.data[0]["id"]

    models_data = fetch_openrouter_models()
    print(f"[{datetime.now()}] Retrieved {len(models_data)} models from OpenRouter. Syncing to Supabase...")

    existing_db_models = db.table("cloud_models").select("openrouter_id").eq("provider_id", provider_id).execute()
    existing_ids = {m["openrouter_id"] for m in existing_db_models.data}
    
    active_incoming_ids = set()

    for m in models_data:
        openrouter_id = m.get("id")
        friendly_name = m.get("name", openrouter_id)
        context_length = m.get("context_length", 4096)
        
        pricing = m.get("pricing", {})


        raw_prompt = float(pricing.get("prompt", 0) or 0)
        raw_completion = float(pricing.get("completion", 0) or 0)
        
        raw_prompt = max(0.0, raw_prompt)
        raw_completion = max(0.0, raw_completion)

        prompt_price = raw_prompt * 1_000_000
        completion_price = raw_completion * 1_000_000

        prompt_price = min(prompt_price, 999999.0)
        completion_price = min(completion_price, 999999.0)

        active_incoming_ids.add(openrouter_id)

        model_record = {
            "provider_id": provider_id,
            "openrouter_id": openrouter_id,
            "friendly_name": friendly_name,
            "prompt_price_per_1m_usd": round(prompt_price, 4),
            "completion_price_per_1m_usd": round(completion_price, 4),
            "context_length": context_length,
            "is_active": True,
            "last_synced_at": datetime.now().isoformat()
        }

        if openrouter_id in existing_ids:
            db.table("cloud_models").update(model_record).eq("openrouter_id", openrouter_id).execute()
        else:
            db.table("cloud_models").insert(model_record).execute()

    inactive_ids = existing_ids - active_incoming_ids
    if inactive_ids:
        print(f"[{datetime.now()}] Deactivating {len(inactive_ids)} old models.")
        for chunk in [list(inactive_ids)[i:i+100] for i in range(0, len(inactive_ids), 100)]:
            db.table("cloud_models").update({"is_active": False}).in_("openrouter_id", chunk).execute()

    print(f"[{datetime.now()}] Sync complete.")

if __name__ == "__main__":
    try:
        sync_models()
    except Exception as e:
        print(f"[{datetime.now()}] Error during sync: {e}")
        sys.exit(1)
