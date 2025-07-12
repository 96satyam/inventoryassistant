@echo off
echo 🌍 Starting Solar Installer AI in PUBLIC mode...
echo.

REM Set public environment
set ENVIRONMENT=production
set API_HOST=0.0.0.0
set API_PORT=8003
set ALLOW_ALL_ORIGINS=true
set PUBLIC_DEPLOYMENT=true
set NETWORK_DEPLOYMENT=true

echo 📋 Configuration:
echo   - Environment: %ENVIRONMENT%
echo   - API Host: %API_HOST% (all interfaces)
echo   - API Port: %API_PORT%
echo   - CORS: All origins allowed
echo.

REM Copy public environment file
copy "apps\api_core\.env.public" "apps\api_core\.env" >nul 2>&1

REM Start backend
echo 🚀 Starting backend server...
cd backend
start "Solar API Backend (Public)" python start_server.py
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🌐 Starting frontend server...
cd frontend
start "Solar Frontend (Public)" npm run dev
cd ..

echo.
echo ✅ Solar Installer AI started in PUBLIC mode!
echo 📱 Frontend: http://localhost:3000 (and network accessible)
echo 🔌 Backend: http://0.0.0.0:8003 (all interfaces)
echo 📚 API Docs: http://localhost:8003/docs
echo.
echo 🔒 Security Note: All CORS origins are allowed in public mode
echo 🌐 The application is now accessible from any network interface
echo.
echo Press any key to exit...
pause >nul
