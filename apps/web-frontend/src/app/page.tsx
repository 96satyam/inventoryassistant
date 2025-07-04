"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Automatically redirect to dashboard on page load
    router.replace("/dashboard")
  }, [router])

  // Show a brief loading message while redirecting
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Redirecting to Dashboard...
          </span>
        </div>
      </div>
    </div>
  )
}
