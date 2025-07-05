/**
 * Debug utilities for authentication troubleshooting
 */

export const clearAllAuthData = () => {
  if (typeof window === 'undefined') return
  
  console.log('🧹 Clearing ALL authentication data from localStorage')
  
  // Clear all possible auth keys
  const authKeys = [
    'auth_state',
    'user_data', 
    'solar_auth_state',
    'solar_current_user',
    'authState',
    'currentUser',
    'token',
    'session'
  ]
  
  authKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`🗑️ Removing ${key}:`, localStorage.getItem(key))
      localStorage.removeItem(key)
    }
  })
  
  console.log('✅ All auth data cleared')
}

export const debugAuthState = () => {
  if (typeof window === 'undefined') return
  
  console.log('🔍 DEBUG: Current localStorage contents:')
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      const value = localStorage.getItem(key)
      console.log(`  ${key}:`, value)
    }
  }
}

export const forceLogout = () => {
  console.log('🚪 FORCE LOGOUT: Clearing all auth and redirecting')
  clearAllAuthData()

  // Dispatch auth change event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-state-changed'))
  }

  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

// Make debug functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).debugAuth = {
    clearAllAuthData,
    debugAuthState,
    forceLogout
  }
  console.log('🔧 Debug functions available: window.debugAuth.clearAllAuthData(), window.debugAuth.debugAuthState(), window.debugAuth.forceLogout()')
}
