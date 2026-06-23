import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Hardware & Cost Optimizer API"
    API_V1_STR: str = "/api/v1"
    
    # Supabase credentials
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # OpenRouter API Key (for backend script sync)
    OPENROUTER_API_KEY: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
