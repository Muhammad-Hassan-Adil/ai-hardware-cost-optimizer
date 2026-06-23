# AI Hardware & Cost Optimizer Hub

The **AI Hardware & Cost Optimizer Hub** is a decoupled, serverless application designed to estimate local LLM hardware memory requirements and dynamically calculate cloud API token costs. 

## Architecture

- **Frontend**: React, TypeScript, Tailwind CSS, Vite.
- **Backend API**: Python, FastAPI, Mangum (for AWS Lambda).
- **Database**: Supabase (PostgreSQL) with Row-Level Security (RLS).
- **Automation Engine**: Python sync script for fetching live OpenRouter pricing.

## Local Development

### Prerequisites
- Node.js & npm
- Python 3.10+
- Supabase account & project

### Backend Setup
1. Navigate to the `backend/` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate the environment: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux).
4. Install requirements: `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and fill in your Supabase credentials.
6. Run the server: `uvicorn app.main:app --reload`

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase URL and Anon key.
4. Start the development server: `npm run dev`

### Database Sync
To update the cloud pricing database with live OpenRouter models:
```bash
cd backend
python scripts/sync_openrouter.py
```
*(Requires `SUPABASE_SERVICE_ROLE_KEY` and `OPENROUTER_API_KEY` in the backend `.env`)*
