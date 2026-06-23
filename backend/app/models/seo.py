from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from uuid import UUID

class PSEOPageBase(BaseModel):
    slug: str
    page_type: str
    target_param_value: str
    meta_title: str
    meta_description: str
    h1_title: str
    intro_content: str
    structured_data_jsonB: Optional[dict] = None

class PSEOPage(PSEOPageBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
