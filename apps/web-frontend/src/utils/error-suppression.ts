/**
 * Error suppression utilities for network environments
 * Prevents clipboard and network-related errors from cluttering console
 */

/**
 * Suppress clipboard-related errors in network environments
 */
export function suppressClipboardErrors(): void {
  // Override console.error to filter out clipboard errors
  const originalConsoleError = console.error;
  
  console.error = (...args: any[]) => {
    const message = args.join(' ').toLowerCase();
    
    // Suppress clipboard-related errors
    if (
      message.includes('copy to clipboard is not supported') ||
      message.includes('clipboard') ||
      message.includes('navigator.clipboard') ||
      message.includes('clipboard api') ||
      message.includes('clipboard not supported')
    ) {
      // Silently ignore clipboard errors
      return;
    }
    
    // Allow other errors through
    originalConsoleError.apply(console, args);
  };
}

/**
 * Suppress network-related fetch errors that are expected in offline mode
 */
export function suppressNetworkErrors(): void {
  // Override console.error to filter out expected network errors
  const originalConsoleError = console.error;
  
  console.error = (...args: any[]) => {
    const message = args.join(' ').toLowerCase();
    
    // Suppress expected network errors
    if (
      message.includes('failed to fetch') ||
      message.includes('network error') ||
      message.includes('fetch error') ||
      message.includes('connection refused') ||
      message.includes('cors error')
    ) {
      // Convert to warning for network errors
      console.warn('🌐 Network unavailable:', ...args);
      return;
    }
    
    // Allow other errors through
    originalConsoleError.apply(console, args);
  };
}

/**
 * Initialize error suppression for all environments
 */
export function initializeErrorSuppression(): void {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

    if (isLocalhost) {
      console.log('🏠 Local environment detected - minimal error suppression');
      // Only suppress clipboard errors on localhost
      suppressClipboardErrors();
    } else {
      console.log('🌐 Network environment detected - full error suppression');
      suppressClipboardErrors();
      suppressNetworkErrors();
    }

    // Always setup global error handlers for clipboard issues
    setupGlobalErrorHandler();
  }
}

/**
 * Safe clipboard check that doesn't throw errors
 */
export function isClipboardAvailable(): boolean {
  try {
    return (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function' &&
      window.isSecureContext
    );
  } catch (error) {
    return false;
  }
}

/**
 * Global error handler for unhandled clipboard errors
 */
export function setupGlobalErrorHandler(): void {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      const message = event.message?.toLowerCase() || '';
      
      if (
        message.includes('clipboard') ||
        message.includes('copy to clipboard is not supported')
      ) {
        // Prevent clipboard errors from showing
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      const message = event.reason?.message?.toLowerCase() || '';
      
      if (
        message.includes('clipboard') ||
        message.includes('copy to clipboard is not supported')
      ) {
        // Prevent clipboard promise rejections from showing
        event.preventDefault();
        return false;
      }
    });
  }
}
