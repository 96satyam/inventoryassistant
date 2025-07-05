import requests

# Test network access to all endpoints
base_url = "http://172.20.10.3:8003"
endpoints = ['/health', '/inventory/', '/forecast/', '/suggestions/', '/procurement/logs']

print(f"🧪 Testing {base_url}")
print("=" * 50)

for ep in endpoints:
    try:
        r = requests.get(f"{base_url}{ep}", timeout=5)
        print(f"✅ {ep}: {r.status_code}")
        if r.status_code == 200 and ep != '/health':
            data = r.json()
            if isinstance(data, list):
                print(f"   📊 {len(data)} items")
    except Exception as e:
        print(f"❌ {ep}: {e}")

print("=" * 50)
print("🎉 Network access test complete!")
