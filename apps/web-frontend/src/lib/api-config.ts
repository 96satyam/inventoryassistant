/**
 * API Configuration Utility
 * Provides environment-aware API URLs for local, network, and public deployment
 */

/**
 * Get the base API URL based on environment
 * Enhanced logic with comprehensive environment detection and data consistency
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - use localhost
    return 'http://localhost:8000';
  }

  // Check for explicit environment variables
  if (typeof window !== 'undefined' && (window as any).API_BASE_URL) {
    return (window as any).API_BASE_URL;
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Enhanced environment detection with data consistency checks
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Local development - always use localhost backend
    console.log('🏠 Local development detected - using localhost:8000');
    return 'http://localhost:8000';
  } else {
    // Public/Network access - use consistent backend configuration
    console.log(`🌐 Public/Network access detected from: ${hostname}`);

    // For public URLs, we need to ensure backend is accessible
    // Store configuration for fallback and debugging
    const publicApiUrl = `${protocol}//${hostname}:8000`;
    const fallbackApiUrl = 'http://localhost:8000';

    // Store URLs for fallback logic and debugging
    (window as any).__PUBLIC_API_URL = publicApiUrl;
    (window as any).__FALLBACK_API_URL = fallbackApiUrl;
    (window as any).__ENVIRONMENT_TYPE = 'public';

    console.log(`🔗 Primary API: ${publicApiUrl}`);
    console.log(`🔄 Fallback API: ${fallbackApiUrl}`);

    return publicApiUrl;
  }
}

/**
 * Get a complete API endpoint URL
 * @param endpoint - The API endpoint path (e.g., '/inventory', '/suggestions/')
 * @returns Complete URL for the API endpoint
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Environment-aware fetch wrapper with enhanced data consistency and fallback
 * Automatically uses the correct API URL based on environment and ensures data format consistency
 * @param endpoint - The API endpoint path
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(endpoint);
  const environmentType = (window as any).__ENVIRONMENT_TYPE || 'local';

  console.log(`🌐 API Request [${environmentType}]: ${options?.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      console.error(`❌ API Error [${environmentType}]: ${response.status} ${response.statusText} for ${url}`);

      // For public URLs, immediately try fallback on HTTP errors
      if (environmentType === 'public' && typeof window !== 'undefined' && (window as any).__FALLBACK_API_URL) {
        console.log(`🔄 Public URL API failed, trying fallback immediately...`);
        return await tryFallbackAPI(endpoint, options);
      }
    } else {
      console.log(`✅ API Success [${environmentType}]: ${url}`);
    }

    return response;
  } catch (error) {
    console.error(`🔥 Network Error [${environmentType}] for ${url}:`, error);

    // For public URLs, try fallback to localhost if available
    if (environmentType === 'public' && typeof window !== 'undefined' && (window as any).__FALLBACK_API_URL) {
      console.log(`🔄 Network error on public URL, trying fallback...`);
      return await tryFallbackAPI(endpoint, options);
    }

    throw error;
  }
}

/**
 * Try fallback API with proper error handling
 */
async function tryFallbackAPI(endpoint: string, options?: RequestInit): Promise<Response> {
  const fallbackUrl = (window as any).__FALLBACK_API_URL + (endpoint.startsWith('/') ? endpoint : `/${endpoint}`);

  try {
    console.log(`🔄 Attempting fallback: ${fallbackUrl}`);
    const fallbackResponse = await fetch(fallbackUrl, options);

    if (fallbackResponse.ok) {
      console.log(`✅ Fallback API successful: ${fallbackUrl}`);
      // Mark that we're using fallback for data consistency
      (window as any).__USING_FALLBACK = true;
      return fallbackResponse;
    } else {
      console.error(`❌ Fallback API HTTP error: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
      throw new Error(`Fallback API HTTP error: ${fallbackResponse.status}`);
    }
  } catch (fallbackError) {
    console.error(`❌ Fallback API network error:`, fallbackError);
    throw fallbackError;
  }
}

/**
 * Predefined API endpoints
 */
export const API_ENDPOINTS = {
  STATS: '/stats/',
  INVENTORY: '/inventory/',
  FORECAST: '/forecast/',
  SUGGESTIONS: '/suggestions/',
  PROCUREMENT_LOGS: '/procurement/logs',
  PROCUREMENT_SEND_EMAIL: '/procurement/send-email',
  RUN_PIPELINE: '/run-pipeline',
} as const;
