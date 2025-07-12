# SSO Integration & Deployment Guide

## 🔐 SSO Integration Overview

This project now supports Single Sign-On (SSO) authentication alongside the existing username/password authentication system. The SSO integration is designed to be:

- **Environment-configurable**: Enable/disable via environment variables
- **Non-breaking**: Existing authentication continues to work
- **Role-based**: Supports admin and user role routing
- **Production-ready**: Configurable for different deployment environments

## 🏗️ Architecture

### Authentication Flow
```
1. User visits /login
2. Options: Username/Password OR SSO
3. SSO Flow:
   - Redirect to SSO provider
   - Provider validates and returns token
   - App validates token at /sso-callback
   - User data stored and redirected to dashboard
```

### File Structure
```
src/
├── app/
│   ├── login/page.tsx          # Updated with SSO option
│   └── sso-callback/page.tsx   # New SSO callback handler
├── config/
│   └── sso.ts                  # SSO configuration
├── services/
│   └── sso.ts                  # SSO API services
├── types/
│   └── sso.ts                  # SSO type definitions
└── utils/
    └── authMiddleware.ts       # Updated with SSO support
```

## 🚀 Deployment Configuration

### Environment Variables

#### Development (.env.local)
```bash
# SSO Configuration
NEXT_PUBLIC_SSO_ENABLED=false
NEXT_PUBLIC_SSO_VALIDATION_ENDPOINT=https://staging.framesense.ai
```

#### Production (.env.production)
```bash
# SSO Configuration
NEXT_PUBLIC_SSO_ENABLED=true
NEXT_PUBLIC_SSO_VALIDATION_ENDPOINT=https://your-production-sso-endpoint.com
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
```

### Host-Specific Configuration

#### For Different Hosts:
1. **Copy environment template**:
   ```bash
   cp .env.production.template .env.production
   ```

2. **Update SSO endpoint**:
   ```bash
   NEXT_PUBLIC_SSO_VALIDATION_ENDPOINT=https://your-host-sso-provider.com
   ```

3. **Configure callback URL**:
   - SSO Provider should redirect to: `https://your-domain.com/sso-callback?token=TOKEN`

## 🔧 Integration Steps

### 1. Enable SSO
```bash
# In your environment file
NEXT_PUBLIC_SSO_ENABLED=true
```

### 2. Configure SSO Provider
Your SSO provider should:
- Accept POST requests to validate tokens
- Return response in format:
```json
{
  "valid": true,
  "user": {
    "sub": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "roles": ["admin", "user"]
  }
}
```

### 3. Set Callback URL
Configure your SSO provider to redirect to:
```
https://your-domain.com/sso-callback?token={TOKEN}
```

## 🧪 Testing

### Local Testing
1. Set `NEXT_PUBLIC_SSO_ENABLED=true`
2. Visit `/login`
3. Click "Sign in with SSO"
4. Should redirect to SSO provider

### Production Testing
1. Deploy with SSO enabled
2. Test both authentication methods
3. Verify role-based routing works

## 🔒 Security Considerations

### Token Validation
- All SSO tokens are validated server-side
- Invalid tokens redirect to login
- Tokens are stored securely in localStorage

### Role-Based Access
- Admin users: Redirected to `/admin`
- Regular users: Redirected to `/dashboard`
- Roles determined by SSO provider response

### Fallback Authentication
- Username/password auth remains available
- SSO failure gracefully falls back to login
- No breaking changes to existing users

## 🚨 Troubleshooting

### Common Issues

#### SSO Button Not Showing
- Check `NEXT_PUBLIC_SSO_ENABLED=true`
- Verify environment variables are loaded
- Check browser console for errors

#### Token Validation Fails
- Verify SSO endpoint URL is correct
- Check network connectivity
- Validate token format with SSO provider

#### Redirect Issues
- Ensure callback URL is correctly configured
- Check for CORS issues
- Verify domain configuration

### Debug Mode
Enable debug logging by checking browser console:
```javascript
// Look for these log messages:
🔐 Validating SSO token against: [endpoint]
✅ SSO validation successful
🔄 Redirecting to: [path]
```

## 📋 Deployment Checklist

- [ ] Environment variables configured
- [ ] SSO provider endpoint accessible
- [ ] Callback URL registered with SSO provider
- [ ] SSL certificate installed (required for production)
- [ ] CORS configured if needed
- [ ] Test both authentication methods
- [ ] Verify role-based routing
- [ ] Test error handling and fallbacks

## 🔄 Migration Guide

### From Existing Deployment
1. **Backup current configuration**
2. **Add SSO environment variables**
3. **Deploy updated code**
4. **Test SSO functionality**
5. **Enable SSO in production**

### Rollback Plan
If issues occur:
1. Set `NEXT_PUBLIC_SSO_ENABLED=false`
2. Redeploy
3. SSO option will be hidden
4. Existing auth continues working

## 📞 Support

For deployment issues:
1. Check environment variables
2. Verify SSO provider configuration
3. Review browser console logs
4. Test with SSO disabled first
5. Contact SSO provider for token validation issues
