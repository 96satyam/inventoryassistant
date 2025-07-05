#!/usr/bin/env python3

import requests
import time

def test_backend():
    """Test if backend is responding"""
    
    base_url = "http://localhost:8000"
    
    endpoints_to_test = [
        "/health",
        "/inventory/",
        "/suggestions/",
        "/stats/",
    ]
    
    print("🔍 Testing backend endpoints...")
    
    for endpoint in endpoints_to_test:
        url = f"{base_url}{endpoint}"
        try:
            print(f"\n📡 Testing {url}")
            response = requests.get(url, timeout=5)
            print(f"   ✅ Status: {response.status_code}")
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        print(f"   📊 Response: List with {len(data)} items")
                    elif isinstance(data, dict):
                        print(f"   📊 Response: Dict with keys: {list(data.keys())}")
                    else:
                        print(f"   📊 Response: {type(data)}")
                except:
                    print(f"   📄 Response: {response.text[:100]}...")
            else:
                print(f"   ❌ Error: {response.text[:200]}")
                
        except requests.exceptions.Timeout:
            print(f"   ⏰ TIMEOUT: {url}")
        except requests.exceptions.ConnectionError:
            print(f"   🔌 CONNECTION ERROR: {url}")
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
    
    # Test if run-pipeline endpoint exists (without actually calling it)
    print(f"\n🔍 Testing if /run-pipeline endpoint exists...")
    try:
        # Send OPTIONS request to check if endpoint exists
        response = requests.options(f"{base_url}/run-pipeline", timeout=5)
        print(f"   📡 OPTIONS /run-pipeline: {response.status_code}")
        if response.status_code in [200, 405]:  # 405 = Method Not Allowed is OK for OPTIONS
            print("   ✅ /run-pipeline endpoint exists")
        else:
            print("   ❌ /run-pipeline endpoint may not exist")
    except Exception as e:
        print(f"   ❌ Error testing /run-pipeline: {e}")

if __name__ == "__main__":
    test_backend()
