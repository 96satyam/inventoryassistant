# 🌞 Solar Installer AI - Intelligent Inventory Management System

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black.svg)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0+-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**A professional-grade, AI-powered inventory management and procurement automation system specifically designed for solar installation companies.** This enterprise-ready platform combines real-time inventory tracking, intelligent demand forecasting, automated document processing, and seamless procurement workflows to streamline solar installation operations.

## ✨ Key Features

### 🎯 **Intelligent Document Processing**
- **AI-Powered PDF Analysis**: Automatically extract equipment specifications from solar plansets
- **Smart Equipment Recognition**: Identify modules, inverters, optimizers, and components using OpenAI GPT
- **LangGraph Pipeline**: Advanced workflow orchestration for complex document processing
- **Real-time Processing**: Instant analysis with progress tracking and error handling

### 📊 **Real-Time Inventory Management**
- **Live Dashboard**: Interactive KPIs with real-time stock levels and procurement status
- **Google Sheets Integration**: Seamless sync with existing spreadsheets for live data updates
- **Smart Alerts**: Automated shortage notifications with customizable timing
- **Multi-View Support**: Toggle between row/column layouts with expandable item lists

### 🤖 **AI-Driven Forecasting**
- **Demand Prediction**: Machine learning algorithms analyze historical patterns
- **Shortage Prevention**: Proactive identification of potential stock shortfalls
- **Seasonal Analysis**: Recognize trends and seasonal demand variations
- **Top Priority Items**: Highlight critical components requiring immediate attention

### 🛒 **Automated Procurement Workflows**
- **Smart Vendor Matching**: AI-powered vendor recommendations based on equipment type
- **Professional Email Templates**: WattMonk-branded purchase orders with company details
- **Multi-Recipient Support**: Send orders to multiple vendors simultaneously
- **Order Tracking**: Complete procurement history with delivery status monitoring

### 🌐 **Modern Web Interface**
- **Responsive Design**: Professional UI optimized for desktop and mobile devices
- **Dark/Light Themes**: Automatic color adaptation with user preference persistence
- **Interactive Charts**: Real-time data visualization with hover details and export options
- **Professional Branding**: Clean, engaging interface designed for solar industry professionals

### 🔗 **Enterprise Integration**
- **Google Sheets API**: Real-time bidirectional sync with existing workflows
- **Email Automation**: SMTP integration for automated communications
- **Export Capabilities**: CSV export functionality across all data modules
- **Session Management**: Secure authentication with per-session login requirements

## 🏗️ System Architecture

> **📖 For complete architectural details, see [ARCHITECTURE.md](./ARCHITECTURE.md)**

**Enterprise-grade, microservices-inspired architecture** with clean separation of concerns and scalable design:

```
solar_installer_ai/                    # 🎯 PROJECT ROOT
├── 🌐 frontend/                       # Next.js Frontend Application
│   ├── src/app/                       # App Router Pages (Dashboard, Inventory, etc.)
│   ├── src/components/                # Reusable React Components
│   ├── src/lib/                       # API Client & Utilities
│   ├── Dockerfile                     # Production Container
│   └── package.json                   # Dependencies & Scripts
│
├── 🔧 backend/                        # FastAPI Backend Server
│   ├── main.py                        # Application Entry Point
│   ├── app/                           # Application Source Code
│   │   ├── api/v1/endpoints/          # REST API Routes
│   │   ├── agents/                    # AI Processing Agents
│   │   ├── services/                  # Business Logic Layer
│   │   ├── core/                      # Configuration & Settings
│   │   └── utils/                     # Helper Functions
│   ├── Dockerfile                     # Production Container
│   └── requirements.txt               # Python Dependencies
│
├── 🧠 libs/core/                      # Shared Business Logic
│   ├── inventory.py                   # Inventory Management
│   ├── forecast.py                    # Demand Forecasting
│   ├── sheets_connector.py            # Google Sheets Integration
│   └── graph.py                       # AI Pipeline Orchestration
│
├── 📊 data/                           # Application Data
│   ├── Inventry.xlsx                  # Inventory Database
│   ├── install_history.xlsx           # Historical Installation Data
│   └── uploads/                       # PDF Document Storage
│
├── 📚 shared/                         # Cross-Platform Resources
│   ├── types/                         # TypeScript Type Definitions
│   ├── constants/                     # Shared Configuration
│   └── schemas/                       # Data Validation Schemas
│
├── 🐳 docker-compose.yml              # Container Orchestration
├── 📖 ARCHITECTURE.md                 # Complete System Documentation
├── 🚀 DEPLOYMENT.md                   # Production Deployment Guide
└── ⚡ QUICK_START.md                  # Developer Quick Reference
```

