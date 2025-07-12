'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Shell from './shell'
import { getAuthState } from '@/lib/authMiddleware'
// Temporarily disabled to fix RSC bundler conflicts
// import {
//   initializeErrorSuppression,
//   setupGlobalErrorHandler
// } from '@/utils/error-suppression'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Routes that don't require authentication
  const publicRoutes = ['/login']
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    // Temporarily disable error suppression to fix RSC bundler conflicts
    // initializeErrorSuppression()
    // setupGlobalErrorHandler()

    const checkAuth = () => {
      const authState = getAuthState()
      setIsAuthenticated(authState.isAuthenticated)
      setIsLoading(false)
    }

    // Initial check
    checkAuth()

    // Listen for auth state changes (storage events from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_state') {
        checkAuth()
      }
    }

    // Listen for custom auth events (same tab)
    const handleAuthChange = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('auth-state-changed', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-state-changed', handleAuthChange)
    }
  }, [])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  // For public routes (like login), don't show Shell
  if (isPublicRoute) {
    return <>{children}</>
  }

  // For protected routes, show Shell only if authenticated
  if (isAuthenticated) {
    return <Shell>{children}</Shell>
  }

  // If not authenticated and trying to access protected route,
  // the page components will handle redirecting to login
  return <>{children}</>
}
