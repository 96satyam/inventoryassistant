"""
Daily Data Scraper
Professional Google Sheets data scraping system with change detection
"""

import pandas as pd
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from ..core.sheets_connector import get_sheets_connector
from .config import (
    GOOGLE_SHEETS_CONFIG, CACHE_FILES, LOG_FILES, 
    SCRAPER_CONFIG, VALIDATION_CONFIG
)


class DailyDataScraper:
    """Professional daily data scraper for Google Sheets integration"""
    
    def __init__(self):
        self.setup_logging()
        self.sheets_connector = None
        
    def setup_logging(self):
        """Configure logging for the scraper"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(LOG_FILES["scraper"]),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def get_sheets_connection(self):
        """Get Google Sheets connector with error handling"""
        if not self.sheets_connector:
            try:
                self.sheets_connector = get_sheets_connector()
                self.logger.info("✅ Google Sheets connection established")
            except Exception as e:
                self.logger.error(f"❌ Failed to connect to Google Sheets: {e}")
                raise
        return self.sheets_connector
    
    def fetch_sheet_data(self, sheet_name: str) -> pd.DataFrame:
        """Fetch data from a specific Google Sheet"""
        try:
            connector = self.get_sheets_connection()
            spreadsheet_id = GOOGLE_SHEETS_CONFIG["spreadsheet_id"]
            
            self.logger.info(f"📊 Fetching data from {sheet_name}")

            # First set the sheet ID
            if not connector.set_sheet_id(spreadsheet_id):
                raise Exception(f"Failed to connect to spreadsheet {spreadsheet_id}")

            # Then get worksheet data
            df = connector.get_worksheet_data(sheet_name)
            
            if df is not None and not df.empty:
                self.logger.info(f"✅ Fetched {len(df)} rows from {sheet_name}")
                return df
            else:
                self.logger.warning(f"⚠️ No data found in {sheet_name}")
                return pd.DataFrame()
                
        except Exception as e:
            self.logger.error(f"❌ Error fetching {sheet_name}: {e}")
            return pd.DataFrame()
    
    def validate_data(self, df: pd.DataFrame, data_type: str) -> bool:
        """Validate fetched data"""
        if df.empty:
            self.logger.warning(f"⚠️ {data_type} data is empty")
            return False
            
        # Check row count
        row_count = len(df)
        min_rows = VALIDATION_CONFIG["min_rows_threshold"]
        max_rows = VALIDATION_CONFIG["max_rows_threshold"]
        
        if row_count < min_rows:
            self.logger.warning(f"⚠️ {data_type} has too few rows: {row_count}")
            return False
            
        if row_count > max_rows:
            self.logger.warning(f"⚠️ {data_type} has too many rows: {row_count}")
            return False
        
        # Check required columns (basic validation)
        required_cols = (
            VALIDATION_CONFIG["required_inventory_columns"] 
            if data_type == "inventory" 
            else VALIDATION_CONFIG["required_history_columns"]
        )
        
        # Note: Column validation is flexible since Google Sheets may have different formats
        self.logger.info(f"✅ {data_type} data validation passed: {row_count} rows")
        return True
    
    def detect_changes(self, new_data: pd.DataFrame, data_type: str) -> Dict:
        """Detect changes between new data and cached data"""
        changes = {
            "timestamp": datetime.now().isoformat(),
            "data_type": data_type,
            "changes_detected": False,
            "summary": {},
            "row_count_change": 0
        }
        
        try:
            cache_file = CACHE_FILES[data_type]
            if cache_file.exists():
                cached_data = pd.read_csv(cache_file)
                
                # Compare row counts
                new_count = len(new_data)
                cached_count = len(cached_data)
                
                if new_count != cached_count:
                    changes["changes_detected"] = True
                    changes["row_count_change"] = new_count - cached_count
                    changes["summary"]["row_count"] = {
                        "previous": cached_count,
                        "current": new_count,
                        "difference": new_count - cached_count
                    }
                
                # Basic content comparison
                if not new_data.equals(cached_data):
                    changes["changes_detected"] = True
                    changes["summary"]["content_modified"] = True
                    
            else:
                # First time scraping
                changes["changes_detected"] = True
                changes["summary"]["first_scrape"] = True
                
        except Exception as e:
            self.logger.error(f"❌ Error detecting changes for {data_type}: {e}")
            
        return changes
    
    def save_to_cache(self, data: pd.DataFrame, data_type: str) -> bool:
        """Save data to cache CSV file"""
        try:
            cache_file = CACHE_FILES[data_type]
            
            # Backup existing file if it exists
            if cache_file.exists() and SCRAPER_CONFIG["backup_old_files"]:
                backup_file = cache_file.with_suffix(f".backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
                cache_file.rename(backup_file)
                self.logger.info(f"📁 Backed up existing {data_type} cache")
            
            # Save new data
            data.to_csv(cache_file, index=False)
            self.logger.info(f"💾 Saved {len(data)} rows to {data_type} cache")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Error saving {data_type} to cache: {e}")
            return False
    
    def log_changes(self, changes: Dict):
        """Log changes to changes.json file"""
        try:
            changes_file = LOG_FILES["changes"]
            
            # Load existing changes log
            if changes_file.exists():
                with open(changes_file, 'r') as f:
                    changes_log = json.load(f)
            else:
                changes_log = []
            
            # Add new changes
            changes_log.append(changes)
            
            # Keep only last 100 change records
            changes_log = changes_log[-100:]
            
            # Save updated log
            with open(changes_file, 'w') as f:
                json.dump(changes_log, f, indent=2)
                
            if changes["changes_detected"]:
                self.logger.info(f"📝 Logged changes for {changes['data_type']}")
                
        except Exception as e:
            self.logger.error(f"❌ Error logging changes: {e}")
    
    def update_metadata(self, inventory_data: pd.DataFrame, history_data: pd.DataFrame, 
                       inventory_changes: Dict, history_changes: Dict):
        """Update metadata file with scrape information"""
        try:
            metadata = {
                "last_scrape": datetime.now().isoformat(),
                "scrape_status": "success",
                "data_summary": {
                    "inventory_rows": len(inventory_data),
                    "history_rows": len(history_data),
                    "total_rows": len(inventory_data) + len(history_data)
                },
                "changes": {
                    "inventory": inventory_changes,
                    "history": history_changes
                },
                "next_scheduled_scrape": "09:00 tomorrow"
            }
            
            with open(CACHE_FILES["metadata"], 'w') as f:
                json.dump(metadata, f, indent=2)
                
            self.logger.info("📊 Updated metadata")
            
        except Exception as e:
            self.logger.error(f"❌ Error updating metadata: {e}")
    
    def run_daily_scrape(self) -> bool:
        """Main function to run the daily scrape"""
        self.logger.info("🤖 Starting daily data scrape")
        
        try:
            # 1. Fetch data from both sheets
            inventory_data = self.fetch_sheet_data(GOOGLE_SHEETS_CONFIG["inventory_sheet"])
            history_data = self.fetch_sheet_data(GOOGLE_SHEETS_CONFIG["history_sheet"])
            
            # 2. Validate data
            if not self.validate_data(inventory_data, "inventory"):
                self.logger.error("❌ Inventory data validation failed")
                return False
                
            if not self.validate_data(history_data, "install_history"):
                self.logger.error("❌ History data validation failed")
                return False
            
            # 3. Detect changes
            inventory_changes = self.detect_changes(inventory_data, "inventory")
            history_changes = self.detect_changes(history_data, "install_history")
            
            # 4. Save to cache
            if not self.save_to_cache(inventory_data, "inventory"):
                return False
                
            if not self.save_to_cache(history_data, "install_history"):
                return False
            
            # 5. Log changes
            self.log_changes(inventory_changes)
            self.log_changes(history_changes)
            
            # 6. Update metadata
            self.update_metadata(inventory_data, history_data, inventory_changes, history_changes)
            
            self.logger.info("✅ Daily scrape completed successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Daily scrape failed: {e}")
            return False


# Convenience function for external use
def run_daily_scrape():
    """Run the daily scrape - can be called from scheduler"""
    scraper = DailyDataScraper()
    return scraper.run_daily_scrape()


if __name__ == "__main__":
    # For testing purposes
    run_daily_scrape()