### 🔄 **Data Flow Architecture**
```
📱 Frontend (Next.js) ↔ 🔧 Backend (FastAPI) ↔ 📊 Google Sheets (Live Data)
                              ↕
                         🤖 AI Agents ↔ 📄 Document Processing
                              ↕
                         📧 Email Service ↔ 🛒 Procurement Automation
```

### 🎯 **Core Components**
- **Frontend**: Professional React dashboard with real-time updates
- **Backend**: High-performance FastAPI server with async operations
- **AI Pipeline**: LangGraph-orchestrated document processing workflow
- **Data Layer**: Hybrid Excel/Google Sheets with real-time synchronization
- **Integration**: Email automation, vendor management, and export capabilities

## 🛠️ Technology Stack

### **🔧 Backend Technologies**
- **FastAPI 0.104+** - High-performance async Python web framework
- **LangChain & LangGraph** - Advanced AI workflow orchestration and pipeline management
- **OpenAI GPT-4** - Intelligent document processing and equipment extraction
- **Pandas 2.1+** - Professional data manipulation and analysis
- **Google Sheets API** - Real-time spreadsheet integration and synchronization
- **Uvicorn** - Lightning-fast ASGI server with auto-reload capabilities

### **🌐 Frontend Technologies**
- **Next.js 15.3.4** - Modern React framework with App Router and Turbopack
- **React 19** - Latest UI library with concurrent features and server components
- **TypeScript 5.0+** - Type-safe development with advanced type inference
- **Tailwind CSS** - Utility-first styling with responsive design system
- **SWR** - Smart data fetching with caching, revalidation, and error handling
- **Recharts** - Professional data visualization with interactive charts

### **🤖 AI & Machine Learning**
- **OpenAI API** - GPT-4 models for intelligent text processing and analysis
- **LangChain** - Comprehensive AI application development framework
- **LangGraph** - State-based workflow orchestration for complex AI pipelines
- **PyMuPDF** - Advanced PDF text extraction with OCR fallback capabilities
- **Pytesseract** - Optical character recognition for scanned documents

### **🔗 Integration & Infrastructure**
- **Google Cloud APIs** - Sheets API for real-time data synchronization
- **SMTP Integration** - Professional email automation with Gmail support
- **Docker & Docker Compose** - Containerized deployment with orchestration
- **CORS Configuration** - Secure cross-origin resource sharing
- **File Processing** - Multi-format document handling (PDF, Excel, images)

## 📋 Prerequisites

### **System Requirements**
- **Python 3.11+** (recommended for optimal performance)
- **Node.js 18+** with npm or yarn package manager
- **Git** for version control and repository management
- **4GB+ RAM** for smooth operation with AI processing
- **10GB+ disk space** for dependencies and data storage

