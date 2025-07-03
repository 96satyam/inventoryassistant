from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional, Any
from .schemas import DocumentExtractionResult
from agents.doc_extractor import extract_equipment_data
from agents.inventory_checker import check_inventory
from agents.procurement_bot import send_procurement_email
from agents.forecaster import forecast_shortages

import json, os
from datetime import datetime

class PipelineState(TypedDict, total=False):
    pdf_path: str
    extracted: Any
    shortfall: Any
    email_sent: bool
    forecast: Any


# ---------- Helper to log procurement ----------
def log_procurement(shortfall: dict):
    """
    Save shortfall items with timestamp into procurement_log.json.
    """
    log_path = os.path.join("data", "procurement_log.json")
    entry = {
        "timestamp": datetime.now().isoformat(),
        "items": shortfall
    }

    # Load existing logs
    if os.path.exists(log_path):
        with open(log_path, "r") as f:
            logs = json.load(f)
    else:
        logs = []

    # Prepend and save (keep max 20)
    logs.insert(0, entry)
    with open(log_path, "w") as f:
        json.dump(logs[:20], f, indent=2)


# -------- Define nodes --------
def extract_node(state: PipelineState) -> PipelineState:
    print("[extract_node] Incoming state:", state)
    print("[extract_node] State type:", type(state))
    print("[extract_node] State keys:", list(state.keys()) if hasattr(state, 'keys') else 'No keys method')

    pdf_path = state.get("pdf_path")
    if not pdf_path:
        raise ValueError(f"Missing 'pdf_path' in pipeline state. State: {state}")

    print(f"[extract_node] Using pdf_path: {pdf_path}")
    result = extract_equipment_data(pdf_path)

    return {
        **state,
        "extracted": result
    }


def check_node(state: PipelineState) -> PipelineState:
    print("[check_node] Processing inventory check")
    shortfall = check_inventory(state["extracted"])
    return {
        **state,
        "shortfall": shortfall
    }


def email_node(state: PipelineState) -> PipelineState:
    print("[email_node] Processing email")
    email_sent = False
    if state.get("shortfall"):
        send_procurement_email(state["shortfall"])
        log_procurement(state["shortfall"])
        email_sent = True

    return {
        **state,
        "email_sent": email_sent
    }


def forecast_node(state: PipelineState) -> PipelineState:
    print("[forecast_node] Processing forecast")
    forecast = forecast_shortages(n_future_jobs=5)

    # Save forecast to file
    forecast_path = os.path.join("data", "forecast.json")
    with open(forecast_path, "w") as f:
        json.dump(forecast, f, indent=2)

    return {
        **state,
        "forecast": forecast
    }


# -------- Build graph --------
def build_pipeline():
    g = StateGraph(PipelineState)

    g.add_node("extract", extract_node)
    g.add_node("inventory_check", check_node)
    g.add_node("send_email", email_node)
    g.add_node("forecast", forecast_node)

    g.set_entry_point("extract")
    g.add_edge("extract", "inventory_check")
    g.add_edge("inventory_check", "send_email")
    g.add_edge("send_email", "forecast")
    g.add_edge("forecast", END)

    return g.compile()
