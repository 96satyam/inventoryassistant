from __future__ import annotations

# ── Standard Library ────────────────────────────────────────────────
import os
import pathlib
import tempfile

# ── Third-Party ─────────────────────────────────────────────────────
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ── Internal Imports ────────────────────────────────────────────────
from .pipeline import run_pipeline_from_pdf
from .routes.inventry import router as inventory_router   # Rename file if needed to "inventory.py"
from .routes.procurement import router as procurement_router
from .routes.forecast import router as forecast_router
from .routes.stats import router as stats_router
# from .services import suggestions
from .routes import suggestions_routes
# from apps.api_core.app.routes import forecast_top5
# from apscheduler.schedulers.background import BackgroundScheduler
# from libs.core.forecast import forecast_shortages
# from libs.core.suggestions import suggest_purchase_orders
# from apps.api_core.app.routes import whatsapp_routes






# ── Load Environment Variables ──────────────────────────────────────
load_dotenv()

# ── FastAPI App ─────────────────────────────────────────────────────
app = FastAPI(
    title="🧠 Smart Inventory Assistant for Solar Installers",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── CORS Setup ──────────────────────────────────────────────────────
# Enhanced CORS configuration for both local and public deployment
def get_cors_origins():
    """Get CORS origins based on environment"""
    base_origins = [
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://192.168.0.58:3000",
        "http://192.168.0.58:3001",
        "http://192.168.0.58:3002",
        "http://192.168.0.80:3000",
        "http://192.168.0.80:3001",
        "http://192.168.0.80:3002",
        # Add common local network ranges
        "http://172.20.10.3:3000",
        "http://172.20.10.3:3001",
        "http://172.20.10.3:3002",
    ]

    # Check if we're in production or public deployment
    env = os.getenv("ENVIRONMENT", "development")
    if env == "production" or os.getenv("ALLOW_ALL_ORIGINS", "false").lower() == "true":
        # For public deployment, allow all origins
        return ["*"]

    return base_origins

origins = get_cors_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health Check Endpoint ──────────────────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Solar Installer API is running"}

# ── Register All API Routers ────────────────────────────────────────
app.include_router(inventory_router)
app.include_router(procurement_router)
app.include_router(forecast_router)
app.include_router(stats_router)
app.include_router(suggestions_routes.router)
# app.include_router(forecast_top5.router)
# app.include_router(whatsapp_routes.router)


# ── Health Check Routes ─────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "API is working ✅", "version": "0.1.0"}

@app.get("/ping")
def ping():
    return {"message": "pong", "version": "0.1.0"}

# ── Main AI Pipeline Endpoint ───────────────────────────────────────
@app.post("/run-pipeline")
async def run_pipeline(file: UploadFile = File(...)):
    """
    Accepts a PDF file and runs the AI extraction pipeline on it.
    """
    import tempfile
    import pathlib

    # Validate file type
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = pathlib.Path(tmp.name)

    try:
        print(f"🚀 Processing PDF: {file.filename}")
        result = run_pipeline_from_pdf(str(tmp_path))
        print(f"✅ Pipeline completed successfully")
        return result
    except Exception as e:
        print(f"❌ Pipeline failed: {str(e)}")
        # Clean up the temp file even if pipeline fails
        tmp_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")
    finally:
        tmp_path.unlink(missing_ok=True)
