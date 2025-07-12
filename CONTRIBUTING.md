# Contributing to Solar Installer AI

Thank you for your interest in contributing to Solar Installer AI! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git
- Docker (optional)

### Development Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd solar_installer_ai
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements-dev.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backend && python main.py
   
   # Frontend (Terminal 2)
   cd frontend && npm run dev
   ```

## 🛠️ Development Guidelines

### Code Style
- **Python**: Follow PEP 8, use Black for formatting
- **TypeScript/React**: Follow ESLint rules, use Prettier
- **Commits**: Use conventional commit messages

### Testing
- Write tests for new features
- Ensure all tests pass before submitting PR
- Maintain test coverage above 80%

### Documentation
- Update README.md for user-facing changes
- Update ARCHITECTURE.md for structural changes
- Add inline comments for complex logic

## 📝 Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   # Backend
   cd backend && pytest && black . && flake8
   
   # Frontend
   cd frontend && npm test && npm run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. **Push to your fork**
7. **Create a Pull Request**

## 🐛 Bug Reports

When reporting bugs, please include:
- Operating system and version
- Python/Node.js versions
- Steps to reproduce
- Expected vs actual behavior
- Error messages/logs

## 💡 Feature Requests

For feature requests, please:
- Check existing issues first
- Provide clear use case
- Explain expected behavior
- Consider implementation complexity

## 📞 Contact

- Create an issue for bugs/features
- Email: procurement@wattmonk.com
- Website: https://www.wattmonk.com/

Thank you for contributing! 🌞
