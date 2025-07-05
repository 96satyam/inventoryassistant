/**
 * API Configuration Utility
 * Provides environment-aware API URLs for local, network, and public deployment
 */

import { detectEnvironment, logEnvironmentInfo } from '@/utils/environment';

/**
 * Get the base API URL based on environment
 * Enhanced logic for local, network, and public deployment
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - use localhost
    return 'http://localhost:8003';
  }

  // Check for explicit environment variables
  if (typeof window !== 'undefined' && (window as any).API_BASE_URL) {
    return (window as any).API_BASE_URL;
  }

  // Use environment detection utility
  const env = detectEnvironment();

  // Log environment info for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    logEnvironmentInfo();
  }

  // Build API URL based on detected environment
  const apiUrl = `${env.protocol}//${env.hostname}:8003`;

  console.log(`🌐 API Config: ${env.deploymentType} deployment detected`);
  console.log(`📡 API URL: ${apiUrl}`);

  return apiUrl;
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
 * Environment-aware fetch wrapper
 * Automatically uses the correct API URL based on environment
 * @param endpoint - The API endpoint path
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(endpoint);
  console.log(`🌐 API Request: ${options?.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText} for ${url}`);
    }
    return response;
  } catch (error) {
    console.error(`🔥 Network Error for ${url}:`, error);
    throw error;
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
