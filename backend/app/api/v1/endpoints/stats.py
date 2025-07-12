# backend/app/api/v1/endpoints/stats.py
from fastapi import APIRouter

# Import the path helper first
from app.utils.import_helper import setup_project_paths
setup_project_paths()

from libs.core.inventory import summarise_inventory
from libs.core.forecast import forecast_shortages

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/")
def get_stats():
    """
    Returns KPI numbers for the dashboard.
    """
    inv = summarise_inventory()              # [{'name', 'available', 'required'}...]

    if not inv:                              # empty list → safe defaults
        return {"efficiency": 0.0,
                "open_procurements": 0,
                "next_shortfall": {}}

    # convert list → DataFrame for vector maths
    import pandas as pd
    df = pd.DataFrame(inv)

    # ---------------- KPIs ---------------- #
    efficiency = round((df["available"] >= df["required"]).mean() * 100, 1)
    below_min  = df[df["available"] < df["required"]]
    open_pr    = len(below_min)

    # forecast for next 10 installations (professional solar installer approach)
    next_sf    = forecast_shortages(n_future_installations=10)

    return {
        "efficiency":        efficiency,
        "open_procurements": open_pr,
        "next_shortfall":    next_sf,
    }
