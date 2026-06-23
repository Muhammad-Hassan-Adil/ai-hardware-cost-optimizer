from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase_client
from supabase import Client
from app.models.seo import PSEOPage

router = APIRouter()

def get_db():
    return get_supabase_client()

@router.get("/resolve/{slug}", response_model=PSEOPage)
def resolve_seo_slug(slug: str, db: Client = Depends(get_db)):
    try:
        response = db.table("pseo_pages").select("*").eq("slug", slug).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Page not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
