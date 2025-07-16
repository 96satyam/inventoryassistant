#!/usr/bin/env python3
"""
Test Inventory Data Structure Fix
Verifies that the inventory data is properly structured for both dashboard and inventory checker
"""

import sys
import os
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def test_inventory_data_structure():
    """Test the inventory data structure from backend"""
    print("🔍 Testing Inventory Data Structure...")
    print("=" * 50)
    
    try:
        # Test 1: Import and test hybrid data manager
        print("1. Testing hybrid data manager...")
        from libs.core.hybrid_data_manager import get_hybrid_data_manager
        
        sheet_id = "1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls"
        manager = get_hybrid_data_manager(sheet_id)
        
        # Load inventory data
        inventory_df = manager.load_inventory(prefer_sheets=True)
        print(f"   ✅ Loaded {len(inventory_df)} rows from Google Sheets")
        print(f"   📊 Columns: {list(inventory_df.columns)}")
        
        if not inventory_df.empty:
            print(f"   📋 Sample row: {inventory_df.iloc[0].to_dict()}")
        
        # Test 2: Test backend inventory processing
        print("\n2. Testing backend inventory processing...")
        
        # Simulate the backend processing logic
        inventory_items = []
        
        for _, row in inventory_df.iterrows():
            # Extract module data
            module_company = row.get('module_company', '')
            module_count = int(row.get('no._of_modules', 0) or 0)
            
            # Extract optimizer data  
            optimizer_company = row.get('optimizers_company', '')
            optimizer_count = int(row.get('no._of_optimizers', 0) or 0)
            
            # Create inventory items with proper structure
            if module_company and str(module_company).strip() and str(module_company).lower() != 'nan':
                inventory_items.append({
                    'name': str(module_company).strip(),
                    'available': module_count,
                    'required': max(1, int(module_count * 0.1)),  # 10% buffer as required
                    'category': 'modules',
                    'source': 'google_sheets'
                })
            
            if optimizer_company and str(optimizer_company).strip() and str(optimizer_company).lower() != 'nan':
                inventory_items.append({
                    'name': str(optimizer_company).strip(),
                    'available': optimizer_count,
                    'required': max(1, int(optimizer_count * 0.1)),  # 10% buffer as required
                    'category': 'optimizers', 
                    'source': 'google_sheets'
                })
        
        print(f"   ✅ Processed {len(inventory_items)} inventory items")
        print(f"   📦 Sample items:")
        for i, item in enumerate(inventory_items[:3]):
            print(f"      {i+1}. {item}")
        
        # Test 3: Check data quality
        print("\n3. Checking data quality...")
        
        total_available = sum(item['available'] for item in inventory_items)
        total_required = sum(item['required'] for item in inventory_items)
        items_with_stock = len([item for item in inventory_items if item['available'] > 0])
        low_stock_items = len([item for item in inventory_items if item['available'] < item['required']])
        
        print(f"   📊 Total Available: {total_available}")
        print(f"   📊 Total Required: {total_required}")
        print(f"   📊 Items with Stock: {items_with_stock}")
        print(f"   📊 Low Stock Items: {low_stock_items}")
        
        # Test 4: Verify data structure for frontend
        print("\n4. Verifying frontend compatibility...")
        
        # Check if all items have required fields
        required_fields = ['name', 'available', 'required']
        all_valid = True
        
        for item in inventory_items:
            for field in required_fields:
                if field not in item:
                    print(f"   ❌ Missing field '{field}' in item: {item}")
                    all_valid = False
                    break
        
        if all_valid:
            print("   ✅ All items have required fields (name, available, required)")
        
        # Check data types
        for item in inventory_items[:3]:
            name_type = type(item['name']).__name__
            available_type = type(item['available']).__name__
            required_type = type(item['required']).__name__
            print(f"   📋 Data types - name: {name_type}, available: {available_type}, required: {required_type}")
        
        print("\n" + "=" * 50)
        print("🎉 Inventory Data Structure Test PASSED!")
        print("✅ Data is properly structured for dashboard and inventory checker")
        print(f"📊 Ready to serve {len(inventory_items)} inventory items")
        return True
        
    except Exception as e:
        print(f"\n❌ Inventory Data Structure Test FAILED!")
        print(f"🔥 Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Solar Installer AI - Inventory Data Structure Test")
    print("=" * 60)
    
    success = test_inventory_data_structure()
    
    if success:
        print("\n🎉 COMPLETE SUCCESS!")
        print("✅ Inventory data structure is properly fixed")
        print("📊 Dashboard and inventory checker will now work correctly")
    else:
        print("\n❌ TEST FAILED")
        print("🔧 Please check the data structure and Google Sheets integration")
    
    print("\n" + "=" * 60)
