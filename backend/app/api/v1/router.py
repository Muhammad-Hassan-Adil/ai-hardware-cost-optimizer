from fastapi import APIRouter
from app.api.v1.endpoints import hardware, seo

api_router = APIRouter()

api_router.include_router(hardware.router, prefix="/hardware", tags=["hardware"])
api_router.include_router(seo.router, prefix="/seo", tags=["seo"])
