# Solar Installer AI - Backend

This is the backend API for the Solar Installer AI application, built with FastAPI.

## 🏗️ Architecture

```
backend/
├── main.py                 # FastAPI application entry point
├── start_server.py         # Server startup script
├── requirements.txt        # Production dependencies
├── requirements-dev.txt    # Development dependencies
├── app/                    # Application source code
│   ├── api/               # API routes
│   │   └── v1/           # API version 1
│   │       └── endpoints/ # API endpoints
│   ├── core/             # Core application logic
│   ├── models/           # Data models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic services
│   ├── agents/           # AI agents
│   ├── utils/            # Utility functions
│   └── templates/        # Email templates
├── tests/                # Backend tests
└── scripts/              # Utility scripts
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- pip or conda

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
python start_server.py
```

The API will be available at:
- **API**: http://localhost:8003
- **Documentation**: http://localhost:8003/docs
- **ReDoc**: http://localhost:8003/redoc

## 🔧 Configuration

Environment variables can be set in `.env` file:

```env
# API Configuration
API_HOST=127.0.0.1
API_PORT=8003
ENVIRONMENT=development

# CORS Configuration
ALLOW_ALL_ORIGINS=false

# Google Sheets
GOOGLE_SHEETS_CREDENTIALS_FILE=sheets_credentials.json

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 📚 API Endpoints

### Health Check
- `GET /health` - Health check endpoint
- `GET /` - Root endpoint

### Inventory
- `GET /api/inventory` - List inventory items
- `POST /api/inventory` - Create inventory item
- `GET /api/inventory/{id}` - Get inventory item
- `PUT /api/inventory/{id}` - Update inventory item
- `DELETE /api/inventory/{id}` - Delete inventory item

### Forecasting
- `GET /api/forecast` - Get forecasting data
- `POST /api/forecast/generate` - Generate new forecast

### Procurement
- `GET /api/procurement` - List procurement activities
- `POST /api/procurement` - Create procurement order
- `GET /api/procurement/suggestions` - Get procurement suggestions

### Google Sheets
- `POST /api/sheets/sync` - Sync with Google Sheets
- `GET /api/sheets/changes` - Get recent changes

## 🧪 Testing

Run tests with:
```bash
pytest
```

Run tests with coverage:
```bash
pytest --cov=app
```

## 🔍 Development

### Code Formatting
```bash
black app/
isort app/
```

### Linting
```bash
flake8 app/
mypy app/
```

### Pre-commit Hooks
```bash
pre-commit install
pre-commit run --all-files
```

## 📦 Deployment

### Docker
```bash
docker build -t solar-installer-backend .
docker run -p 8003:8003 solar-installer-backend
```

### Production
1. Set environment to production
2. Use a production WSGI server like Gunicorn
3. Set up proper logging and monitoring
4. Configure SSL/TLS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
