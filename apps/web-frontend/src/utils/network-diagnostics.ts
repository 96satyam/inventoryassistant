/**
 * Network Diagnostics Utility
 * Helps identify network-specific issues on public URL deployment
 */

import { getApiBaseUrl } from '@/lib/api-config'

export interface NetworkDiagnostics {
  environment: 'local' | 'network' | 'public'
  hostname: string
  protocol: string
  apiBaseUrl: string
  userAgent: string
  timestamp: string
  connectivity: {
    backend: boolean
    frontend: boolean
    cors: boolean
  }
  errors: string[]
}

/**
 * Detect the current environment
 */
export function detectEnvironment(): 'local' | 'network' | 'public' {
  if (typeof window === 'undefined') return 'local'
  
  const hostname = window.location.hostname
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'local'
  } else if (hostname.startsWith('192.168.') || hostname.startsWith('172.') || hostname.startsWith('10.')) {
    return 'network'
  } else {
    return 'public'
  }
}

/**
 * Test backend connectivity
 */
export async function testBackendConnectivity(): Promise<{ success: boolean; error?: string; status?: number }> {
  try {
    const apiUrl = getApiBaseUrl()
    console.log('🔍 Testing backend connectivity:', apiUrl)
    
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    })
    
    if (response.ok) {
      console.log('✅ Backend connectivity: SUCCESS')
      return { success: true, status: response.status }
    } else {
      console.error('❌ Backend connectivity: FAILED', response.status)
      return { success: false, status: response.status, error: `HTTP ${response.status}` }
    }
  } catch (error) {
    console.error('❌ Backend connectivity: ERROR', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Test CORS configuration (simplified for local development)
 */
export async function testCorsConfiguration(): Promise<{ success: boolean; error?: string }> {
  try {
    const environment = detectEnvironment()

    // Skip CORS testing on localhost - it's not needed
    if (environment === 'local') {
      console.log('🔍 CORS testing skipped for local environment')
      return { success: true }
    }

    const apiUrl = getApiBaseUrl()
    console.log('🔍 Testing CORS configuration:', apiUrl)

    // Use a simple GET request instead of OPTIONS to avoid preflight issues
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors'
    })

    // Check if the request succeeded - if it did, CORS is working
    if (response.ok) {
      console.log('✅ CORS configuration: SUCCESS')
      return { success: true }
    } else {
      console.log('⚠️ CORS configuration: Partial success (request completed but non-200 status)')
      return { success: true } // Still consider it success if request went through
    }
  } catch (error) {
    console.error('❌ CORS configuration: ERROR', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Run comprehensive network diagnostics
 */
export async function runNetworkDiagnostics(): Promise<NetworkDiagnostics> {
  console.log('🔍 Starting network diagnostics...')
  
  const environment = detectEnvironment()
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown'
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'unknown'
  const apiBaseUrl = getApiBaseUrl()
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  const timestamp = new Date().toISOString()
  
  const errors: string[] = []
  
  // Test backend connectivity
  const backendTest = await testBackendConnectivity()
  if (!backendTest.success) {
    errors.push(`Backend connectivity failed: ${backendTest.error}`)
  }
  
  // Test CORS configuration
  const corsTest = await testCorsConfiguration()
  if (!corsTest.success) {
    errors.push(`CORS configuration failed: ${corsTest.error}`)
  }
  
  const diagnostics: NetworkDiagnostics = {
    environment,
    hostname,
    protocol,
    apiBaseUrl,
    userAgent,
    timestamp,
    connectivity: {
      backend: backendTest.success,
      frontend: true, // If this code runs, frontend is working
      cors: corsTest.success
    },
    errors
  }
  
  console.log('🔍 Network diagnostics completed:', diagnostics)
  return diagnostics
}

/**
 * Log diagnostics to console in a formatted way
 */
export function logDiagnostics(diagnostics: NetworkDiagnostics) {
  console.group('🔍 Network Diagnostics Report')
  console.log('Environment:', diagnostics.environment)
  console.log('Hostname:', diagnostics.hostname)
  console.log('Protocol:', diagnostics.protocol)
  console.log('API Base URL:', diagnostics.apiBaseUrl)
  console.log('User Agent:', diagnostics.userAgent)
  console.log('Timestamp:', diagnostics.timestamp)
  console.log('Connectivity:', diagnostics.connectivity)
  if (diagnostics.errors.length > 0) {
    console.error('Errors:', diagnostics.errors)
  }
  console.groupEnd()
}

/**
 * Auto-run diagnostics on page load (for debugging)
 */
export function autoRunDiagnostics() {
  if (typeof window !== 'undefined') {
    // Run diagnostics after a short delay to allow page to load
    setTimeout(async () => {
      const diagnostics = await runNetworkDiagnostics()
      logDiagnostics(diagnostics)
    }, 2000)
  }
}
