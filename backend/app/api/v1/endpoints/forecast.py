from fastapi import APIRouter
import logging

# Import the path helper first
from app.utils.import_helper import setup_project_paths
setup_project_paths()

from libs.core.forecast import forecast_shortages
from libs.core.hybrid_data_manager import get_hybrid_data_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/forecast", tags=["forecast"])

@router.get("/")
def fetch_forecast():
    """
    Get forecast data using live Google Sheets inventory data
    """
    try:
        logger.info("📊 Backend: Generating forecast with Google Sheets data...")

        # Initialize hybrid data manager for live data
        sheet_id = "1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls"
        manager = get_hybrid_data_manager(sheet_id)

        # Ensure we're using live data for forecasting
        inventory_data = manager.load_inventory(prefer_sheets=True)
        install_history = manager.load_install_history(prefer_sheets=True)

        logger.info(f"✅ Backend: Using live data - {len(inventory_data)} inventory items, {len(install_history)} history records")

        # 10 installations (professional solar installer forecasting approach)
        forecast_result = forecast_shortages(n_future_installations=10)

        logger.info(f"📈 Backend: Generated forecast with {len(forecast_result)} items")
        return forecast_result

    except Exception as e:
        logger.error(f"❌ Backend: Error generating forecast: {e}")
        # Fallback to original method
        try:
            logger.info("📄 Backend: Falling back to Excel-based forecasting")
            return forecast_shortages(n_future_installations=10)
        except Exception as fallback_error:
            logger.error(f"❌ Backend: Fallback forecast also failed: {fallback_error}")
            return []
