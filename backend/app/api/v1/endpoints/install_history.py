"""
Install History API endpoints
Provides access to installation history data from Excel/Google Sheets
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import logging
import sys
from pathlib import Path

# Add project root to path for accessing libs
project_root = Path(__file__).parent.parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from libs.core.hybrid_data_manager import get_hybrid_data_manager

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
async def get_install_history():
    """
    Get installation history data
    Returns data from Google Sheets (Sheet2) or Excel fallback
    """
    try:
        logger.info("📊 Loading install history data...")
        
        # Use hybrid data manager to get install history
        sheet_id = "1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls"
        manager = get_hybrid_data_manager(sheet_id)
        
        # Load install history data (tries Google Sheets first, then Excel)
        df = manager.load_install_history(prefer_sheets=True)
        
        if df.empty:
            logger.warning("⚠️ No install history data found")
            return []
        
        # Convert DataFrame to list of dictionaries
        data = df.to_dict('records')
        
        logger.info(f"✅ Loaded {len(data)} install history records")
        return data
        
    except Exception as e:
        logger.error(f"❌ Error loading install history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load install history: {str(e)}")

@router.get("/summary")
async def get_install_history_summary():
    """
    Get summary statistics for installation history
    """
    try:
        logger.info("📊 Generating install history summary...")
        
        # Use hybrid data manager to get install history
        sheet_id = "1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls"
        manager = get_hybrid_data_manager(sheet_id)
        
        # Load install history data
        df = manager.load_install_history(prefer_sheets=True)
        
        if df.empty:
            return {
                "total_installations": 0,
                "recent_installations": 0,
                "summary": "No installation history data available"
            }
        
        # Generate summary statistics
        total_installations = len(df)
        
        # Try to get recent installations (last 30 days)
        recent_installations = total_installations  # Simplified for now
        
        summary = {
            "total_installations": total_installations,
            "recent_installations": recent_installations,
            "summary": f"{total_installations} total installations recorded"
        }
        
        logger.info(f"✅ Generated install history summary: {summary}")
        return summary
        
    except Exception as e:
        logger.error(f"❌ Error generating install history summary: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")
