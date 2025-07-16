# backend/app/api/v1/endpoints/inventry.py

# Import the path helper first
from app.utils.import_helper import setup_project_paths
setup_project_paths()

# Now import from libs
from libs.data_scraper.data_loader import data_loader
from fastapi import APIRouter
import pandas as pd
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.get("/")
def get_inventory():
    """
    Get inventory data from cached CSV files
    Uses the daily scraped data for fast, reliable access
    """
    try:
        logger.info("📊 Backend: Loading inventory data from cache...")

        # Load inventory data from cache
        inventory_data = data_loader.get_inventory_for_dashboard()

        if not inventory_data:
            logger.warning("⚠️ No cached inventory data found")
            return []

        logger.info(f"✅ Loaded {len(inventory_data)} inventory items from cache")
        return inventory_data

    except Exception as e:
        logger.error(f"❌ Error loading inventory: {e}")
        return []


@router.get("/status")
def get_inventory_status():
    """Get inventory cache status and metadata"""
    try:
        status = data_loader.get_data_status()

        return {
            "status": "success",
            "data_source": "cached_csv",
            "cache_status": status,
            "last_updated": status.get("last_update", "Never"),
            "is_fresh": status.get("is_fresh", False),
            "row_count": status.get("row_counts", {}).get("inventory", 0)
        }
    except Exception as e:
        logger.error(f"❌ Error getting inventory status: {e}")
        return {
            "status": "error",
            "error": str(e),
            "data_source": "cached_csv"
        }
