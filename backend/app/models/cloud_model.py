from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class CloudProviderBase(BaseModel):
    name: str
    slug: str
    api_base_url: Optional[str] = None

class CloudProvider(CloudProviderBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class CloudModelBase(BaseModel):
    openrouter_id: str
    friendly_name: str
    prompt_price_per_1m_usd: float
    completion_price_per_1m_usd: float
    context_length: int = 4096
    is_active: bool = True

class CloudModelCreate(CloudModelBase):
    provider_id: UUID

class CloudModel(CloudModelBase):
    id: UUID
    provider_id: UUID
    last_synced_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
