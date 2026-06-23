from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class GPUBase(BaseModel):
    name: str
    slug: str
    vram_gb: float
    memory_bandwidth_gb_s: float
    bus_width_bits: int
    tdp_watts: Optional[int] = None
    manufacturer: str

class GPUCreate(GPUBase):
    pass

class GPU(GPUBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
