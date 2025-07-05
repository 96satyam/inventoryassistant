#!/usr/bin/env python3

import requests
import os
from pathlib import Path

def test_pipeline_endpoint():
    """Test the /run-pipeline endpoint"""
    
    # Create a simple test PDF file (or use an existing one)
    test_pdf_path = Path("../../data/Planset-3.pdf")
    
    if not test_pdf_path.exists():
        print(f"❌ Test PDF not found at {test_pdf_path}")
        print("Available files in data directory:")
        data_dir = Path("../../data")
        if data_dir.exists():
            for file in data_dir.iterdir():
                print(f"  - {file.name}")
        return
    
    print(f"✅ Found test PDF: {test_pdf_path}")
    
    # Test the endpoint
    url = "http://localhost:8000/run-pipeline"
    
    try:
        print(f"🚀 Testing POST {url}")
        
        with open(test_pdf_path, 'rb') as f:
            files = {'file': ('test.pdf', f, 'application/pdf')}
            response = requests.post(url, files=files, timeout=30)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: Pipeline endpoint working!")
            result = response.json()
            print(f"📋 Result keys: {list(result.keys())}")
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network Error: {e}")
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")

if __name__ == "__main__":
    test_pipeline_endpoint()
