"""
Hybrid Data Manager for Solar Installer AI
Provides seamless integration between Excel files and Google Sheets
Maintains backward compatibility while adding real-time capabilities
"""

import pandas as pd
import logging
import os
from typing import Dict, List, Optional, Any, Union
from pathlib import Path
from datetime import datetime
import threading
import time

from .sheets_connector import get_sheets_connector
from .inventory import load_inventory as load_excel_inventory

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HybridDataManager:
    """
    Manages data from both Excel files and Google Sheets
    Provides fallback mechanisms and real-time sync capabilities
    """
    
    def __init__(self, sheet_id: str = None, enable_sync: bool = True):
        self.sheet_id = sheet_id
        self.enable_sync = enable_sync
        self.sheets_connector = get_sheets_connector()
        self._sync_thread = None
        self._stop_sync = False
        self._last_excel_check = {}
        
        # Set up Google Sheets if sheet_id provided
        if sheet_id and self.sheets_connector.is_connected():
            self.sheets_connector.set_sheet_id(sheet_id)
            logger.info(f"🔗 Hybrid Data Manager connected to Google Sheets: {sheet_id}")
        
        # Start background sync if enabled
        if enable_sync:
            self.start_background_sync()
    
    def load_inventory(self, prefer_sheets: bool = True) -> pd.DataFrame:
        """
        Load inventory data with hybrid approach

        Args:
            prefer_sheets: If True, try Google Sheets first, fallback to Excel
                          If False, use Excel only

        Returns:
            pd.DataFrame: Inventory data
        """
        if prefer_sheets and self.sheets_connector.is_connected():
            # Try Google Sheets first - use Sheet1 for inventory data
            sheets_data = self.sheets_connector.get_worksheet_data("Sheet1")
            if sheets_data is not None:
                logger.info("📊 Using Google Sheets inventory data from Sheet1")
                return self._normalize_inventory_data(sheets_data)
            else:
                logger.info("📄 Google Sheets unavailable, falling back to Excel")
        
        # Fallback to Excel
        try:
            excel_data = load_excel_inventory()
            logger.info("📄 Using Excel inventory data")
            return excel_data
        except Exception as e:
            logger.error(f"❌ Failed to load Excel inventory: {e}")
            # Return empty DataFrame as last resort
            return pd.DataFrame()
    
    def load_install_history(self, prefer_sheets: bool = True) -> pd.DataFrame:
        """Load installation history data"""
        if prefer_sheets and self.sheets_connector.is_connected():
            sheets_data = self.sheets_connector.get_worksheet_data("Sheet2")
            if sheets_data is not None:
                logger.info("📊 Using Google Sheets install history from Sheet2")
                return sheets_data
        
        # Fallback to Excel
        try:
            project_root = Path(__file__).resolve().parents[2]
            history_file = project_root / "data" / "install_history.xlsx"
            if history_file.exists():
                excel_data = pd.read_excel(history_file).fillna(0)
                logger.info("📄 Using Excel install history")
                return excel_data
        except Exception as e:
            logger.error(f"❌ Failed to load Excel install history: {e}")
        
        return pd.DataFrame()
    
    def sync_excel_to_sheets(self, worksheet_mapping: Dict[str, str] = None) -> bool:
        """
        Sync Excel data to Google Sheets
        
        Args:
            worksheet_mapping: Dict mapping Excel files to worksheet names
                             Default: {"Inventry.xlsx": "Inventory", "install_history.xlsx": "InstallHistory"}
        
        Returns:
            bool: True if sync successful
        """
        if not self.sheets_connector.is_connected():
            logger.warning("⚠️ Cannot sync - not connected to Google Sheets")
            return False
        
        if worksheet_mapping is None:
            worksheet_mapping = {
                "Inventry.xlsx": "Inventory",
                "install_history.xlsx": "InstallHistory"
            }
        
        project_root = Path(__file__).resolve().parents[2]
        data_dir = project_root / "data"
        
        success_count = 0
        
        for excel_file, worksheet_name in worksheet_mapping.items():
            excel_path = data_dir / excel_file
            
            if not excel_path.exists():
                logger.warning(f"⚠️ Excel file not found: {excel_path}")
                continue
            
            try:
                # Check if file was modified since last sync
                last_modified = os.path.getmtime(excel_path)
                if excel_file in self._last_excel_check:
                    if last_modified <= self._last_excel_check[excel_file]:
                        logger.debug(f"📄 {excel_file} unchanged, skipping sync")
                        continue
                
                # Load Excel data
                if excel_file == "Inventry.xlsx":
                    data = load_excel_inventory()
                else:
                    data = pd.read_excel(excel_path).fillna(0)
                
                # Sync to Google Sheets
                if self.sheets_connector.update_worksheet_data(worksheet_name, data):
                    self._last_excel_check[excel_file] = last_modified
                    success_count += 1
                    logger.info(f"✅ Synced {excel_file} → {worksheet_name}")
                else:
                    logger.error(f"❌ Failed to sync {excel_file} → {worksheet_name}")
                    
            except Exception as e:
                logger.error(f"❌ Error syncing {excel_file}: {e}")
        
        return success_count > 0
    
    def sync_sheets_to_excel(self, worksheet_mapping: Dict[str, str] = None) -> bool:
        """
        Sync Google Sheets data to Excel files
        
        Args:
            worksheet_mapping: Dict mapping worksheet names to Excel files
        
        Returns:
            bool: True if sync successful
        """
        if not self.sheets_connector.is_connected():
            logger.warning("⚠️ Cannot sync - not connected to Google Sheets")
            return False
        
        if worksheet_mapping is None:
            worksheet_mapping = {
                "Inventory": "Inventry.xlsx",
                "InstallHistory": "install_history.xlsx"
            }
        
        project_root = Path(__file__).resolve().parents[2]
        data_dir = project_root / "data"
        
        success_count = 0
        
        for worksheet_name, excel_file in worksheet_mapping.items():
            try:
                # Get data from Google Sheets
                data = self.sheets_connector.get_worksheet_data(worksheet_name, use_cache=False)
                
                if data is None:
                    logger.warning(f"⚠️ No data found in worksheet: {worksheet_name}")
                    continue
                
                # Save to Excel
                excel_path = data_dir / excel_file
                data.to_excel(excel_path, index=False)
                
                success_count += 1
                logger.info(f"✅ Synced {worksheet_name} → {excel_file}")
                
            except Exception as e:
                logger.error(f"❌ Error syncing {worksheet_name}: {e}")
        
        return success_count > 0
    
    def start_background_sync(self, interval: int = 300):
        """Start background sync thread (every 5 minutes by default)"""
        if self._sync_thread and self._sync_thread.is_alive():
            logger.info("🔄 Background sync already running")
            return
        
        def sync_worker():
            while not self._stop_sync:
                try:
                    if self.sheets_connector.is_connected():
                        self.sync_excel_to_sheets()
                    time.sleep(interval)
                except Exception as e:
                    logger.error(f"❌ Background sync error: {e}")
                    time.sleep(60)  # Wait 1 minute before retrying
        
        self._stop_sync = False
        self._sync_thread = threading.Thread(target=sync_worker, daemon=True)
        self._sync_thread.start()
        logger.info(f"🔄 Started background sync (every {interval} seconds)")
    
    def stop_background_sync(self):
        """Stop background sync thread"""
        self._stop_sync = True
        if self._sync_thread:
            self._sync_thread.join(timeout=5)
        logger.info("⏹️ Stopped background sync")
    
    def _normalize_inventory_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Normalize Google Sheets data to match Excel format"""
        # This ensures compatibility with existing code
        # Add any necessary column name mappings here
        return data
    
    def get_data_source_status(self) -> Dict[str, Any]:
        """Get status of all data sources"""
        project_root = Path(__file__).resolve().parents[2]
        data_dir = project_root / "data"
        
        excel_files = {
            "Inventry.xlsx": (data_dir / "Inventry.xlsx").exists(),
            "install_history.xlsx": (data_dir / "install_history.xlsx").exists()
        }
        
        sheets_status = self.sheets_connector.get_connection_status()
        
        return {
            "excel_files": excel_files,
            "google_sheets": sheets_status,
            "hybrid_mode": self.sheets_connector.is_connected(),
            "background_sync": self._sync_thread is not None and self._sync_thread.is_alive()
        }

# Global instance
_hybrid_manager = None

def get_hybrid_data_manager(sheet_id: str = None) -> HybridDataManager:
    """Get global hybrid data manager instance"""
    global _hybrid_manager
    if _hybrid_manager is None:
        _hybrid_manager = HybridDataManager(sheet_id)
    elif sheet_id and _hybrid_manager.sheet_id != sheet_id:
        # Update sheet_id if different
        _hybrid_manager.sheet_id = sheet_id
        if _hybrid_manager.sheets_connector.is_connected():
            _hybrid_manager.sheets_connector.set_sheet_id(sheet_id)
    return _hybrid_manager