### **Required API Keys & Credentials**
- **OpenAI API Key** - For AI-powered document processing ([Get API Key](https://platform.openai.com/api-keys))
- **Google Sheets API** - For real-time inventory synchronization ([Setup Guide](./docs/GOOGLE_SHEETS_INTEGRATION.md))
- **Gmail SMTP** - For automated email functionality (App Password required)

## 🚀 Quick Start

> **📖 For detailed setup instructions, see [QUICK_START.md](./QUICK_START.md)**

### **⚡ 1. Clone & Setup**
```bash
# Clone the repository
git clone https://github.com/96satyam/inventoryassistant.git
cd solar_installer_ai

# Setup backend environment
cd backend
cp .env.example .env
# Edit .env with your API keys and configuration

# Setup frontend environment
cd ../frontend
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

### **⚡ 2. Install Dependencies**
```bash
# Backend dependencies
cd backend
pip install -r requirements.txt

# Frontend dependencies
cd ../frontend
npm install
```

### **⚡ 3. Start the Application**
```bash
# Terminal 1: Start Backend Server
cd backend
python main.py

# Terminal 2: Start Frontend Server (new terminal)
cd frontend
npm run dev
```

### **⚡ 4. Access Your Application**
- **🌐 Frontend Dashboard**: http://localhost:3000
- **🔧 Backend API**: http://127.0.0.1:8003
- **📚 API Documentation**: http://127.0.0.1:8003/docs
- **🔍 Health Check**: http://127.0.0.1:8003/

## 📖 User Guide

### **🏠 Dashboard Overview**
**Professional KPI monitoring with real-time insights**
- **Interactive Metrics**: Click Total SKUs, Healthy Stock, Low Stock cards for filtered views
- **Live Data Indicators**: Auto-refresh timers with countdown displays
- **Procurement Tracking**: Recent activity with "View All" and "Export CSV" functionality
- **Smart Notifications**: Hourly shortage alerts with customizable timing

### **📄 AI Document Processing**
**Transform PDF plansets into actionable inventory data**
1. **Upload Documents**: Drag & drop PDF files (max 10MB) into the processing area
2. **AI Analysis**: Advanced GPT-4 extraction identifies modules, inverters, optimizers, and components
3. **Real-time Processing**: Watch progress with detailed status updates and error handling
4. **Inventory Integration**: Automatically compare extracted equipment against current stock levels

### **📦 Inventory Management**
**Real-time stock monitoring with Google Sheets integration**
- **Live Synchronization**: Real-time updates from Google Sheets with change detection
- **Multi-View Options**: Toggle between row and column layouts for optimal viewing
- **Smart Filtering**: Interactive cards show healthy stock, low stock, and forecasted items
- **Export Capabilities**: CSV export functionality across all inventory modules

### **🛒 Procurement Automation**
**Professional purchase order generation and vendor management**
1. **Smart Suggestions**: AI-powered vendor recommendations based on equipment type and availability
2. **Professional Templates**: WattMonk-branded emails with complete company contact details
3. **Multi-Recipient Support**: Send orders to multiple vendors (satyam1@wattmonk.com, shivt843@gmail.com, satyam.tiwari.9695@gmail.com)
4. **Delivery Tracking**: Success/failure notifications with detailed status reporting

### **📈 Demand Forecasting**
**AI-driven predictions for next 10 installations**
- **Historical Analysis**: Machine learning algorithms analyze past installation patterns
- **Priority Ranking**: Top 10 high-urgency brands with organized formatting
- **Trend Visualization**: Charts with real day-by-day data and hover details
- **Procurement Planning**: Automated suggestions based on predicted shortfalls

## ⚙️ Configuration

### **🔧 Environment Configuration**

#### **Backend Configuration (`backend/.env`)**
```env
# Email Configuration
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password

# Environment Settings
ENVIRONMENT=development
API_HOST=127.0.0.1
API_PORT=8003
ALLOW_ALL_ORIGINS=false

# AI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Authentication
AUTH_USERNAME=admin
AUTH_PASSWORD=your-secure-password
```

#### **Frontend Configuration (`frontend/.env.local`)**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8003

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_FORECASTING=true
NEXT_PUBLIC_ENABLE_PROCUREMENT=true

# UI Configuration
NEXT_PUBLIC_DEFAULT_THEME=light
NEXT_PUBLIC_COMPANY_NAME="WattMonk"
NEXT_PUBLIC_APP_NAME="Solar Installer AI"
```

### **📊 Google Sheets Integration**
**Real-time inventory synchronization setup:**
1. **Create Google Cloud Project** with Sheets API enabled
2. **Generate Service Account** and download credentials JSON
3. **Place credentials** at `backend/sheets_credentials.json`
4. **Share spreadsheets** with service account email (editor access)
5. **Configure sheet IDs** in `backend/app/core/sheets_config.py`

### **📧 Professional Email Templates**
**WattMonk-branded procurement communications:**
- **Template Location**: `email_templates/order_request.html`
- **Company Branding**: Automatic WattMonk contact details insertion
- **Multi-Recipient**: Supports multiple vendor email addresses
- **Status Tracking**: Success/failure notifications with detailed error reporting

## 🧪 Testing & Quality Assurance

### **🔧 Backend Testing**
```bash
# Run all backend tests
cd backend
pytest tests/ -v

# Run with coverage reporting
pytest --cov=app --cov-report=html

# Test specific AI agents
pytest tests/test_doc_extractor.py -v
pytest tests/test_inventory_checker.py -v
pytest tests/test_forecaster.py -v
pytest tests/test_procurement_bot.py -v
```

### **🌐 Frontend Testing**
```bash
# Run Jest unit tests
cd frontend
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests (if configured)
npm run test:e2e
```

### **📧 Integration Testing**
```bash
# Test email functionality
python -c "from app.services.email import send_email; print('Email test:', send_email('Test', 'Test message', 'test@example.com'))"

# Test Google Sheets connection
curl http://127.0.0.1:8003/sheets/test-connection

# Test AI pipeline
curl -X POST -F "file=@data/uploads/Planset-3.pdf" http://127.0.0.1:8003/run-pipeline
```

## 🚀 Deployment

> **📖 For complete deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### **🐳 Docker Deployment (Recommended)**
```bash
# Quick start with Docker Compose
docker-compose up --build

# Production deployment
docker-compose --profile production up -d --build

# View logs
docker-compose logs -f
```

### **☁️ Production Deployment**
**Enterprise-ready deployment with full scalability:**
1. **Environment Setup**: Configure production `.env` files with secure credentials
2. **SSL/HTTPS**: Set up Let's Encrypt certificates for secure connections
3. **Database**: Configure PostgreSQL or MongoDB for production data storage
4. **Monitoring**: Implement health checks, logging, and performance monitoring
5. **Scaling**: Use Docker Swarm or Kubernetes for horizontal scaling

## 📚 Documentation

### **📖 Complete Documentation Suite**
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture and technical blueprint
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide with Docker and cloud setup
- **[QUICK_START.md](./QUICK_START.md)** - Developer quick reference for immediate productivity
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Comprehensive development guide and best practices

### **🔗 API Documentation**
- **Interactive API Docs**: http://127.0.0.1:8003/docs (when backend is running)
- **OpenAPI Schema**: http://127.0.0.1:8003/openapi.json
- **Health Monitoring**: http://127.0.0.1:8003/health

## 🤝 Contributing

We welcome contributions from the solar energy and software development communities!

### **🔧 Development Setup**
1. **Fork** the repository and clone your fork
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Install** dependencies and set up development environment
4. **Make** your changes with proper testing
5. **Commit** with descriptive messages: `git commit -m 'Add amazing feature'`
6. **Push** to your branch: `git push origin feature/amazing-feature`
7. **Open** a Pull Request with detailed description

### **📋 Contribution Guidelines**
- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation for any API changes
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for complete details.

## 🏆 Acknowledgments

### **🙏 Technology Partners**
- **OpenAI** - Advanced AI capabilities with GPT-4 integration
- **FastAPI Team** - High-performance Python web framework
- **Next.js Team** - Modern React framework with excellent developer experience
- **Google Cloud** - Reliable API services for Sheets integration

### **🌟 Special Thanks**
- **Solar Industry Professionals** - Domain expertise and real-world testing
- **Open Source Community** - Foundational libraries and frameworks
- **Beta Testers** - Valuable feedback and bug reports

## 📞 Support & Contact

### **🆘 Getting Help**
- **GitHub Issues**: [Create an issue](https://github.com/96satyam/inventoryassistant/issues) for bugs or feature requests
- **Documentation**: Check our comprehensive guides in the `/docs` directory
- **Email Support**: Contact the development team for enterprise inquiries

### **🔗 Connect With Us**
- **GitHub**: [@96satyam](https://github.com/96satyam)
- **Project Repository**: [inventoryassistant](https://github.com/96satyam/inventoryassistant)

---

## 🌟 **Built with ❤️ for the Solar Energy Industry**

**Empowering solar installers with intelligent automation and professional-grade inventory management.**

*Transform your solar installation business with AI-powered efficiency and seamless workflow automation.*