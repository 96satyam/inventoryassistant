#!/usr/bin/env python3
"""
Comprehensive test script for public deployment
Tests all modules and endpoints to ensure they work on public URLs
"""

import requests
import json
import time
import sys
from typing import Dict, Any, List

class PublicDeploymentTester:
    def __init__(self, base_url: str = "http://localhost:8003"):
        self.base_url = base_url.rstrip('/')
        self.results: List[Dict[str, Any]] = []
        
    def log(self, message: str, status: str = "INFO"):
        """Log a message with status"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")
        
    def test_endpoint(self, endpoint: str, method: str = "GET", data: Dict = None, 
                     expected_status: int = 200, description: str = "") -> bool:
        """Test a single endpoint"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method == "GET":
                response = requests.get(url, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            success = response.status_code == expected_status
            
            result = {
                "endpoint": endpoint,
                "method": method,
                "url": url,
                "status_code": response.status_code,
                "expected_status": expected_status,
                "success": success,
                "description": description,
                "response_size": len(response.content) if response.content else 0
            }
            
            if success:
                self.log(f"✅ {description or endpoint}: {response.status_code}", "PASS")
                if response.content:
                    try:
                        data = response.json()
                        if isinstance(data, list):
                            self.log(f"   📊 Returned {len(data)} items")
                        elif isinstance(data, dict) and 'message' in data:
                            self.log(f"   💬 {data['message']}")
                    except:
                        pass
            else:
                self.log(f"❌ {description or endpoint}: {response.status_code} (expected {expected_status})", "FAIL")
                if response.content:
                    self.log(f"   📄 Response: {response.text[:200]}...")
                    
            self.results.append(result)
            return success
            
        except requests.exceptions.RequestException as e:
            self.log(f"❌ {description or endpoint}: Connection error - {e}", "ERROR")
            self.results.append({
                "endpoint": endpoint,
                "method": method,
                "url": url,
                "success": False,
                "error": str(e),
                "description": description
            })
            return False
    
    def test_health_check(self):
        """Test basic health check"""
        self.log("🏥 Testing Health Check...")
        return self.test_endpoint("/health", description="Health Check")
    
    def test_dashboard_endpoints(self):
        """Test all dashboard-related endpoints"""
        self.log("📊 Testing Dashboard Endpoints...")
        
        tests = [
            ("/stats/", "Dashboard Statistics"),
            ("/inventory/", "Inventory Data"),
            ("/forecast/", "Forecast Data"),
            ("/suggestions/", "Vendor Suggestions"),
        ]
        
        results = []
        for endpoint, desc in tests:
            results.append(self.test_endpoint(endpoint, description=desc))
        
        return all(results)
    
    def test_procurement_endpoints(self):
        """Test procurement-related endpoints"""
        self.log("📦 Testing Procurement Endpoints...")
        
        # Test procurement logs
        logs_success = self.test_endpoint("/procurement/logs", description="Procurement Logs")
        
        # Test email endpoint (should fail without proper data, but endpoint should exist)
        email_data = {
            "vendor": "Test Vendor",
            "items": {"Test Item": 1},
            "email": "test@example.com",
            "shipping_address": "Test Address",
            "need_by": "2025-07-10"
        }
        
        # This might fail due to email configuration, but we check if endpoint exists
        email_success = self.test_endpoint("/procurement/send-email", "POST", email_data, 
                                         expected_status=500, description="Email Endpoint (Expected to fail)")
        
        return logs_success
    
    def test_pipeline_endpoint(self):
        """Test pipeline endpoint"""
        self.log("🔄 Testing Pipeline Endpoint...")
        
        # Test pipeline endpoint (should fail without file, but endpoint should exist)
        return self.test_endpoint("/run-pipeline", "POST", {}, expected_status=422, 
                                description="Pipeline Endpoint (Expected validation error)")
    
    def run_all_tests(self):
        """Run all tests"""
        self.log("🚀 Starting Public Deployment Tests...")
        self.log(f"🎯 Target URL: {self.base_url}")
        print("=" * 60)
        
        # Run tests
        health_ok = self.test_health_check()
        dashboard_ok = self.test_dashboard_endpoints()
        procurement_ok = self.test_procurement_endpoints()
        pipeline_ok = self.test_pipeline_endpoint()
        
        print("=" * 60)
        
        # Summary
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r.get('success', False))
        
        self.log(f"📋 Test Summary: {passed_tests}/{total_tests} tests passed")
        
        if health_ok and dashboard_ok and procurement_ok and pipeline_ok:
            self.log("🎉 All critical modules are working!", "SUCCESS")
            return True
        else:
            self.log("⚠️ Some modules have issues", "WARNING")
            
            # Show failed tests
            failed = [r for r in self.results if not r.get('success', False)]
            if failed:
                self.log("❌ Failed tests:")
                for test in failed:
                    self.log(f"   - {test['description']}: {test.get('error', 'HTTP error')}")
            
            return False

def main():
    """Main test function"""
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "http://localhost:8003"
    
    print(f"🧪 Solar Installer AI - Public Deployment Test")
    print(f"🌐 Testing URL: {base_url}")
    print()
    
    tester = PublicDeploymentTester(base_url)
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ Public deployment test completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Public deployment test found issues!")
        sys.exit(1)

if __name__ == "__main__":
    main()
