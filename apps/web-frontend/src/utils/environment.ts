/**
 * Environment Detection Utilities
 * Helps determine deployment context for proper API configuration
 */

export interface EnvironmentInfo {
  isLocal: boolean;
  isNetwork: boolean;
  isPublic: boolean;
  hostname: string;
  protocol: string;
  deploymentType: 'local' | 'network' | 'public';
}

/**
 * Detect the current environment context
 */
export function detectEnvironment(): EnvironmentInfo {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return {
      isLocal: true,
      isNetwork: false,
      isPublic: false,
      hostname: 'localhost',
      protocol: 'http:',
      deploymentType: 'local'
    };
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  const isNetwork = hostname.startsWith('192.168.') || 
                   hostname.startsWith('10.') || 
                   hostname.startsWith('172.16.') ||
                   hostname.startsWith('172.17.') ||
                   hostname.startsWith('172.18.') ||
                   hostname.startsWith('172.19.') ||
                   hostname.startsWith('172.20.') ||
                   hostname.startsWith('172.21.') ||
                   hostname.startsWith('172.22.') ||
                   hostname.startsWith('172.23.') ||
                   hostname.startsWith('172.24.') ||
                   hostname.startsWith('172.25.') ||
                   hostname.startsWith('172.26.') ||
                   hostname.startsWith('172.27.') ||
                   hostname.startsWith('172.28.') ||
                   hostname.startsWith('172.29.') ||
                   hostname.startsWith('172.30.') ||
                   hostname.startsWith('172.31.');
  
  const isPublicIP = !isLocal && !isNetwork && hostname.match(/^\d+\.\d+\.\d+\.\d+$/);
  const isPublicDomain = !isLocal && !isNetwork && !isPublicIP;
  const isPublic = isPublicIP || isPublicDomain;

  let deploymentType: 'local' | 'network' | 'public' = 'local';
  if (isPublic) {
    deploymentType = 'public';
  } else if (isNetwork) {
    deploymentType = 'network';
  }

  return {
    isLocal,
    isNetwork,
    isPublic,
    hostname,
    protocol,
    deploymentType
  };
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  const env = detectEnvironment();
  
  return {
    ...env,
    apiPort: 8003,
    frontendPort: 3000,
    corsEnabled: !env.isLocal, // Enable CORS for non-local access
    debugMode: env.isLocal,
    logLevel: env.isLocal ? 'debug' : 'info'
  };
}

/**
 * Log environment information for debugging
 */
export function logEnvironmentInfo(): void {
  const env = detectEnvironment();
  const config = getEnvironmentConfig();
  
  console.group('🌐 Environment Detection');
  console.log('Deployment Type:', env.deploymentType);
  console.log('Hostname:', env.hostname);
  console.log('Protocol:', env.protocol);
  console.log('Is Local:', env.isLocal);
  console.log('Is Network:', env.isNetwork);
  console.log('Is Public:', env.isPublic);
  console.log('API Port:', config.apiPort);
  console.log('CORS Enabled:', config.corsEnabled);
  console.groupEnd();
}
