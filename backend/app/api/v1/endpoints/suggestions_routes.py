# backend/app/api/v1/endpoints/suggestions_routes.py
from fastapi import APIRouter

# Import the path helper first
from app.utils.import_helper import setup_project_paths
setup_project_paths()

from libs.core.suggestions import suggest_purchase_orders

router = APIRouter(prefix="/suggestions", tags=["Suggestions"])

@router.get("/", summary="Purchase‑order suggestions")
def get_purchase_suggestions():
    return suggest_purchase_orders()
