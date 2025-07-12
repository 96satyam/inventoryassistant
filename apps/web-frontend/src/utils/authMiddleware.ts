/**
 * Authentication Middleware
 * 
 * Provides authentication state management and route protection
 * for the Solar Installer Admin application.
 */

import { validateCredentials, type UserCredentials, hasPermission } from './credentials'
import { isSsoAuthenticated } from '@/services/sso'

export interface AuthState {
  isAuthenticated: boolean
  user: UserCredentials | null
  isLoading: boolean
  authMethod?: 'credentials' | 'sso'
}

// Local storage keys
const AUTH_STORAGE_KEY = 'solar_auth_state'
const USER_STORAGE_KEY = 'solar_current_user'
const SESSION_INIT_KEY = 'solar_session_initialized'

/**
 * Get current authentication state from sessionStorage
 * Returns unauthenticated state if no session data exists
 */
export const getAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, isLoading: true }
  }

  try {
    // Check for SSO authentication first
    if (isSsoAuthenticated()) {
      const ssoUserData = {
        username: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || '',
        role: localStorage.getItem('role') || 'user',
        permissions: ['read', 'write'] // Default permissions for SSO users
      }

      return {
        isAuthenticated: true,
        user: ssoUserData as UserCredentials,
        isLoading: false,
        authMethod: 'sso'
      }
    }

    // Use sessionStorage for regular credential-based auth
    const authState = sessionStorage.getItem(AUTH_STORAGE_KEY)
    const userData = sessionStorage.getItem(USER_STORAGE_KEY)

    if (authState && userData) {
      const parsedAuthState = JSON.parse(authState)
      const parsedUserData = JSON.parse(userData)

      return {
        isAuthenticated: parsedAuthState.isAuthenticated || false,
        user: parsedUserData,
        isLoading: false,
        authMethod: 'credentials'
      }
    }
  } catch (error) {
    console.error('Error reading auth state:', error)
  }

  // Always return unauthenticated if no valid session data
  return { isAuthenticated: false, user: null, isLoading: false }
}

/**
 * Save authentication state to sessionStorage (not localStorage)
 * This ensures credentials don't persist across browser sessions
 */
export const saveAuthState = (authState: AuthState): void => {
  if (typeof window === 'undefined') return

  try {
    // Use sessionStorage instead of localStorage for session-only persistence
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading
    }))

    if (authState.user) {
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authState.user))
    } else {
      sessionStorage.removeItem(USER_STORAGE_KEY)
    }

    // Dispatch custom event to notify components of auth state change
    window.dispatchEvent(new CustomEvent('auth-state-changed'))
  } catch (error) {
    console.error('Error saving auth state:', error)
  }
}

/**
 * Check if session has been initialized (user has visited login page)
 */
export const isSessionInitialized = (): boolean => {
  if (typeof window === 'undefined') return false

  try {
    return sessionStorage.getItem(SESSION_INIT_KEY) === 'true'
  } catch (error) {
    return false
  }
}

/**
 * Mark session as initialized
 */
export const initializeSession = (): void => {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.setItem(SESSION_INIT_KEY, 'true')
  } catch (error) {
    console.error('Error initializing session:', error)
  }
}

/**
 * Clear authentication state from sessionStorage
 */
export const clearAuthState = (): void => {
  if (typeof window === 'undefined') return

  try {
    // Clear from both sessionStorage and localStorage for complete cleanup
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem(USER_STORAGE_KEY)
    sessionStorage.removeItem(SESSION_INIT_KEY)
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing auth state:', error)
  }
}

/**
 * Authenticate user with username and password
 */
export const authenticateUser = async (username: string, password: string): Promise<{
  success: boolean
  user?: UserCredentials
  message: string
}> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  const user = validateCredentials(username, password)

  if (user) {
    const authState: AuthState = {
      isAuthenticated: true,
      user,
      isLoading: false
    }

    saveAuthState(authState)

    return {
      success: true,
      user,
      message: 'Login successful'
    }
  }

  return {
    success: false,
    message: 'Invalid username or password'
  }
}

/**
 * Sign out user
 */
export const signOutUser = async (): Promise<{ success: boolean; message: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  clearAuthState()
  
  return {
    success: true,
    message: 'Signed out successfully'
  }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const authState = getAuthState()
  return authState.isAuthenticated && authState.user !== null
}

/**
 * Get current user
 */
export const getCurrentUser = (): UserCredentials | null => {
  const authState = getAuthState()
  return authState.user
}

/**
 * Check if current user has permission for a route
 */
export const checkRoutePermission = (route: string): boolean => {
  const user = getCurrentUser()
  if (!user) return false
  
  return hasPermission(user, route)
}

/**
 * Get redirect URL based on authentication status
 */
export const getRedirectUrl = (currentPath: string): string => {
  const authenticated = isAuthenticated()
  
  if (!authenticated && currentPath !== '/login') {
    return '/login'
  }
  
  if (authenticated && currentPath === '/login') {
    return '/dashboard'
  }
  
  return currentPath
}
