# Public URL Deployment Guide

## Issue Description
When accessing the Solar Installer AI application from a public URL (e.g., `192.168.0.58:3000`), the forecast data fails to load and shows "Couldn't load forecast data - using mock data" because the backend is only configured for local access.

## Root Cause
The backend server is started with `host=127.0.0.1` (localhost only) by default, which means it's not accessible from other network interfaces. When users access the application from a public IP, the frontend tries to connect to `192.168.0.58:8003` but the backend is only listening on `127.0.0.1:8003`.

## Solution

### Quick Fix (Recommended)
1. **Stop the current backend server** (if running)
2. **Run the public deployment script:**
   ```bash
   start-public.bat
   ```
3. **Refresh the browser page**

### Manual Configuration
If you prefer manual configuration:

1. **Set environment variables:**
   ```bash
   set ENVIRONMENT=production
   set API_HOST=0.0.0.0
   set API_PORT=8003
   set ALLOW_ALL_ORIGINS=true
   set PUBLIC_DEPLOYMENT=true
   ```

2. **Start the backend:**
   ```bash
   cd apps/api_core
   python start_server.py
   ```

## What the Fix Does

### Backend Changes
- **Host Binding**: Changes from `127.0.0.1` to `0.0.0.0` (all interfaces)
- **CORS Policy**: Allows all origins for public access
- **Environment**: Sets production mode for optimal performance

### Frontend Enhancements
- **Automatic Fallback**: If public API fails, tries localhost as fallback
- **User Notification**: Shows helpful popup with instructions when public URL issues are detected
- **Smart Detection**: Automatically detects public URL vs localhost access

## Verification

### Check Backend Accessibility
```bash
# Should show connections on all interfaces (0.0.0.0:8003)
netstat -an | findstr :8003
```

### Test API Endpoints
- **Local**: http://localhost:8003/health
- **Public**: http://192.168.0.58:8003/health

### Frontend Access
- **Local**: http://localhost:3000
- **Public**: http://192.168.0.58:3000

## Troubleshooting

### Backend Not Starting
- Check if port 8003 is already in use
- Verify Python dependencies are installed
- Check console output for error messages

### CORS Errors
- Ensure `ALLOW_ALL_ORIGINS=true` is set
- Verify backend is running in public mode
- Check browser console for specific CORS errors

### Data Still Not Loading
1. Verify backend health endpoint responds
2. Check browser network tab for failed requests
3. Look for firewall blocking port 8003
4. Ensure both frontend and backend are using same network interface

## Security Notes

⚠️ **Important**: Public deployment allows all CORS origins for accessibility. In production environments, consider:
- Restricting CORS origins to specific domains
- Using HTTPS instead of HTTP
- Implementing proper authentication and authorization
- Setting up firewall rules for port access

## Files Modified

### Backend Configuration
- `apps/api_core/start_server.py` - Enhanced host binding logic
- `apps/api_core/app/main.py` - CORS configuration
- `start-public.bat` - Public deployment script

### Frontend Enhancements
- `src/lib/api-config.ts` - Automatic fallback logic
- `src/components/forecast/forecast-table.tsx` - Public URL detection
- `src/components/ui/public-url-notice.tsx` - User notification component

## Support

If you continue to experience issues:
1. Check the browser console for error messages
2. Verify network connectivity between frontend and backend
3. Ensure no firewall is blocking the connection
4. Contact support with specific error messages and network configuration details
