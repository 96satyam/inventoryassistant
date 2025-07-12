# 🚀 Solar Installer AI - Deployment Guide

> **Complete deployment guide for local development and production environments**

## 📋 Prerequisites

### System Requirements
- **Docker**: 20.0+ and Docker Compose 2.0+
- **Node.js**: 18+ (for local development)
- **Python**: 3.11+ (for local development)
- **Memory**: 4GB+ RAM available
- **Storage**: 10GB+ disk space

### Required Credentials
- **Google Sheets API**: Service account JSON file
- **Gmail SMTP**: App password for email functionality
- **OpenAI API**: API key for AI features (optional)

---

## 🏠 Local Development

### 1. Quick Start
```bash
# Clone repository
git clone <repository-url>
cd solar_installer_ai

# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Edit environment files with your credentials
# backend/.env - Update email and API credentials
# frontend/.env.local - Update API URL if needed

# Start services
# Terminal 1: Backend
cd backend && python main.py

# Terminal 2: Frontend  
cd frontend && npm run dev
```

### 2. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8003
- **API Documentation**: http://localhost:8003/docs

---

## 🐳 Docker Deployment

### 1. Environment Setup
```bash
# Copy and configure environment files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Edit backend/.env with production values:
ENVIRONMENT=production
API_HOST=0.0.0.0
ALLOW_ALL_ORIGINS=true
MAIL_USER=your-production-email@gmail.com
MAIL_PASS=your-production-app-password
```

### 2. Build and Deploy
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Production with Nginx
```bash
# Start with nginx reverse proxy
docker-compose --profile production up -d --build
```

---

## 🌐 Production Deployment

### 1. Server Setup
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Application Deployment
```bash
# Clone repository
git clone <repository-url>
cd solar_installer_ai

# Setup production environment
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Configure production settings in backend/.env:
ENVIRONMENT=production
API_HOST=0.0.0.0
API_PORT=8003
ALLOW_ALL_ORIGINS=true

# Add your credentials
MAIL_USER=production-email@company.com
MAIL_PASS=production-app-password
OPENAI_API_KEY=production-openai-key

# Deploy with Docker Compose
docker-compose up -d --build
```

### 3. SSL/HTTPS Setup
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Required
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password
ENVIRONMENT=production
API_HOST=0.0.0.0
API_PORT=8003

# Optional
OPENAI_API_KEY=your-openai-key
AUTH_USERNAME=admin
AUTH_PASSWORD=secure-password
```

#### Frontend (.env.local)
```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:8003

# Optional
NEXT_PUBLIC_COMPANY_NAME=WattMonk
NEXT_PUBLIC_APP_NAME=Solar Installer AI
```

### Google Sheets Setup
1. Create Google Cloud project
2. Enable Google Sheets API
3. Create service account
4. Download JSON credentials
5. Place at `backend/sheets_credentials.json`
6. Share sheets with service account email

---

## 🔍 Monitoring & Maintenance

### Health Checks
```bash
# Check service status
curl http://localhost:8003/health
curl http://localhost:3000/api/health

# View Docker logs
docker-compose logs backend
docker-compose logs frontend
```

### Backup Strategy
```bash
# Backup data directory
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Backup environment files
cp backend/.env backup/.env.backend
cp frontend/.env.local backup/.env.frontend
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
- Set `ALLOW_ALL_ORIGINS=true` in backend/.env
- Check frontend API URL configuration

#### Email Not Sending
- Verify Gmail app password
- Check SMTP settings in backend/.env
- Review backend logs for email errors

#### Google Sheets Connection
- Verify service account permissions
- Check credentials file path
- Ensure sheets are shared with service account

#### Docker Issues
- Check Docker daemon status: `sudo systemctl status docker`
- Verify port availability: `netstat -tulpn | grep :3000`
- Clean Docker cache: `docker system prune -a`

### Log Locations
- **Backend logs**: `docker-compose logs backend`
- **Frontend logs**: `docker-compose logs frontend`
- **Nginx logs**: `docker-compose logs nginx`

---

## 🎯 Performance Optimization

### Production Optimizations
- Enable Docker multi-stage builds
- Use nginx for static file serving
- Implement Redis caching
- Configure log rotation
- Set up monitoring with Prometheus/Grafana

### Scaling Considerations
- Use Docker Swarm or Kubernetes
- Implement load balancing
- Add database clustering
- Configure CDN for static assets

This deployment guide ensures your Solar Installer AI application runs reliably in any environment.
