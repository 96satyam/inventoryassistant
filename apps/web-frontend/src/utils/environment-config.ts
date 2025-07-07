/**
 * Environment Configuration Utility
 * Provides consistent environment detection and configuration across all deployments
 * Ensures data consistency between local and public URL environments
 */

export interface EnvironmentInfo {
  type: 'local' | 'network' | 'public';
  hostname: string;
  protocol: string;
  isLocal: boolean;
  isNetwork: boolean;
  isPublic: boolean;
  apiBaseUrl: string;
  fallbackApiUrl?: string;
  debugMode: boolean;
  corsEnabled: boolean;
}

/**
 * Detect current environment with enhanced accuracy
 */
export function detectEnvironment(): EnvironmentInfo {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return {
      type: 'local',
      hostname: 'localhost',
      protocol: 'http:',
      isLocal: true,
      isNetwork: false,
      isPublic: false,
      apiBaseUrl: 'http://localhost:8003',
      debugMode: true,
      corsEnabled: false
    };
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Enhanced environment detection
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  const isNetwork = !isLocal && (
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname.includes('.local')
  );
  const isPublic = !isLocal && !isNetwork;

  let type: 'local' | 'network' | 'public' = 'local';
  if (isPublic) {
    type = 'public';
  } else if (isNetwork) {
    type = 'network';
  }

  // Determine API URLs
  const apiBaseUrl = isLocal ? 'http://localhost:8003' : `${protocol}//${hostname}:8003`;
  const fallbackApiUrl = isLocal ? undefined : 'http://localhost:8003';

  const env: EnvironmentInfo = {
    type,
    hostname,
    protocol,
    isLocal,
    isNetwork,
    isPublic,
    apiBaseUrl,
    fallbackApiUrl,
    debugMode: isLocal,
    corsEnabled: !isLocal
  };

  // Store environment info globally for debugging
  (window as any).__ENVIRONMENT_INFO = env;
  
  console.log('🌍 Environment detected:', env);
  
  return env;
}

/**
 * Get current environment info (cached)
 */
export function getCurrentEnvironment(): EnvironmentInfo {
  if (typeof window !== 'undefined' && (window as any).__ENVIRONMENT_INFO) {
    return (window as any).__ENVIRONMENT_INFO;
  }
  return detectEnvironment();
}

/**
 * Check if backend is likely accessible based on environment
 */
export function isBackendLikelyAccessible(): boolean {
  const env = getCurrentEnvironment();
  
  // Local environment - backend should be accessible
  if (env.isLocal) {
    return true;
  }
  
  // Network/Public environment - depends on backend configuration
  // We'll need to test connectivity
  return false; // Conservative approach - test first
}

/**
 * Get appropriate error message for environment
 */
export function getEnvironmentErrorMessage(error: any): string {
  const env = getCurrentEnvironment();
  
  if (env.isLocal) {
    return `Local backend error: ${error.message || 'Unknown error'}`;
  } else if (env.isNetwork) {
    return `Network backend not accessible. Please ensure backend is running with network access enabled.`;
  } else {
    return `Public backend not accessible. Please configure backend for public deployment.`;
  }
}

/**
 * Get deployment instructions for current environment
 */
export function getDeploymentInstructions(): string[] {
  const env = getCurrentEnvironment();
  
  if (env.isLocal) {
    return [
      'For local development:',
      '1. Run: npm run dev (frontend)',
      '2. Run: python start_server.py (backend)',
      '3. Backend should be accessible on localhost:8003'
    ];
  } else if (env.isNetwork || env.isPublic) {
    return [
      'For network/public access:',
      '1. Stop current backend if running',
      '2. Run: start-public.bat',
      '3. This will start backend with public network access',
      '4. Backend will be accessible on all network interfaces'
    ];
  }
  
  return ['Unknown environment - please check configuration'];
}

/**
 * Log environment status for debugging
 */
export function logEnvironmentStatus(): void {
  const env = getCurrentEnvironment();
  
  console.group('🌍 Environment Status');
  console.log('Type:', env.type);
  console.log('Hostname:', env.hostname);
  console.log('API Base URL:', env.apiBaseUrl);
  console.log('Fallback API URL:', env.fallbackApiUrl);
  console.log('Debug Mode:', env.debugMode);
  console.log('CORS Enabled:', env.corsEnabled);
  console.log('Backend Likely Accessible:', isBackendLikelyAccessible());
  console.groupEnd();
}

/**
 * Test API connectivity for current environment
 */
export async function testApiConnectivity(): Promise<{
  primary: boolean;
  fallback: boolean;
  error?: string;
}> {
  const env = getCurrentEnvironment();
  const result = { primary: false, fallback: false, error: undefined as string | undefined };
  
  // Test primary API
  try {
    const response = await fetch(`${env.apiBaseUrl}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    result.primary = response.ok;
    console.log(`✅ Primary API (${env.apiBaseUrl}):`, response.ok ? 'OK' : 'Failed');
  } catch (error) {
    console.log(`❌ Primary API (${env.apiBaseUrl}):`, error);
    result.error = error instanceof Error ? error.message : 'Unknown error';
  }
  
  // Test fallback API if available
  if (env.fallbackApiUrl) {
    try {
      const response = await fetch(`${env.fallbackApiUrl}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      result.fallback = response.ok;
      console.log(`✅ Fallback API (${env.fallbackApiUrl}):`, response.ok ? 'OK' : 'Failed');
    } catch (error) {
      console.log(`❌ Fallback API (${env.fallbackApiUrl}):`, error);
    }
  }
  
  return result;
}

/**
 * Initialize environment configuration
 * Call this early in the application lifecycle
 */
export function initializeEnvironment(): EnvironmentInfo {
  const env = detectEnvironment();
  
  // Log environment status
  logEnvironmentStatus();
  
  // Test connectivity in background (don't block)
  testApiConnectivity().then(result => {
    console.log('🔗 API Connectivity Test:', result);
    
    if (!result.primary && !result.fallback) {
      console.warn('⚠️ No API connectivity detected. Application will use fallback data.');
    }
  }).catch(error => {
    console.warn('⚠️ API connectivity test failed:', error);
  });
  
  return env;
}

/**
 * Get environment-specific configuration for components
 */
export function getComponentConfig() {
  const env = getCurrentEnvironment();
  
  return {
    // Refresh intervals based on environment
    refreshInterval: env.isLocal ? 10000 : 30000, // 10s local, 30s remote
    
    // Timeout settings
    apiTimeout: env.isLocal ? 5000 : 10000, // 5s local, 10s remote
    
    // Error handling
    showDetailedErrors: env.debugMode,
    
    // Notification settings
    showConnectivityNotifications: !env.isLocal,
    
    // Fallback behavior
    useFallbackData: true,
    
    // Logging level
    logLevel: env.debugMode ? 'debug' : 'info'
  };
}
