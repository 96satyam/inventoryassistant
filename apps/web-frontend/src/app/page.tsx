"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAuthState, isSessionInitialized } from "@/utils/authMiddleware"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if this is a fresh browser session (no session initialized)
    if (!isSessionInitialized()) {
      // Fresh session - redirect to login to initialize
      router.replace("/login")
      return
    }

    // Session is initialized - check authentication
    const authState = getAuthState()

    if (!authState.isAuthenticated || !authState.user) {
      // Session initialized but not authenticated - redirect to login
      router.replace("/login")
      return
    }

    // Valid authenticated session - redirect to dashboard
    router.replace("/dashboard")
  }, [router])

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-300">Redirecting...</p>
      </div>
    </div>
  )
}
