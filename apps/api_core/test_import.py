#!/usr/bin/env python3

try:
    print("Testing app import...")
    from app.main import app
    print("✅ SUCCESS: App imported successfully")
    
    print("Testing pipeline import...")
    from app.pipeline import run_pipeline_from_pdf
    print("✅ SUCCESS: Pipeline imported successfully")
    
    print("Testing uvicorn...")
    import uvicorn
    print("✅ SUCCESS: Uvicorn imported successfully")
    
    print("\n🚀 Starting server...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
