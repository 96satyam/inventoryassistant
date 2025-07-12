# 👩‍💻 Developer Quick Reference Guide

> **Quick reference for developers working on Solar Installer AI**

## 🚀 Quick Start

### Local Development Setup
```bash
# 1. Start Backend
cd backend
python main.py
# → http://localhost:8003

# 2. Start Frontend (new terminal)
cd frontend
npm run dev
# → http://localhost:3000
```

### 🔧 Key Configuration Files
- **API Config**: `frontend/src/lib/api-config.ts`
- **Backend Main**: `backend/main.py`
- **Google Sheets**: `backend/app/core/sheets_config.py`
- **Environment**: `backend/.env`

---

## 📁 File Locations Quick Reference

### 🌐 Frontend Structure
```
frontend/src/
├── app/                    # Next.js App Router Pages
│   ├── dashboard/          # Main dashboard
│   ├── inventory/          # Inventory management
│   ├── procurement/        # Purchase orders
│   ├── forecast/           # AI forecasting
│   ├── analytics/          # Charts & reports
│   └── api/                # Frontend API routes
├── components/             # React Components
│   ├── layout/             # Header, Sidebar, Layout
│   ├── charts/             # Chart components
│   ├── inventory/          # Inventory components
│   ├── procurement/        # Procurement components
│   └── ui/                 # Base UI components
└── lib/                    # Utilities & API
    ├── api-config.ts       # API endpoints
    ├── api.ts              # API client functions
    ├── auth.ts             # Authentication
    └── google-sheets-api.ts # Google Sheets client
```

### 🔧 Backend Structure
```
backend/app/
├── api/v1/endpoints/       # API Routes
│   ├── inventry.py         # GET /inventory/
│   ├── procurement.py      # POST /procurement/send-email
│   ├── forecast.py         # GET /forecast/
│   ├── stats.py            # GET /stats/
│   └── suggestions_routes.py # GET /suggestions/
├── services/               # Business Logic
│   ├── email.py            # Email sending
│   ├── sheets_connector.py # Google Sheets integration
│   ├── inventory.py        # Inventory management
│   └── forecast.py         # Forecasting logic
├── agents/                 # AI Agents
│   ├── doc_extractor.py    # PDF processing
│   ├── forecaster.py       # Demand prediction
│   └── procurement_bot.py  # Purchase recommendations
└── core/                   # Configuration
    ├── settings.py         # App settings
    └── sheets_config.py    # Google Sheets config
```

---

## 🔄 API Communication Patterns

### Frontend → Backend API Calls
```typescript
// Dashboard stats
const stats = await apiFetch('/api/stats');

// Inventory data
const inventory = await apiFetch('/api/inventory');

// Send procurement email
const result = await apiFetch('/procurement/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(emailData)
});
```

### Backend API Endpoints
```python
# Stats endpoint
@router.get("/stats/")
async def get_stats():
    return {"total_skus": 150, "healthy_stock": 120}

# Procurement email endpoint  
@router.post("/procurement/send-email")
async def send_procurement_email(request: EmailRequest):
    result = send_email(request.subject, request.body, request.to_email)
    return {"success": True}
```

---

## 🔗 Key Integration Points

### 📊 Google Sheets Integration
**Location**: `backend/app/services/sheets_connector.py`
```python
# Get real-time inventory data
connector = get_sheets_connector()
data = connector.get_worksheet_data('Sheet1')
```

### 📧 Email Service
**Location**: `backend/app/services/email.py`
```python
# Send professional emails
send_email(
    subject="Purchase Order Request",
    body=html_template,
    to_email="vendor@example.com"
)
```

### 🤖 AI Agents
**Location**: `backend/app/agents/`
```python
# Document processing
extractor = DocumentExtractor()
equipment = extractor.extract_equipment(pdf_file)

# Forecasting
forecaster = Forecaster()
predictions = forecaster.predict_demand(historical_data)
```

---

## 🔧 Common Development Tasks

### Adding a New API Endpoint
1. **Create endpoint**: `backend/app/api/v1/endpoints/new_feature.py`
2. **Register router**: Add to `backend/main.py`
3. **Add frontend call**: Update `frontend/src/lib/api-config.ts`
4. **Create component**: Add React component in `frontend/src/components/`

### Adding a New Page
1. **Create page**: `frontend/src/app/new-page/page.tsx`
2. **Add navigation**: Update sidebar in `frontend/src/components/layout/`
3. **Add API calls**: Create data fetching functions
4. **Style components**: Use Tailwind CSS classes

### Modifying Google Sheets Integration
1. **Update config**: `backend/app/core/sheets_config.py`
2. **Modify connector**: `backend/app/services/sheets_connector.py`
3. **Test connection**: Use health check endpoints

---

## 🐛 Debugging & Troubleshooting

### Common Issues
- **CORS errors**: Check `backend/main.py` origins configuration
- **Import errors**: Verify file paths in import statements
- **Google Sheets**: Check credentials and sheet permissions
- **Email not sending**: Verify SMTP configuration in `.env`

### Useful Commands
```bash
# Check backend logs
cd backend && python main.py

# Check frontend build
cd frontend && npm run build

# Test API endpoints
curl http://localhost:8003/health

# Check Google Sheets connection
curl http://localhost:8003/sheets/test-connection
```

---

## 📚 Documentation Links

- **[Complete Architecture](./ARCHITECTURE.md)** - Detailed system architecture
- **[Main README](./README.md)** - Project overview and setup
- **[API Documentation](http://localhost:8003/docs)** - Interactive API docs
- **[Frontend README](./frontend/README.md)** - Frontend-specific docs
- **[Backend README](./backend/README.md)** - Backend-specific docs

---

## 🎯 Best Practices

### Code Organization
- Keep components small and focused
- Use TypeScript for type safety
- Follow consistent naming conventions
- Separate business logic from UI components

### API Design
- Use RESTful endpoints
- Include proper error handling
- Validate input data with Pydantic
- Return consistent response formats

### Performance
- Cache Google Sheets data
- Use React Query for data fetching
- Optimize images and static assets
- Implement proper loading states

This guide provides quick access to the most commonly needed information for development work on the Solar Installer AI project.
