# 🚀 Quick Start Guide - Solar Installer AI

## ⚡ **IMMEDIATE FIX FOR YOUR ERROR**

You were using the old directory structure. Here are the **correct commands**:

### ✅ **Method 1: Simple Python Command (Recommended)**
```bash
# Navigate to backend directory
cd backend

# Start the backend server
python main.py
```

### ✅ **Method 2: Using Uvicorn Directly**
```bash
# From backend directory
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8003
```

### ✅ **Method 3: From Project Root**
```bash
# From solar_installer_ai directory
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8003
```

---

## 🎯 **Complete Startup Process**

### 1. **Backend (Terminal 1)**
```bash
cd solar_installer_ai/backend
python main.py
```
**Expected Output:**
```
🚀 Starting Solar Installer API...
📍 Host: 127.0.0.1
🔌 Port: 8003
INFO:     Uvicorn running on http://127.0.0.1:8003
```

### 2. **Frontend (Terminal 2)**
```bash
cd solar_installer_ai/frontend
npm install  # First time only
npm run dev
```
**Expected Output:**
```
▲ Next.js 15.3.4
- Local:        http://localhost:3000
- Ready in 2.1s
```

---

## 🔧 **Alternative: Use Startup Scripts**

### Windows:
```bash
# From solar_installer_ai directory
start-local.bat
```

### Docker (Any OS):
```bash
# From solar_installer_ai directory
docker-compose up --build
```

---

## 📍 **Access Points**

Once both servers are running:

- **🌐 Frontend**: http://localhost:3000
- **🔧 Backend API**: http://localhost:8003
- **📚 API Documentation**: http://localhost:8003/docs
- **🔍 Health Check**: http://localhost:8003/health

---

## ❌ **What Went Wrong**

Your original command:
```bash
uvicorn apps.api_core.app.main:app --reload  # ❌ OLD STRUCTURE
```

**Issue**: The `apps/` directory was removed during our cleanup. The new structure uses:
```bash
uvicorn main:app --reload  # ✅ NEW STRUCTURE (from backend directory)
```

---

## 🆘 **Troubleshooting**

### Backend Won't Start?
```bash
# Check if you're in the right directory
pwd  # Should show: .../solar_installer_ai/backend

# Check if main.py exists
ls main.py  # Should exist

# Check Python path
python --version  # Should be 3.8+
```

### Frontend Won't Start?
```bash
# Install dependencies first
npm install

# Check Node version
node --version  # Should be 16+

# Clear cache if needed
rm -rf .next node_modules
npm install
```

### Port Already in Use?
```bash
# Kill processes on ports
# Windows:
netstat -ano | findstr :8003
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8003 | xargs kill -9
```

---

## 🎊 **You're All Set!**

The project is now running with the **new, clean, enterprise-grade structure**. 

For detailed information, see:
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system blueprint
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Developer reference
