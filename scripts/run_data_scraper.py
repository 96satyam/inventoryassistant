#!/usr/bin/env python3
"""
Data Scraper Runner
Script to run the data scraper manually or start the scheduler
"""

import sys
import argparse
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from libs.data_scraper.scraper import run_daily_scrape
from libs.data_scraper.scheduler import start_daily_scheduler, run_manual_scrape
from libs.data_scraper.data_loader import data_loader


def main():
    parser = argparse.ArgumentParser(description="Solar Installer Data Scraper")
    parser.add_argument(
        "action", 
        choices=["scrape", "schedule", "status", "test"],
        help="Action to perform"
    )
    
    args = parser.parse_args()
    
    if args.action == "scrape":
        print("🤖 Running manual data scrape...")
        success = run_daily_scrape()
        if success:
            print("✅ Scrape completed successfully")
            sys.exit(0)
        else:
            print("❌ Scrape failed")
            sys.exit(1)
            
    elif args.action == "schedule":
        print("📅 Starting daily scheduler...")
        print("Press Ctrl+C to stop")
        start_daily_scheduler()
        
    elif args.action == "status":
        print("📊 Data Status:")
        status = data_loader.get_data_status()
        for key, value in status.items():
            print(f"  {key}: {value}")
            
    elif args.action == "test":
        print("🧪 Testing data loader...")
        
        # Test inventory data
        inventory = data_loader.load_inventory_data()
        print(f"📦 Inventory: {len(inventory)} rows")
        
        # Test history data
        history = data_loader.load_install_history_data()
        print(f"📋 History: {len(history)} rows")
        
        # Test metadata
        metadata = data_loader.get_metadata()
        print(f"📊 Last scrape: {metadata.get('last_scrape', 'Never')}")
        
        # Test data freshness
        is_fresh = data_loader.is_data_fresh()
        print(f"🕐 Data fresh: {is_fresh}")


if __name__ == "__main__":
    main()
