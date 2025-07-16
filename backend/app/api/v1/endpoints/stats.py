# backend/app/api/v1/endpoints/stats.py
from fastapi import APIRouter
import logging
import pandas as pd

# Import the path helper first
from app.utils.import_helper import setup_project_paths
setup_project_paths()

from libs.core.inventory import summarise_inventory
from libs.core.forecast import forecast_shortages
from libs.core.hybrid_data_manager import get_hybrid_data_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/")
def get_stats():
    """
    Returns KPI numbers for the dashboard using live Google Sheets data.
    """
    try:
        logger.info("📊 Backend: Calculating stats with Google Sheets data...")

        # Initialize hybrid data manager for live data
        sheet_id = "1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls"
        manager = get_hybrid_data_manager(sheet_id)

        # Get live inventory data
        inventory_df = manager.load_inventory(prefer_sheets=True)

        if inventory_df.empty:
            logger.warning("⚠️ No inventory data available for stats")
            return {"efficiency": 0.0, "open_procurements": 0, "next_shortfall": {}}

        # Use summarise_inventory which will now use the live data
        inv = summarise_inventory()              # [{'name', 'available', 'required'}...]

        if not inv:                              # empty list → safe defaults
            return {"efficiency": 0.0,
                    "open_procurements": 0,
                    "next_shortfall": {}}

        # convert list → DataFrame for vector maths
        df = pd.DataFrame(inv)

        # ---------------- KPIs ---------------- #
        efficiency = round((df["available"] >= df["required"]).mean() * 100, 1)
        below_min  = df[df["available"] < df["required"]]
        open_pr    = len(below_min)

        # forecast for next 10 installations (professional solar installer approach)
        next_sf    = forecast_shortages(n_future_installations=10)

        logger.info(f"✅ Backend: Stats calculated - efficiency: {efficiency}%, open procurements: {open_pr}")

        return {
            "efficiency":        efficiency,
            "open_procurements": open_pr,
            "next_shortfall":    next_sf,
        }

    except Exception as e:
        logger.error(f"❌ Backend: Error calculating stats: {e}")
        # Fallback to original method
        try:
            logger.info("📄 Backend: Falling back to Excel-based stats")
            inv = summarise_inventory()
            if not inv:
                return {"efficiency": 0.0, "open_procurements": 0, "next_shortfall": {}}

            df = pd.DataFrame(inv)
            efficiency = round((df["available"] >= df["required"]).mean() * 100, 1)
            below_min = df[df["available"] < df["required"]]
            open_pr = len(below_min)
            next_sf = forecast_shortages(n_future_installations=10)

            return {
                "efficiency": efficiency,
                "open_procurements": open_pr,
                "next_shortfall": next_sf,
            }
        except Exception as fallback_error:
            logger.error(f"❌ Backend: Fallback stats also failed: {fallback_error}")
            return {"efficiency": 0.0, "open_procurements": 0, "next_shortfall": {}}
