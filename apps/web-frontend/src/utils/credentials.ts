/**
 * Secure Credentials Storage
 * 
 * This file contains the authorized username/password combinations
 * for accessing the Solar Installer Admin application.
 * 
 * SECURITY NOTE: In a production environment, these credentials should be:
 * - Stored in environment variables
 * - Hashed using bcrypt or similar
 * - Managed through a proper authentication service
 */

export interface UserCredentials {
  username: string
  password: string
  role: 'admin' | 'user' | 'manager'
  name: string
  email?: string
  permissions: string[]
}

// Authorized user credentials
export const AUTHORIZED_USERS: Record<string, UserCredentials> = {
  'satyam': {
    username: 'Satyam',
    password: 'Satyam@123',
    role: 'admin',
    name: 'Satyam',
    email: 'satyam1@wattmonk.com',
    permissions: ['dashboard', 'inventory', 'procurement', 'forecast', 'activity', 'system-settings', 'profile']
  }
}

/**
 * Validate user credentials
 * @param username - The username to validate
 * @param password - The password to validate
 * @returns UserCredentials if valid, null if invalid
 */
export const validateCredentials = (username: string, password: string): UserCredentials | null => {
  const user = AUTHORIZED_USERS[username.toLowerCase()]
  
  if (!user) {
    return null
  }
  
  // Simple password comparison (in production, use proper hashing)
  if (user.password === password) {
    return user
  }
  
  return null
}

/**
 * Check if user has permission for a specific route
 * @param user - The user credentials
 * @param route - The route to check permission for
 * @returns boolean indicating if user has permission
 */
export const hasPermission = (user: UserCredentials, route: string): boolean => {
  return user.permissions.includes(route)
}

/**
 * Get all available routes for a user
 * @param user - The user credentials
 * @returns Array of routes the user can access
 */
export const getUserRoutes = (user: UserCredentials): string[] => {
  return user.permissions
}
