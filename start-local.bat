@echo off
echo 🚀 Starting Solar Installer AI - Local Development
echo.

REM Set local environment
set ENVIRONMENT=development
set API_HOST=127.0.0.1
set API_PORT=8003
set ALLOW_ALL_ORIGINS=false

echo 📋 Configuration:
echo   - Environment: %ENVIRONMENT%
echo   - API Host: %API_HOST%
echo   - API Port: %API_PORT%
echo   - CORS: Restricted to local origins
echo.

REM Ensure environment file exists
if not exist "backend\.env" (
    echo 📝 Creating environment file from template...
    copy "backend\.env.example" "backend\.env" >nul 2>&1
)

REM Start backend
echo 🔧 Starting backend server...
start cmd /k "cd backend && echo Backend starting on http://localhost:8003 && python main.py"

REM Wait a moment for backend to start
echo ⏳ Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start frontend
echo 🌐 Starting frontend server...
start cmd /k "cd frontend && echo Frontend starting on http://localhost:3000 && npm run dev".

echo.
echo ✅ Solar Installer AI started in LOCAL mode!
echo 📱 Frontend: http://localhost:3000
echo 🔌 Backend: http://localhost:8003
echo 📚 API Docs: http://localhost:8003/docs
echo.
echo Press any key to exit...
pause >nul
