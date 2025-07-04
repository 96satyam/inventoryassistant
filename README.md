# 🌞 Solar Installer AI - Smart Inventory Management System

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black.svg)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0+-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intelligent inventory management and procurement automation system specifically designed for solar installation companies. This AI-powered platform streamlines equipment tracking, demand forecasting, and automated purchase order generation.

## 🚀 Features

### 📊 **Smart Dashboard**
- Real-time inventory monitoring with interactive charts
- KPI tracking (efficiency metrics, stock levels, procurement status)
- Automated shortage notifications with hourly scheduling
- Dark/light mode support with automatic color adaptation

### 🤖 **AI-Powered Document Processing**
- PDF planset analysis and equipment extraction
- Automated solar module, inverter, and component identification
- LangGraph-based processing pipeline with OpenAI integration
- Support for multiple document formats

### 📈 **Demand Forecasting**
- Machine learning-based shortage prediction
- Historical data analysis for trend identification
- Top 5 critical items highlighting with visual indicators
- Seasonal demand pattern recognition

### 🛒 **Automated Procurement**
- Smart vendor suggestion system with PO generation
- Email integration for automated purchase order sending
- Vendor-specific branding and contact management
- Purchase history tracking and analytics

### 📱 **Modern Web Interface**
- Responsive design with Tailwind CSS
- Interactive data visualization with Recharts
- Real-time updates using SWR data fetching
- Professional UI with Framer Motion animations

### 🔔 **Notification System**
- Toast notifications for user actions
- Email delivery status confirmations
- Shortage alerts with customizable timing
- WhatsApp integration for critical alerts

## 🏗️ Architecture

```
solar_installer_ai/
├── apps/
│   ├── api_core/           # FastAPI backend application
│   ├── web-frontend/       # Next.js React frontend
│   └── worker-langgraph/   # Background processing workers
├── libs/
│   └── core/              # Shared business logic and utilities
├── agents/                # AI agents for specific tasks
├── data/                  # Sample data and configurations
├── tests/                 # Test suites
└── infra/                 # Infrastructure and deployment configs
```

## 🛠️ Technology Stack

### **Backend**
- **FastAPI** - High-performance Python web framework
- **LangChain & LangGraph** - AI workflow orchestration
- **OpenAI GPT** - Document processing and analysis
- **SQLAlchemy** - Database ORM
- **Pandas** - Data manipulation and analysis
- **APScheduler** - Background task scheduling

### **Frontend**
- **Next.js 15.3.4** - React framework with Turbopack
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.1** - Utility-first styling
- **SWR** - Data fetching and caching
- **Recharts** - Data visualization
- **Framer Motion** - Smooth animations

### **AI & ML**
- **OpenAI API** - GPT models for text processing
- **LangChain** - AI application framework
- **Transformers** - Hugging Face model integration
- **Scikit-learn** - Machine learning algorithms
- **FAISS** - Vector similarity search

### **Infrastructure**
- **Docker** - Containerization
- **CORS** - Cross-origin resource sharing
- **Email Services** - SMTP integration
- **File Processing** - PDF, Excel, and image handling

## 📋 Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **npm or yarn**
- **OpenAI API Key**
- **Email SMTP Configuration** (optional)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd solar_installer_ai
```

### 2. Environment Setup
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (optional)
MAIL_USER=your_email@example.com
MAIL_PASSWORD=your_app_password
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587

# Database Configuration (optional)
DATABASE_URL=sqlite:///./solar_inventory.db
```

### 4. Start the Backend
```bash
cd apps/api_core
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Start the Frontend
```bash
cd apps/web-frontend
npm install
npm run dev
```

### 6. Access the Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📖 Usage Guide

### **Dashboard Overview**
1. Navigate to the dashboard to view real-time inventory metrics
2. Monitor stock levels, efficiency ratings, and procurement status
3. Click on metric cards for detailed views of specific categories
4. Use the notification bell to view system alerts

### **Document Processing**
1. Go to the Equipment Extractor page
2. Upload a PDF planset or equipment specification document
3. The AI will automatically extract equipment details
4. Review and confirm the extracted information

### **Inventory Management**
1. Access the Inventory Checker to view current stock levels
2. Monitor items marked as "Low Stock" or "Critical"
3. Set up automated reorder points for key components
4. Track historical usage patterns

### **Procurement Automation**
1. Visit the Procurement page to view suggested purchase orders
2. Review vendor recommendations and pricing
3. Generate and send purchase orders via email
4. Track order status and delivery confirmations

### **Forecasting**
1. Use the Forecast page to view demand predictions
2. Analyze seasonal trends and usage patterns
3. Plan inventory purchases based on AI recommendations
4. Monitor forecast accuracy over time

## 🔧 Configuration

### **API Endpoints**
The system provides the following main endpoints:
- `GET /stats/` - Dashboard KPI metrics
- `GET /inventory/` - Current inventory levels
- `GET /forecast/` - Demand forecasting data
- `GET /suggestions/` - Vendor and PO suggestions
- `POST /run-pipeline` - Document processing
- `POST /procurement/send-email` - Send purchase orders

### **Cross-Origin Configuration**
For network deployment, the system supports:
```javascript
allowedDevOrigins: [
  'localhost:3001',
  '192.168.0.80:3001',
  '127.0.0.1:3001'
]
```

### **Email Templates**
Customize purchase order emails in `email_templates/order_request.html`

## 🧪 Testing

### Run Backend Tests
```bash
cd solar_installer_ai
python -m pytest tests/ -v
```

### Run Frontend Tests
```bash
cd apps/web-frontend
npm test
```

### Test Email Functionality
```bash
python test_email.py
```

## 📦 Deployment

### **Docker Deployment**
```bash
# Build the application
docker build -t solar-installer-ai .

