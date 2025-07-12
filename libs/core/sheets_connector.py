"""
Google Sheets Integration for Solar Installer AI
Provides real-time data synchronization with fallback to Excel files
"""

import gspread
import pandas as pd
import logging
import os
import time
from typing import Dict, List, Optional, Any, Callable
from pathlib import Path
from google.oauth2.service_account import Credentials
from datetime import datetime, timedelta
import threading
import json
from functools import lru_cache

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GoogleSheetsConnector:
    """
    Robust Google Sheets connector with fallback mechanisms
    Designed to work alongside existing Excel-based system
    """
    
    def __init__(self, credentials_path: str = None, sheet_id: str = None):
        self.credentials_path = credentials_path or self._find_credentials()
        self.sheet_id = sheet_id
        self.client = None
        self.spreadsheet = None
        self._last_sync = None
        self._cache = {}
        self._cache_ttl = 300  # 5 minutes cache
        self._is_connected = False
        self._callbacks = []
        
        # Initialize connection
        self._initialize_connection()
    
    def _find_credentials(self) -> Optional[str]:
        """Find Google Sheets credentials file"""
        project_root = Path(__file__).resolve().parents[2]
        possible_paths = [
            project_root / "sheets_credentials.json",
            project_root / "config" / "sheets_credentials.json",
            project_root / "credentials" / "sheets_credentials.json",
            Path.home() / "sheets_credentials.json"
        ]

        for path in possible_paths:
            if path.exists():
                logger.info(f"✅ Found credentials at: {path}")
                return str(path)

        logger.warning("⚠️ No Google Sheets credentials found - will use Excel fallback")
        return None
    
    def _initialize_connection(self) -> bool:
        """Initialize Google Sheets connection with error handling"""
        if not self.credentials_path or not os.path.exists(self.credentials_path):
            logger.warning("📄 Google Sheets credentials not found - using Excel fallback mode")
            return False
        
        try:
            # Define required scopes
            scopes = [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.readonly'
            ]
            
            # Load credentials
            credentials = Credentials.from_service_account_file(
                self.credentials_path, scopes=scopes
            )
            
            # Initialize client
            self.client = gspread.authorize(credentials)
            
            # Test connection if sheet_id is provided
            if self.sheet_id:
                self.spreadsheet = self.client.open_by_key(self.sheet_id)
                logger.info(f"✅ Connected to Google Sheet: {self.spreadsheet.title}")
            
            self._is_connected = True
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to Google Sheets: {e}")
            logger.info("📄 Falling back to Excel-based data loading")
            self._is_connected = False
            return False
    
    def is_connected(self) -> bool:
        """Check if Google Sheets connection is active"""
        return self._is_connected and self.client is not None
    
    def set_sheet_id(self, sheet_id: str) -> bool:
        """Set and connect to a specific Google Sheet"""
        self.sheet_id = sheet_id
        
        if not self.is_connected():
            return False
        
        try:
            self.spreadsheet = self.client.open_by_key(sheet_id)
            logger.info(f"✅ Connected to sheet: {self.spreadsheet.title}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to open sheet {sheet_id}: {e}")
            return False
    
    def get_worksheet_data(self, worksheet_name: str, use_cache: bool = True) -> Optional[pd.DataFrame]:
        """
        Get data from a specific worksheet with caching
        Returns None if connection fails (caller should use Excel fallback)
        """
        if not self.is_connected() or not self.spreadsheet:
            return None
        
        # Check cache first
        cache_key = f"{self.sheet_id}_{worksheet_name}"
        if use_cache and cache_key in self._cache:
            cached_data, cached_time = self._cache[cache_key]
            if datetime.now() - cached_time < timedelta(seconds=self._cache_ttl):
                logger.debug(f"📋 Using cached data for {worksheet_name}")
                return cached_data
        
        try:
            worksheet = self.spreadsheet.worksheet(worksheet_name)
            records = worksheet.get_all_records()
            
            if not records:
                logger.warning(f"⚠️ No data found in worksheet: {worksheet_name}")
                return None
            
            df = pd.DataFrame(records)
            
            # Cache the result
            self._cache[cache_key] = (df, datetime.now())
            
            logger.info(f"✅ Loaded {len(df)} rows from Google Sheets: {worksheet_name}")
            return df
            
        except Exception as e:
            logger.error(f"❌ Failed to load worksheet {worksheet_name}: {e}")
            return None
    
    def update_worksheet_data(self, worksheet_name: str, data: pd.DataFrame) -> bool:
        """Update worksheet with new data"""
        if not self.is_connected() or not self.spreadsheet:
            logger.warning("⚠️ Cannot update - not connected to Google Sheets")
            return False
        
        try:
            worksheet = self.spreadsheet.worksheet(worksheet_name)
            
            # Clear existing data
            worksheet.clear()
            
            # Update with new data
            worksheet.update([data.columns.values.tolist()] + data.values.tolist())
            
            # Clear cache for this worksheet
            cache_key = f"{self.sheet_id}_{worksheet_name}"
            if cache_key in self._cache:
                del self._cache[cache_key]
            
            logger.info(f"✅ Updated Google Sheets: {worksheet_name} with {len(data)} rows")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to update worksheet {worksheet_name}: {e}")
            return False
    
    def append_row(self, worksheet_name: str, row_data: List[Any]) -> bool:
        """Append a single row to worksheet"""
        if not self.is_connected() or not self.spreadsheet:
            return False
        
        try:
            worksheet = self.spreadsheet.worksheet(worksheet_name)
            worksheet.append_row(row_data)
            
            # Clear cache for this worksheet
            cache_key = f"{self.sheet_id}_{worksheet_name}"
            if cache_key in self._cache:
                del self._cache[cache_key]
            
            logger.debug(f"✅ Appended row to {worksheet_name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to append row to {worksheet_name}: {e}")
            return False
    
    def register_change_callback(self, callback: Callable[[str, pd.DataFrame], None]):
        """Register callback for data changes"""
        self._callbacks.append(callback)
    
    def clear_cache(self):
        """Clear all cached data"""
        self._cache.clear()
        logger.info("🗑️ Cleared Google Sheets cache")
    
    def get_connection_status(self) -> Dict[str, Any]:
        """Get detailed connection status"""
        return {
            "connected": self._is_connected,
            "credentials_found": self.credentials_path is not None,
            "sheet_id": self.sheet_id,
            "spreadsheet_title": self.spreadsheet.title if self.spreadsheet else None,
            "last_sync": self._last_sync,
            "cache_size": len(self._cache)
        }

# Global instance for singleton pattern
_sheets_connector = None

def get_sheets_connector() -> GoogleSheetsConnector:
    """Get global Google Sheets connector instance"""
    global _sheets_connector
    if _sheets_connector is None:
        _sheets_connector = GoogleSheetsConnector()
    return _sheets_connector

def initialize_sheets_integration(credentials_path: str, sheet_id: str) -> bool:
    """Initialize Google Sheets integration with specific credentials and sheet"""
    global _sheets_connector
    _sheets_connector = GoogleSheetsConnector(credentials_path, sheet_id)
    return _sheets_connector.is_connected()
