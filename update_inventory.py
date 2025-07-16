#!/usr/bin/env python3
"""
Script to update the inventory Excel file with real data
"""

import pandas as pd
import os
from pathlib import Path

def update_inventory_excel():
    """Update the inventory Excel file with real data"""
    
    # Get the project root directory
    project_root = Path(__file__).parent
    data_dir = project_root / "data"
    
    # Read the CSV file with real inventory data
    csv_file = data_dir / "inventory_data.csv"
    excel_file = data_dir / "Inventry.xlsx"
    
    print(f"📊 Reading inventory data from: {csv_file}")
    
    # Read CSV data
    df = pd.read_csv(csv_file)
    
    print(f"✅ Loaded {len(df)} inventory rows")
    print("📋 Columns:", list(df.columns))
    print("\n📦 Sample data:")
    print(df.head(3).to_string())
    
    # Save to Excel
    print(f"\n💾 Saving to Excel file: {excel_file}")
    df.to_excel(excel_file, index=False, sheet_name="Sheet1")
    
    print("✅ Successfully updated inventory Excel file!")
    
    # Verify the data
    print("\n🔍 Verifying Excel file...")
    df_verify = pd.read_excel(excel_file)
    print(f"✅ Verified: {len(df_verify)} rows in Excel file")
    
    return df

if __name__ == "__main__":
    update_inventory_excel()
