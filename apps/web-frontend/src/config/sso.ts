import { SsoConfig } from '@/types/sso';

// SSO Configuration - Environment-based
export const SSO_CONFIG: SsoConfig = {
  enabled: process.env.NEXT_PUBLIC_SSO_ENABLED === 'true',
  validationEndpoint: process.env.NEXT_PUBLIC_SSO_VALIDATION_ENDPOINT || 'https://staging.framesense.ai',
  redirectPaths: {
    admin: '/admin',
    user: '/dashboard',
    signin: '/login'
  }
};

// Role-based routing logic
export const getRedirectPath = (role: string): string => {
  if (role === 'admin' || role === 'watt-pay_editor') {
    return SSO_CONFIG.redirectPaths.admin;
  }
  return SSO_CONFIG.redirectPaths.user;
};

// Default user data for SSO users
export const createUserDataFromSso = (ssoUser: any, token: string) => {
  return {
    id: ssoUser.sub,
    name: ssoUser.name,
    email: ssoUser.email,
    role: ssoUser.roles[0] || 'user',
    credits: 0,
    subscription_status: 'active',
    subscription_id: '',
    planId: '',
    authToken: token,
    authMethod: 'sso'
  };
};
