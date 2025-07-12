# 🔐 Security Guidelines for Solar Installer AI

## 🚨 CRITICAL: Before GitHub Upload

**NEVER commit these files to version control:**

### ❌ **Prohibited Files (Already Protected by .gitignore)**
- `sheets_credentials.json` - Google service account credentials
- `.env` files - Environment variables with secrets
- `*.key`, `*.pem`, `*.crt` - Private keys and certificates
- `service-account-*.json` - Any service account files
- `google-credentials*.json` - Google credential files

### ✅ **Safe to Commit**
- `sheets_credentials.json.example` - Template file with placeholders
- `.env.example` - Template environment file
- Configuration files with placeholder values
- Public Google Sheets IDs (already shared with service account)

## 🛡️ Security Checklist

### Before Deployment:
- [ ] Remove all real credentials from codebase
- [ ] Verify .gitignore is protecting sensitive files
- [ ] Use environment variables for secrets in production
- [ ] Rotate any exposed credentials immediately
- [ ] Set up proper secret management (AWS Secrets Manager, etc.)

### Google Sheets Security:
- [ ] Service account has minimal required permissions
- [ ] Sheets are shared only with necessary service accounts
- [ ] Regular audit of sheet access permissions
- [ ] Monitor for unauthorized access

### API Security:
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Validate all input data
- [ ] Use secure session management
- [ ] Regular security updates

## 🔧 Setting Up Credentials Safely

### 1. Google Sheets Credentials
```bash
# Copy the example file
cp backend/sheets_credentials.json.example backend/sheets_credentials.json

# Edit with your actual credentials (NEVER commit this file)
nano backend/sheets_credentials.json
```

### 2. Environment Variables
```bash
# Copy the example file
cp backend/.env.example backend/.env

# Edit with your actual values (NEVER commit this file)
nano backend/.env
```

### 3. Production Deployment
Use environment variables or secret management services:
```bash
# Set environment variables
export OPENAI_API_KEY="your-actual-key"
export MAIL_USER="your-email@gmail.com"
export MAIL_PASS="your-app-password"
```

## 🚨 If Credentials Are Accidentally Committed

### Immediate Actions:
1. **Rotate all exposed credentials immediately**
2. **Remove from Git history:**
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch backend/sheets_credentials.json' \
   --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push to remove from remote:**
   ```bash
   git push origin --force --all
   ```
4. **Notify team members to re-clone repository**

### Google Service Account:
1. Go to Google Cloud Console
2. Delete the compromised service account
3. Create a new service account
4. Download new credentials
5. Update sheet sharing permissions

## 📞 Security Contact

For security issues:
- Email: procurement@wattmonk.com
- Create a private security issue in GitHub
- Follow responsible disclosure practices

## 🔍 Regular Security Audits

### Monthly:
- [ ] Review access logs
- [ ] Audit user permissions
- [ ] Check for dependency vulnerabilities
- [ ] Rotate credentials

### Quarterly:
- [ ] Security penetration testing
- [ ] Code security review
- [ ] Update security documentation
- [ ] Team security training

---

**Remember: Security is everyone's responsibility!** 🛡️
