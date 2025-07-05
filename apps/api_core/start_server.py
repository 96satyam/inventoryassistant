#!/usr/bin/env python3
"""
Enhanced server startup script for Solar Installer API
Supports both local and public deployment with proper host binding
"""

import os
import sys
import uvicorn
from pathlib import Path

def get_host_config():
    """Determine the appropriate host configuration"""
    # Check for explicit host override
    host_override = os.getenv("API_HOST")
    if host_override:
        return host_override
    
    # Check for public deployment flag
    if os.getenv("PUBLIC_DEPLOYMENT", "false").lower() == "true":
        return "0.0.0.0"  # Bind to all interfaces for public access
    
    # Check for network deployment flag
    if os.getenv("NETWORK_DEPLOYMENT", "false").lower() == "true":
        return "0.0.0.0"  # Bind to all interfaces for network access
    
    # Default to localhost for local development
    return "127.0.0.1"

def get_port_config():
    """Determine the appropriate port configuration"""
    return int(os.getenv("API_PORT", "8003"))

def main():
    """Start the FastAPI server with appropriate configuration"""
    
    # Set working directory to api_core
    api_core_dir = Path(__file__).parent
    os.chdir(api_core_dir)
    
    # Add the parent directory to Python path for imports
    sys.path.insert(0, str(api_core_dir.parent.parent))
    
    # Get configuration
    host = get_host_config()
    port = get_port_config()
    
    print(f"🚀 Starting Solar Installer API...")
    print(f"📍 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"🌐 Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"🔒 CORS: {'All origins' if os.getenv('ALLOW_ALL_ORIGINS', 'false').lower() == 'true' else 'Restricted'}")
    
    # Import and start the app
    try:
        from app.main import app
        
        # Configure uvicorn
        config = uvicorn.Config(
            app=app,
            host=host,
            port=port,
            reload=os.getenv("ENVIRONMENT", "development") == "development",
            log_level="info",
            access_log=True,
        )
        
        server = uvicorn.Server(config)
        server.run()
        
    except ImportError as e:
        print(f"❌ Failed to import app: {e}")
        print("💡 Make sure you're in the correct directory and dependencies are installed")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
