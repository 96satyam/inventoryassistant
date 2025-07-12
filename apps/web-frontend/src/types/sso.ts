// SSO Authentication Types
export interface SsoUser {
  sub: string;
  name: string;
  email: string;
  roles: string[];
}

export interface SsoAuthResponse {
  valid: boolean;
  user?: SsoUser;
  message?: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  credits: number;
  subscription_status: string;
  subscription_id: string;
  planId: string;
}

// SSO Configuration
export interface SsoConfig {
  enabled: boolean;
  validationEndpoint: string;
  redirectPaths: {
    admin: string;
    user: string;
    signin: string;
  };
}