# Run the container
docker run -p 8000:8000 -p 3001:3001 solar-installer-ai
```

### **Production Environment**
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up SSL certificates
4. Configure email service credentials
5. Deploy to cloud platform (AWS, GCP, Azure)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [documentation](docs/)
- Review the API documentation at `/docs` endpoint

## 🔍 API Reference

### **Core Endpoints**

#### Dashboard Stats
```http
GET /stats/
```
Returns KPI metrics including efficiency ratings, open procurements, and next shortfall predictions.

#### Inventory Management
```http
GET /inventory/
```
Retrieves current inventory levels with stock status indicators.

#### Demand Forecasting
```http
GET /forecast/
```
Provides AI-generated demand forecasts and shortage predictions.

#### Vendor Suggestions
```http
GET /suggestions/
```
Returns intelligent vendor recommendations with purchase order suggestions.

#### Document Processing
```http
POST /run-pipeline
Content-Type: multipart/form-data

{
  "file": <PDF_FILE>
}
```
Processes uploaded documents and extracts equipment information.

#### Email Integration
```http
POST /procurement/send-email
Content-Type: application/json

{
  "vendor": "SolarEdge",
  "items": {"U650 Optimizer": 15},
  "shipping_address": "123 Solar Lane, Delhi",
  "need_by": "2025-07-05",
  "to_email": "vendor@example.com"
}
```

## 🐛 Troubleshooting

### **Common Issues**

#### **1. API Connection Errors**
```bash
Error: Failed to fetch from http://localhost:8000
```
**Solution**: Ensure the backend server is running on port 8000
```bash
cd apps/api_core
uvicorn app.main:app --reload --port 8000
```

#### **2. Cross-Origin Request Blocked**
```bash
⚠ Blocked cross-origin request from 192.168.0.80
```
**Solution**: Update `next.config.js` with your network IP:
```javascript
allowedDevOrigins: ['your-network-ip:3001']
```

#### **3. OpenAI API Errors**
```bash
Error: OpenAI API key not found
```
**Solution**: Set your OpenAI API key in `.env`:
```env
OPENAI_API_KEY=sk-your-key-here
```

#### **4. Email Sending Failures**
```bash
Error: SMTP authentication failed
```
**Solution**: Configure email settings in `.env`:
```env
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

#### **5. Module Import Errors**
```bash
ModuleNotFoundError: No module named 'langchain'
```
**Solution**: Install dependencies:
```bash
pip install -r requirements.txt
```

### **Performance Optimization**

#### **Frontend Optimization**
- Enable Turbopack for faster builds: `npm run dev`
- Use SWR caching for API calls
- Implement lazy loading for large components

#### **Backend Optimization**
- Use async/await for database operations
- Implement connection pooling
- Cache frequently accessed data

## 📊 Data Models

### **Inventory Item**
```python
{
  "name": "SolarEdge U650 Optimizer",
  "category": "optimizer",
  "available": 45,
  "required": 60,
  "vendor": "SolarEdge",
  "unit_price": 125.00,
  "last_updated": "2025-01-04T10:30:00Z"
}
```

### **Forecast Data**
```python
{
  "item_name": "Jinko Solar Panel 400W",
  "current_stock": 120,
  "predicted_demand": 180,
  "shortage_risk": "high",
  "recommended_order": 100,
  "forecast_date": "2025-01-15"
}
```

### **Purchase Order**
```python
{
  "vendor": "SolarEdge",
  "items": [
    {
      "name": "U650 Optimizer",
      "quantity": 15,
      "unit_price": 125.00
    }
  ],
  "total_amount": 1875.00,
  "shipping_address": "123 Solar Lane, Delhi",
  "need_by": "2025-07-05",
  "status": "pending"
}
```

## 🔐 Security

### **API Security**
- CORS configuration for cross-origin requests
- Input validation on all endpoints
- Rate limiting for API calls
- Secure file upload handling

### **Data Protection**
- Environment variable management
- Secure email credential storage
- Database connection encryption
- API key protection

### **Best Practices**
- Regular dependency updates
- Security audit of uploaded files
- Monitoring of API usage
- Backup and recovery procedures

## 🚀 Roadmap

### **Version 1.1 (Q2 2025)**
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Multi-tenant support
- [ ] Enhanced AI models

### **Version 1.2 (Q3 2025)**
- [ ] Integration with ERP systems
- [ ] Advanced reporting features
- [ ] Automated vendor negotiations
- [ ] IoT device integration

### **Version 2.0 (Q4 2025)**
- [ ] Machine learning model improvements
- [ ] Real-time collaboration features
- [ ] Advanced workflow automation
- [ ] Enterprise-grade security

## 🙏 Acknowledgments

- OpenAI for GPT models and AI capabilities
- LangChain community for AI framework development
- Next.js team for the excellent React framework
- FastAPI for the high-performance backend framework
- Tailwind CSS for the utility-first styling approach
- The open-source community for various libraries and tools
