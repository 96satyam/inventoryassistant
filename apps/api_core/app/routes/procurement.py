# apps/api_core/app/routes/procurement.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from pathlib import Path
from typing import List, Dict
import os, json

from libs.core.procurement_logger import (
    read_procurement_log,
    log_procurement,
)

from ..services.suggestions import generate_po_suggestions

router = APIRouter(prefix="/procurement", tags=["procurement"])

LOG_PATH = Path("data") / "procurement_log.json"

@router.get("/")
def procurement_base():
    return {"message": "Procurement API is live ✅"}

@router.get("/logs")
def get_logs():
    try:
        return read_procurement_log()
    except Exception:
        return []

@router.post("/draft")
def draft_purchase_orders():
    """
    Auto-drafts purchase orders for shortages in the next 14 days.
    Logs them in procurement_log.json
    """
    try:
        suggestions = generate_po_suggestions(n_days=14)
        for suggestion in suggestions:
            items = suggestion["items"]
            log_procurement(items)

        return {
            "success": True,
            "message": f"{len(suggestions)} vendor(s) logged.",
            "logged": suggestions,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Updated model with types
class SendPORequest(BaseModel):
    vendor: str = Field(..., example="SolarEdge")
    items: Dict[str, int] = Field(..., example={"U650 Optimizer": 15})
    email: str = Field(..., example="someone@example.com")
    shipping_address: str = Field(..., example="123 Solar Lane, Delhi")
    need_by: str = Field(..., example="2025-07-10")

@router.post("/send-email")
def send_po(request: SendPORequest):
    """
    Sends a Purchase Order via email to the given vendor.
    """
    try:
        from ..services.email import build_po_email, send_email

        body = build_po_email(
            vendor=request.vendor,
            items=request.items,
            shipping_address=request.shipping_address,
            need_by=request.need_by,
        )

        subject = f"Purchase Order Request — {request.vendor}"
        send_email(subject, body, request.email)

        return {"success": True, "message": f"Email sent to {request.email}"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
