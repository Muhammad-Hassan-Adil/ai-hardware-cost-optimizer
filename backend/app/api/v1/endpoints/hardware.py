from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.core.database import get_supabase_client
from supabase import Client
from app.models.gpu import GPU
from app.models.local_model import LocalModel
from app.services.hardware_math import HardwareMatchRequest, HardwareMatchResponse, calculate_hardware_match

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
