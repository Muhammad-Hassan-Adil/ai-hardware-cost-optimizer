from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set to specific origins (e.g. Cloudflare Pages URL)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Hardware & Cost Optimizer API! The API is live.", "docs": f"{settings.API_V1_STR}/openapi.json"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Mangum wrapper for AWS Lambda execution
handler = Mangum(app)
