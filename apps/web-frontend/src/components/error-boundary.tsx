'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error)
    console.error('🚨 Error Info:', errorInfo)
    console.error('🚨 Component Stack:', errorInfo.componentStack)
    console.error('🚨 Error Stack:', error.stack)
    console.error('🚨 Environment:', {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })

    this.setState({
      error,
      errorInfo
    })
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} retry={this.retry} />
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              An error occurred while loading this component. Please try refreshing the page.
            </p>
            <div className="space-y-2">
              <button
                onClick={this.retry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <details className="text-left">
                <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">
                  Error Details
                </summary>
                <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs overflow-auto max-h-32">
                  {this.state.error?.message}
                  {this.state.error?.stack}
                </pre>
              </details>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
