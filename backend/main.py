from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from datetime import datetime

app = FastAPI(title="Vanta Studio Backend", version="1.0.0")

# CORS config to allow the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Vanta Studio Genblaze API"}

@app.get("/health")
def health_check():
    """Keep-alive endpoint for Render free tier — prevents cold starts."""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

# Run this using: uvicorn main:app --reload

