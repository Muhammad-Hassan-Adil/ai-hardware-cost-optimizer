from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class QuantizationBase(BaseModel):
    quant_type: str
    bits_per_weight: float
    file_size_gb: float
    recommended_vram_gb: float

class Quantization(QuantizationBase):
    id: UUID
    model_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class LocalModelBase(BaseModel):
    name: str
    family: str
    slug: str
    parameter_size_billion: float
    context_length: int = 8192
    huggingface_repo: Optional[str] = None

class LocalModel(LocalModelBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    quantizations: Optional[List[Quantization]] = []

    class Config:
        from_attributes = True
