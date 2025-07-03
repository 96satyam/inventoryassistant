# apps/api_core/app/routes/suggestions_routes.py
from fastapi import APIRouter
from libs.core.suggestions import suggest_purchase_orders

router = APIRouter(prefix="/suggestions", tags=["Suggestions"])

@router.get("/", summary="Purchase‑order suggestions")
def get_purchase_suggestions():
    return suggest_purchase_orders()
