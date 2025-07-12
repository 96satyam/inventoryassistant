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
            You're accessing the application from a public URL. The backend is only accessible locally, so the application is using mock data to maintain functionality.
          </p>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Server className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800 dark:text-orange-200">
                Quick Fix
              </span>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
              The application is currently using mock data. For real data access from public networks, the backend needs to be configured for external access.
            </p>
            <div className="bg-slate-900 rounded p-3 text-sm font-mono text-green-400">
              # Backend needs public network configuration
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-slate-900 dark:text-white flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>Steps:</span>
            </h4>
            <ol className="text-sm text-slate-600 dark:text-slate-300 space-y-1 ml-6">
              <li>1. The application is using mock data for demonstration</li>
              <li>2. All features remain functional with sample data</li>
              <li>3. Local network access provides real data</li>
            </ol>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Continue with Demo Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
