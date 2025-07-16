"""
Data Scraper Configuration
Professional configuration management for the daily data scraper
"""

import os
from pathlib import Path

# Project root directory
PROJECT_ROOT = Path(__file__).parent.parent.parent

# Data directories
DATA_DIR = PROJECT_ROOT / "data"
CACHE_DIR = DATA_DIR / "cache"
LOGS_DIR = DATA_DIR / "logs"

# Ensure directories exist
CACHE_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Google Sheets Configuration
GOOGLE_SHEETS_CONFIG = {
    "spreadsheet_id": "1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls",
    "inventory_sheet": "Sheet1",
    "history_sheet": "Sheet2",
    "credentials_file": PROJECT_ROOT / "backend" / "sheets_credentials.json"
}

# Cache file paths
CACHE_FILES = {
    "inventory": CACHE_DIR / "inventory.csv",
    "install_history": CACHE_DIR / "install_history.csv",
    "metadata": CACHE_DIR / "metadata.json"
}

# Log file paths
LOG_FILES = {
    "scraper": LOGS_DIR / "scraper.log",
    "changes": LOGS_DIR / "changes.json",
    "errors": LOGS_DIR / "errors.log"
}

# Scraper settings
SCRAPER_CONFIG = {
    "schedule_time": "09:00",  # Daily execution time
    "max_retries": 3,
    "timeout_seconds": 30,
    "change_detection": True,
    "backup_old_files": True
}

# Data validation settings
VALIDATION_CONFIG = {
    "required_inventory_columns": [
        "Module Company", "No. Of Modules", "No. of Optimizers"
    ],
    "required_history_columns": [
        "Date", "Customer", "Location"
    ],
    "min_rows_threshold": 1,
    "max_rows_threshold": 10000
}
