#!/usr/bin/env python3

import requests
from pathlib import Path

def test_temp_pipeline():
    """Test the temporary pipeline endpoint"""
    
    # Create a dummy file for testing
    test_content = b"dummy PDF content"
    
    url = "http://localhost:8003/run-pipeline"
    
    try:
        print(f"🚀 Testing POST {url}")
        
        files = {'file': ('test.pdf', test_content, 'application/pdf')}
        response = requests.post(url, files=files, timeout=10)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: Endpoint responding!")
            result = response.json()
            print(f"📋 Response: {result}")
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_temp_pipeline()
