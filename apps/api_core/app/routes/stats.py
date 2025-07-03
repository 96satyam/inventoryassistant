# apps/api_core/app/routes/stats.py
from fastapi import APIRouter
from libs.core.inventory import summarise_inventory      # ← use this
from libs.core.forecast  import forecast_shortages

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

    # forecast for next 14 installs
    next_sf    = forecast_shortages(n_future_jobs=14)

    return {
        "efficiency":        efficiency,
        "open_procurements": open_pr,
        "next_shortfall":    next_sf,
    }
