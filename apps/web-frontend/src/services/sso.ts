import { SsoAuthResponse } from '@/types/sso';
import { SSO_CONFIG } from '@/config/sso';

/**
 * Validates SSO token against the configured endpoint
 */
export const validateSsoToken = async (token: string): Promise<SsoAuthResponse> => {
  try {
    console.log('🔐 Validating SSO token against:', SSO_CONFIG.validationEndpoint);
    
    const response = await fetch(SSO_CONFIG.validationEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`SSO validation failed: ${response.status} ${response.statusText}`);
    }

    const data: SsoAuthResponse = await response.json();
    
    console.log('✅ SSO validation successful:', {
      valid: data.valid,
      userEmail: data.user?.email,
      userRoles: data.user?.roles
    });
    
    return data;
  } catch (error) {
    console.error('❌ SSO validation error:', error);
    throw error;
  }
};

/**
 * Stores SSO authentication data in localStorage
 */
export const storeSsoAuthData = (userData: any, token: string): void => {
  try {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('authMethod', 'sso');
    
    console.log('💾 SSO auth data stored successfully');
  } catch (error) {
    console.error('❌ Failed to store SSO auth data:', error);
  }
};

/**
 * Clears SSO authentication data from localStorage
 */
export const clearSsoAuthData = (): void => {
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('role');
    localStorage.removeItem('authMethod');
    
    console.log('🗑️ SSO auth data cleared');
  } catch (error) {
    console.error('❌ Failed to clear SSO auth data:', error);
  }
};

/**
 * Checks if user is authenticated via SSO
 */
export const isSsoAuthenticated = (): boolean => {
  try {
    const authMethod = localStorage.getItem('authMethod');
    const authToken = localStorage.getItem('authToken');
    return authMethod === 'sso' && !!authToken;
  } catch (error) {
    return false;
  }
};
