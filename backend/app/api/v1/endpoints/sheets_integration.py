"""
Google Sheets Integration API Routes
Provides endpoints for managing Google Sheets integration
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import logging

# Import the path helper first
from app.utils.import_helper import setup_project_paths
setup_project_paths()

from libs.core.hybrid_data_manager import get_hybrid_data_manager
from libs.core.sheets_connector import get_sheets_connector
from app.core.sheets_config import (
    get_sheet_id, set_sheet_id, validate_configuration,
    WORKSHEET_MAPPING, SYNC_SETTINGS
)

router = APIRouter(prefix="/sheets", tags=["Google Sheets Integration"])
logger = logging.getLogger(__name__)

# Pydantic models
class SheetsConfigRequest(BaseModel):
    sheet_id: str = Field(..., description="Google Sheets ID from the URL")
    enable_sync: bool = Field(True, description="Enable background synchronization")

class SyncRequest(BaseModel):
    direction: str = Field(..., description="Sync direction: 'excel_to_sheets' or 'sheets_to_excel'")
    force: bool = Field(False, description="Force sync even if no changes detected")

class SheetsStatusResponse(BaseModel):
    connected: bool
    sheet_id: Optional[str]
    spreadsheet_title: Optional[str]
    data_sources: Dict[str, Any]
    sync_status: Dict[str, Any]

@router.get("/status", response_model=SheetsStatusResponse)
def get_sheets_status():
    """Get current Google Sheets integration status"""
    try:
        connector = get_sheets_connector()
        manager = get_hybrid_data_manager()
        
        connection_status = connector.get_connection_status()
        data_source_status = manager.get_data_source_status()
        config_validation = validate_configuration()
        
        return SheetsStatusResponse(
            connected=connection_status["connected"],
            sheet_id=connection_status["sheet_id"],
            spreadsheet_title=connection_status["spreadsheet_title"],
            data_sources=data_source_status,
            sync_status={
                "background_sync_enabled": data_source_status["background_sync"],
                "configuration_valid": config_validation,
                "last_sync": connection_status["last_sync"]
            }
        )
    except Exception as e:
        logger.error(f"Error getting sheets status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/configure")
def configure_sheets(config: SheetsConfigRequest):
    """Configure Google Sheets integration"""
    try:
        # Validate sheet ID format
        if not config.sheet_id or len(config.sheet_id) < 20:
            raise HTTPException(status_code=400, detail="Invalid Google Sheets ID")
        
        # Save sheet ID to config
        if not set_sheet_id(config.sheet_id):
            raise HTTPException(status_code=500, detail="Failed to save sheet ID")
        
        # Initialize connection
        connector = get_sheets_connector()
        if not connector.set_sheet_id(config.sheet_id):
            raise HTTPException(status_code=400, detail="Failed to connect to Google Sheet")
        
        # Initialize hybrid manager
        manager = get_hybrid_data_manager(config.sheet_id)
        
        # Start background sync if requested
        if config.enable_sync:
            manager.start_background_sync()
        
        return {
            "success": True,
            "message": "Google Sheets integration configured successfully",
            "sheet_id": config.sheet_id,
            "sync_enabled": config.enable_sync
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error configuring sheets: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync")
def sync_data(sync_request: SyncRequest, background_tasks: BackgroundTasks):
    """Manually trigger data synchronization"""
    try:
        sheet_id = get_sheet_id()
        if not sheet_id:
            raise HTTPException(status_code=400, detail="Google Sheets not configured")
        
        manager = get_hybrid_data_manager(sheet_id)
        
        def perform_sync():
            try:
                if sync_request.direction == "excel_to_sheets":
                    success = manager.sync_excel_to_sheets()
                elif sync_request.direction == "sheets_to_excel":
                    success = manager.sync_sheets_to_excel()
                else:
                    logger.error(f"Invalid sync direction: {sync_request.direction}")
                    return
                
                if success:
                    logger.info(f"✅ Manual sync completed: {sync_request.direction}")
                else:
                    logger.error(f"❌ Manual sync failed: {sync_request.direction}")
                    
            except Exception as e:
                logger.error(f"❌ Sync error: {e}")
        
        # Run sync in background
        background_tasks.add_task(perform_sync)
        
        return {
            "success": True,
            "message": f"Sync started: {sync_request.direction}",
            "direction": sync_request.direction
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/worksheets")
def list_worksheets():
    """List available worksheets in the connected Google Sheet"""
    try:
        connector = get_sheets_connector()
        if not connector.is_connected() or not connector.spreadsheet:
            raise HTTPException(status_code=400, detail="Not connected to Google Sheets")
        
        worksheets = []
        for worksheet in connector.spreadsheet.worksheets():
            worksheets.append({
                "name": worksheet.title,
                "id": worksheet.id,
                "row_count": worksheet.row_count,
                "col_count": worksheet.col_count
            })
        
        return {
            "success": True,
            "worksheets": worksheets,
            "total_count": len(worksheets)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing worksheets: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data/{worksheet_name}")
def get_worksheet_data(worksheet_name: str, limit: int = 100):
    """Get data from a specific worksheet"""
    try:
        connector = get_sheets_connector()
        if not connector.is_connected():
            raise HTTPException(status_code=400, detail="Not connected to Google Sheets")
        
        data = connector.get_worksheet_data(worksheet_name)
        if data is None:
            raise HTTPException(status_code=404, detail=f"Worksheet '{worksheet_name}' not found or empty")
        
        # Limit rows for API response
        if len(data) > limit:
            data = data.head(limit)
        
        return {
            "success": True,
            "worksheet_name": worksheet_name,
            "row_count": len(data),
            "columns": data.columns.tolist(),
            "data": data.to_dict(orient="records")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting worksheet data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-connection")
def test_connection():
    """Test Google Sheets connection"""
    try:
        connector = get_sheets_connector()
        
        if not connector.is_connected():
            return {
                "success": False,
                "message": "Not connected to Google Sheets",
                "details": connector.get_connection_status()
            }
        
        # Try to access a test worksheet or create one
        sheet_id = get_sheet_id()
        if sheet_id:
            connector.set_sheet_id(sheet_id)
        
        return {
            "success": True,
            "message": "Google Sheets connection successful",
            "details": connector.get_connection_status()
        }
        
    except Exception as e:
        logger.error(f"Connection test failed: {e}")
        return {
            "success": False,
            "message": f"Connection test failed: {str(e)}",
            "details": None
        }

@router.get("/config")
def get_current_config():
    """Get current Google Sheets configuration"""
    try:
        return {
            "sheet_id": get_sheet_id(),
            "worksheet_mapping": WORKSHEET_MAPPING,
            "sync_settings": SYNC_SETTINGS,
            "validation": validate_configuration()
        }
    except Exception as e:
        logger.error(f"Error getting config: {e}")
        raise HTTPException(status_code=500, detail=str(e))
