from fastapi import APIRouter, HTTPException, Depends
from typing import List
from pydantic import BaseModel
import re
from app.core.database import get_supabase_client
from supabase import Client
from app.models.gpu import GPU
from app.models.local_model import LocalModel
from app.services.hardware_math import HardwareMatchRequest, HardwareMatchResponse, calculate_hardware_match
from app.services.fetcher import fetch_gpu_specs

class FetchGPURequest(BaseModel):
    name: str

router = APIRouter()

def get_db():
    return get_supabase_client()

@router.get("/gpus", response_model=List[GPU])
def get_gpus(db: Client = Depends(get_db)):
    try:
        response = db.table("gpus").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models/local", response_model=List[LocalModel])
def get_local_models(db: Client = Depends(get_db)):
    try:
        response = db.table("local_models").select("*, quantizations:model_quantizations(*)").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match", response_model=HardwareMatchResponse)
def match_hardware(request: HardwareMatchRequest):
    return calculate_hardware_match(request)

@router.post("/fetch", response_model=GPU)
def fetch_gpu(request: FetchGPURequest, db: Client = Depends(get_db)):
    name_lower = request.name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', name_lower).strip('-')
    
    # Check if exists
    try:
        existing = db.table("gpus").select("*").eq("slug", slug).execute()
        if existing.data and len(existing.data) > 0:
            return existing.data[0]
    except Exception as e:
        print(f"Error checking existing GPU: {e}")
        
    # Fetch from external source (mock or LLM)
    specs = fetch_gpu_specs(request.name)
    
    # Insert self-healing DB record
    try:
        inserted = db.table("gpus").insert(specs).execute()
        if inserted.data and len(inserted.data) > 0:
            return inserted.data[0]
    except Exception as e:
        print(f"Error inserting GPU: {e}")
        # Return the generated specs anyway, but with a temporary ID
        return { "id": "00000000-0000-0000-0000-000000000000", **specs }

    return { "id": "00000000-0000-0000-0000-000000000000", **specs }
