@echo off
echo 🏠 Starting Solar Installer AI in LOCAL mode...
echo.

REM Set local environment
set ENVIRONMENT=development
set API_HOST=127.0.0.1
set API_PORT=8003
set ALLOW_ALL_ORIGINS=false
set PUBLIC_DEPLOYMENT=false
set NETWORK_DEPLOYMENT=false

echo 📋 Configuration:
echo   - Environment: %ENVIRONMENT%
echo   - API Host: %API_HOST%
echo   - API Port: %API_PORT%
echo   - CORS: Restricted to local origins
echo.

REM Copy local environment file
copy "apps\api_core\.env.local" "apps\api_core\.env" >nul 2>&1

REM Start backend
echo 🚀 Starting backend server...
cd apps\api_core
start "Solar API Backend" python start_server.py
cd ..\..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🌐 Starting frontend server...
cd apps\web-frontend
start "Solar Frontend" npm run dev
cd ..\..

echo.
echo ✅ Solar Installer AI started in LOCAL mode!
echo 📱 Frontend: http://localhost:3000
echo 🔌 Backend: http://localhost:8003
echo 📚 API Docs: http://localhost:8003/docs
echo.
echo Press any key to exit...
pause >nul
