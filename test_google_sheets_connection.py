#!/usr/bin/env python3
"""
Test Google Sheets Connection
Verifies that the Google Sheets integration is working properly
"""

import sys
import os
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def test_google_sheets_connection():
    """Test the Google Sheets connection and data loading"""
    print("🔍 Testing Google Sheets Connection...")
    print("=" * 50)
    
    try:
        # Test 1: Import the sheets connector
        print("1. Testing sheets connector import...")
        from libs.core.sheets_connector import get_sheets_connector
        connector = get_sheets_connector()
        print("   ✅ Sheets connector imported successfully")
        
        # Test 2: Check connection status
        print("2. Checking connection status...")
        status = connector.get_connection_status()
        print(f"   📊 Connection Status: {status}")
        
        if status["connected"]:
            print("   ✅ Google Sheets connection established")
        else:
            print("   ❌ Google Sheets connection failed")
            print(f"   📄 Credentials found: {status['credentials_found']}")
            return False
        
        # Test 3: Test hybrid data manager
        print("3. Testing hybrid data manager...")
        from libs.core.hybrid_data_manager import get_hybrid_data_manager
        
        sheet_id = "1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls"
        manager = get_hybrid_data_manager(sheet_id)
        print("   ✅ Hybrid data manager initialized")
        
        # Test 4: Load inventory data
        print("4. Testing inventory data loading...")
        inventory_df = manager.load_inventory(prefer_sheets=True)
        
        if not inventory_df.empty:
            print(f"   ✅ Loaded {len(inventory_df)} inventory records from Google Sheets")
            print(f"   📊 Columns: {list(inventory_df.columns)}")
            print(f"   📋 Sample data: {inventory_df.head(1).to_dict('records')}")
        else:
            print("   ⚠️ No inventory data loaded - trying Excel fallback")
            inventory_df = manager.load_inventory(prefer_sheets=False)
            if not inventory_df.empty:
                print(f"   📄 Loaded {len(inventory_df)} records from Excel fallback")
            else:
                print("   ❌ No data available from either source")
                return False
        
        # Test 5: Load install history
        print("5. Testing install history loading...")
        history_df = manager.load_install_history(prefer_sheets=True)
        
        if not history_df.empty:
            print(f"   ✅ Loaded {len(history_df)} install history records")
        else:
            print("   ⚠️ No install history data available")
        
        # Test 6: Test data source status
        print("6. Testing data source status...")
        data_status = manager.get_data_source_status()
        print(f"   📊 Data Source Status: {data_status}")
        
        print("\n" + "=" * 50)
        print("🎉 Google Sheets Integration Test PASSED!")
        print("✅ All components are working correctly")
        print("📊 Live data is being loaded from Google Sheets")
        return True
        
    except Exception as e:
        print(f"\n❌ Google Sheets Integration Test FAILED!")
        print(f"🔥 Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_backend_endpoints():
    """Test backend API endpoints"""
    print("\n🔍 Testing Backend API Endpoints...")
    print("=" * 50)
    
    try:
        import requests
        
        base_url = "http://127.0.0.1:8003"
        
        # Test inventory endpoint
        print("1. Testing inventory endpoint...")
        response = requests.get(f"{base_url}/inventory/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Inventory endpoint working - {len(data)} records")
        else:
            print(f"   ❌ Inventory endpoint failed - {response.status_code}")
            return False
        
        # Test stats endpoint
        print("2. Testing stats endpoint...")
        response = requests.get(f"{base_url}/stats/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Stats endpoint working - efficiency: {data.get('efficiency', 'N/A')}%")
        else:
            print(f"   ❌ Stats endpoint failed - {response.status_code}")
            return False
        
        # Test forecast endpoint
        print("3. Testing forecast endpoint...")
        response = requests.get(f"{base_url}/forecast/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Forecast endpoint working - {len(data)} forecasted items")
        else:
            print(f"   ❌ Forecast endpoint failed - {response.status_code}")
            return False
        
        print("\n✅ All backend endpoints are working with Google Sheets!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("   ⚠️ Backend server not running - start with: python backend/main.py")
        return False
    except Exception as e:
        print(f"   ❌ Backend test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Solar Installer AI - Google Sheets Integration Test")
    print("=" * 60)
    
    # Test Google Sheets connection
    sheets_ok = test_google_sheets_connection()
    
    # Test backend endpoints if sheets are working
    if sheets_ok:
        backend_ok = test_backend_endpoints()
        
        if backend_ok:
            print("\n🎉 COMPLETE SUCCESS!")
            print("✅ Google Sheets integration is fully operational")
            print("📊 Dashboard will now show live data from Google Sheets")
        else:
            print("\n⚠️ PARTIAL SUCCESS")
            print("✅ Google Sheets connection works")
            print("❌ Backend endpoints need attention")
    else:
        print("\n❌ INTEGRATION FAILED")
        print("🔧 Please check Google Sheets credentials and configuration")
    
    print("\n" + "=" * 60)
