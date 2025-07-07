@echo off
echo ========================================
echo   Restarting Frontend Development Server
echo ========================================

echo.
echo 🔄 Stopping existing frontend process...
taskkill /F /PID 20056 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 📁 Navigating to frontend directory...
cd /d "apps\web-frontend"

echo.
echo 🚀 Starting frontend development server...
echo    - Next.js configuration updated for cross-origin support
echo    - Added allowedDevOrigins for 192.168.0.58
echo    - CORS headers configured
echo.

start "Frontend Dev Server" npm run dev

echo.
echo ✅ Frontend restart initiated!
echo    - Frontend will be available at: http://localhost:3000
echo    - Backend is running at: http://localhost:8003
echo    - Cross-origin requests from 192.168.0.58 are now allowed
echo.
echo 📋 Next steps:
echo    1. Wait for frontend to fully start (usually 10-15 seconds)
echo    2. Test from public network IP: 192.168.0.58:3000
echo    3. Check browser console for any remaining errors
echo.
pause
