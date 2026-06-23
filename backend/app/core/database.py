from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client() -> Client:
    """Initialize and return the Supabase client."""
    url: str = settings.SUPABASE_URL
    key: str = settings.SUPABASE_SERVICE_ROLE_KEY
    supabase: Client = create_client(url, key)
    return supabase
