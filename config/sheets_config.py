"""
Google Sheets Configuration for Solar Installer AI
Centralized configuration for Google Sheets integration
"""

import os
from pathlib import Path
from typing import Dict, Optional

# Default Google Sheets configuration
DEFAULT_SHEET_ID = "1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls"  # Your Google Sheet ID

# Worksheet mapping - maps Excel files to Google Sheets worksheets
WORKSHEET_MAPPING = {
    "Inventry.xlsx": "Sheet1",           # Your inventory data
    "install_history.xlsx": "Sheet2",    # Your install history data
    "procurement_log.json": "ProcurementLog",  # Will be created if needed
    "vendor_data.json": "VendorData"     # Will be created if needed
}

# Sync settings
SYNC_SETTINGS = {
    "enable_background_sync": True,
    "sync_interval_seconds": 300,  # 5 minutes
    "prefer_sheets_over_excel": True,
    "auto_create_worksheets": True,
    "cache_ttl_seconds": 300  # 5 minutes
}

# Column mappings for data normalization
COLUMN_MAPPINGS = {
    "Inventory": {
        # Map Google Sheets columns to expected Excel columns
        "Module Company": "module_company",
        "No. Of Modules": "no._of_modules", 
        "Optimizers Company": "optimizers_company",
        "No. of Optimizers": "no._of_optimizers",
        "Inverter Company": "inverter_company",
        "Inverter Qty": "inverter_qty",
        "Battery Company": "battery_company", 
        "Battery Qty": "battery_qty",
        "Rails": "rails",
        "Clamps": "clamps",
        "Disconnects": "disconnects",
        "Conduits": "conduits"
    }
}

def get_sheet_id() -> Optional[str]:
    """Get Google Sheet ID from environment or config"""
    # Try environment variable first
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    if sheet_id:
        return sheet_id
    
    # Try config file
    config_file = Path(__file__).parent / "sheets_id.txt"
    if config_file.exists():
        try:
            return config_file.read_text().strip()
        except Exception:
            pass
    
    return DEFAULT_SHEET_ID

def set_sheet_id(sheet_id: str) -> bool:
    """Save Google Sheet ID to config file"""
    try:
        config_file = Path(__file__).parent / "sheets_id.txt"
        config_file.write_text(sheet_id.strip())
        return True
    except Exception as e:
        print(f"Failed to save sheet ID: {e}")
        return False

def get_credentials_path() -> Optional[str]:
    """Get path to Google Sheets credentials"""
    project_root = Path(__file__).resolve().parents[1]
    
    possible_paths = [
        project_root / "sheets_credentials.json",
        project_root / "config" / "sheets_credentials.json",
        project_root / "credentials" / "sheets_credentials.json"
    ]
    
    for path in possible_paths:
        if path.exists():
            return str(path)
    
    return None

def validate_configuration() -> Dict[str, bool]:
    """Validate Google Sheets configuration"""
    return {
        "credentials_found": get_credentials_path() is not None,
        "sheet_id_configured": get_sheet_id() is not None,
        "config_file_writable": Path(__file__).parent.exists()
    }

# Export configuration
__all__ = [
    'DEFAULT_SHEET_ID',
    'WORKSHEET_MAPPING', 
    'SYNC_SETTINGS',
    'COLUMN_MAPPINGS',
    'get_sheet_id',
    'set_sheet_id', 
    'get_credentials_path',
    'validate_configuration'
]
