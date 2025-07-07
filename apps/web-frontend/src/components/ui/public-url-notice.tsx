'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, Server, Play } from 'lucide-react'

interface PublicUrlNoticeProps {
  show: boolean
  onClose: () => void
}

export default function PublicUrlNotice({ show, onClose }: PublicUrlNoticeProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
    }
  }, [show])

  if (!isVisible) return null

  const handleClose = () => {
    setIsVisible(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Backend Configuration Required
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            You're accessing the application from a public URL, but the backend is only configured for local access.
          </p>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Server className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800 dark:text-orange-200">
                Quick Fix
              </span>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
              To enable public network access, restart the backend in public mode:
            </p>
            <div className="bg-slate-900 rounded p-3 text-sm font-mono text-green-400">
              start-public.bat
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-slate-900 dark:text-white flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>Steps:</span>
            </h4>
            <ol className="text-sm text-slate-600 dark:text-slate-300 space-y-1 ml-6">
              <li>1. Close the current backend server</li>
              <li>2. Run <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">start-public.bat</code></li>
              <li>3. Refresh this page</li>
            </ol>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Continue with Mock Data
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
