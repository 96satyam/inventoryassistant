"""
Unified Data Loader
Professional data loading system that all application modules use
"""

import pandas as pd
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Union

from .config import CACHE_FILES, LOG_FILES


class UnifiedDataLoader:
    """
    Unified data loader that provides consistent data access for all modules
    All dashboard, inventory, forecast, and other modules should use this loader
    """
    
    def __init__(self):
        self.setup_logging()
        self._cache = {}  # In-memory cache for performance
        
    def setup_logging(self):
        """Configure logging"""
        self.logger = logging.getLogger(__name__)
        
    def _load_csv_file(self, file_path: Path, data_type: str) -> pd.DataFrame:
        """Load CSV file with error handling"""
        try:
            if file_path.exists():
                df = pd.read_csv(file_path)
                self.logger.info(f"📊 Loaded {len(df)} rows from {data_type} cache")
                return df
            else:
                self.logger.warning(f"⚠️ No cached {data_type} data found at {file_path}")
                return pd.DataFrame()
                
        except Exception as e:
            self.logger.error(f"❌ Error loading {data_type} cache: {e}")
            return pd.DataFrame()
    
    def load_inventory_data(self, use_cache: bool = True) -> pd.DataFrame:
        """
        Load inventory data from cached CSV
        
        Args:
            use_cache: Whether to use in-memory cache for performance
            
        Returns:
            DataFrame with inventory data
        """
        cache_key = "inventory"
        
        # Check in-memory cache first
        if use_cache and cache_key in self._cache:
            self.logger.debug("📋 Using cached inventory data")
            return self._cache[cache_key].copy()
        
        # Load from CSV file
        df = self._load_csv_file(CACHE_FILES["inventory"], "inventory")
        
        # Store in memory cache
        if use_cache and not df.empty:
            self._cache[cache_key] = df.copy()
            
        return df
    
    def load_install_history_data(self, use_cache: bool = True) -> pd.DataFrame:
        """
        Load install history data from cached CSV
        
        Args:
            use_cache: Whether to use in-memory cache for performance
            
        Returns:
            DataFrame with install history data
        """
        cache_key = "install_history"
        
        # Check in-memory cache first
        if use_cache and cache_key in self._cache:
            self.logger.debug("📋 Using cached install history data")
            return self._cache[cache_key].copy()
        
        # Load from CSV file
        df = self._load_csv_file(CACHE_FILES["install_history"], "install_history")
        
        # Store in memory cache
        if use_cache and not df.empty:
            self._cache[cache_key] = df.copy()
            
        return df
    
    def get_metadata(self) -> Dict:
        """Get metadata about the cached data"""
        try:
            if CACHE_FILES["metadata"].exists():
                with open(CACHE_FILES["metadata"], 'r') as f:
                    metadata = json.load(f)
                return metadata
            else:
                return {
                    "last_scrape": "Never",
                    "scrape_status": "No data",
                    "data_summary": {"inventory_rows": 0, "history_rows": 0}
                }
        except Exception as e:
            self.logger.error(f"❌ Error loading metadata: {e}")
            return {"error": str(e)}
    
    def is_data_fresh(self, max_age_hours: int = 25) -> bool:
        """
        Check if cached data is fresh enough
        
        Args:
            max_age_hours: Maximum age in hours before data is considered stale
            
        Returns:
            True if data is fresh, False if stale or missing
        """
        metadata = self.get_metadata()
        
        if "last_scrape" not in metadata or metadata["last_scrape"] == "Never":
            return False
            
        try:
            last_scrape = datetime.fromisoformat(metadata["last_scrape"])
            age_hours = (datetime.now() - last_scrape).total_seconds() / 3600
            
            is_fresh = age_hours < max_age_hours
            if not is_fresh:
                self.logger.warning(f"⚠️ Data is {age_hours:.1f} hours old (max: {max_age_hours})")
            
            return is_fresh
            
        except Exception as e:
            self.logger.error(f"❌ Error checking data freshness: {e}")
            return False
    
    def get_data_status(self) -> Dict:
        """Get comprehensive status of cached data"""
        metadata = self.get_metadata()
        inventory_df = self.load_inventory_data()
        history_df = self.load_install_history_data()
        
        status = {
            "timestamp": datetime.now().isoformat(),
            "data_available": {
                "inventory": not inventory_df.empty,
                "install_history": not history_df.empty
            },
            "row_counts": {
                "inventory": len(inventory_df),
                "install_history": len(history_df),
                "total": len(inventory_df) + len(history_df)
            },
            "last_update": metadata.get("last_scrape", "Never"),
            "is_fresh": self.is_data_fresh(),
            "cache_files_exist": {
                "inventory": CACHE_FILES["inventory"].exists(),
                "install_history": CACHE_FILES["install_history"].exists(),
                "metadata": CACHE_FILES["metadata"].exists()
            }
        }
        
        return status
    
    def get_recent_changes(self, limit: int = 10) -> List[Dict]:
        """Get recent data changes from the change log"""
        try:
            if LOG_FILES["changes"].exists():
                with open(LOG_FILES["changes"], 'r') as f:
                    changes_log = json.load(f)
                
                # Return most recent changes
                return changes_log[-limit:] if changes_log else []
            else:
                return []
                
        except Exception as e:
            self.logger.error(f"❌ Error loading changes log: {e}")
            return []
    
    def clear_cache(self):
        """Clear in-memory cache to force reload from files"""
        self._cache.clear()
        self.logger.info("🗑️ Cleared in-memory cache")
    
    def get_inventory_for_dashboard(self) -> List[Dict]:
        """
        Get inventory data formatted for dashboard use
        
        Returns:
            List of dictionaries with standardized inventory format
        """
        df = self.load_inventory_data()
        
        if df.empty:
            return []
        
        # Standardize column names and format data
        inventory_list = []
        for _, row in df.iterrows():
            # Handle different possible column names from Google Sheets
            name = (
                row.get('Module Company') or 
                row.get('module_company') or 
                row.get('name') or 
                'Unknown Item'
            )
            
            available = (
                row.get('No. Of Modules') or 
                row.get('no_of_modules') or 
                row.get('available') or 
                0
            )
            
            required = (
                row.get('No. of Optimizers') or 
                row.get('no_of_optimizers') or 
                row.get('required') or 
                0
            )
            
            inventory_list.append({
                'name': str(name).strip(),
                'available': int(available) if str(available).isdigit() else 0,
                'required': int(required) if str(required).isdigit() else 0,
                'category': 'modules',  # Default category
                'source': 'cached_data'
            })
        
        return inventory_list
    
    def get_install_history_for_dashboard(self) -> List[Dict]:
        """
        Get install history data formatted for dashboard use
        
        Returns:
            List of dictionaries with standardized history format
        """
        df = self.load_install_history_data()
        
        if df.empty:
            return []
        
        # Convert to list of dictionaries
        history_list = []
        for _, row in df.iterrows():
            history_list.append({
                'date': row.get('Date', ''),
                'customer': row.get('Customer', ''),
                'location': row.get('Location', ''),
                'status': row.get('Status', 'Completed'),
                'source': 'cached_data'
            })
        
        return history_list


# Global instance for all modules to use
data_loader = UnifiedDataLoader()


# Convenience functions for backward compatibility
def load_inventory_data() -> pd.DataFrame:
    """Load inventory data - convenience function"""
    return data_loader.load_inventory_data()


def load_install_history_data() -> pd.DataFrame:
    """Load install history data - convenience function"""
    return data_loader.load_install_history_data()


def get_data_status() -> Dict:
    """Get data status - convenience function"""
    return data_loader.get_data_status()


def is_data_fresh() -> bool:
    """Check if data is fresh - convenience function"""
    return data_loader.is_data_fresh()
