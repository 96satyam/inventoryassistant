/**
 * Safe clipboard utilities with fallback handling
 * Prevents "Copy to clipboard is not supported in this browser" errors
 */

/**
 * Check if clipboard API is available
 */
export function isClipboardSupported(): boolean {
  try {
    return (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function' &&
      window.isSecureContext // Clipboard API requires secure context
    );
  } catch (error) {
    // Silently handle any errors
    return false;
  }
}

/**
 * Safely copy text to clipboard with fallback
 * @param text - Text to copy
 * @returns Promise<boolean> - Success status
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Check if clipboard API is available
    if (isClipboardSupported()) {
      await navigator.clipboard.writeText(text);
      console.log('✅ Text copied to clipboard via Clipboard API');
      return true;
    }

    // Fallback method for older browsers
    return copyToClipboardFallback(text);
  } catch (error) {
    // Silently try fallback without logging errors to avoid console spam
    return copyToClipboardFallback(text);
  }
}

/**
 * Fallback clipboard copy method using document.execCommand
 * @param text - Text to copy
 * @returns boolean - Success status
 */
function copyToClipboardFallback(text: string): boolean {
  try {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);

    // Select and copy the text
    textarea.focus();
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (successful) {
      console.log('✅ Text copied to clipboard via fallback method');
      return true;
    } else {
      // Silently fail without logging errors
      return false;
    }
  } catch (error) {
    // Silently fail without logging errors
    return false;
  }
}

/**
 * Safe clipboard copy with user feedback
 * @param text - Text to copy
 * @param onSuccess - Success callback
 * @param onError - Error callback
 */
export async function copyWithFeedback(
  text: string,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<void> {
  const success = await copyToClipboard(text);
  
  if (success) {
    onSuccess?.();
  } else {
    const errorMessage = isClipboardSupported() 
      ? 'Failed to copy to clipboard'
      : 'Clipboard not supported in this browser';
    onError?.(errorMessage);
  }
}

/**
 * Get clipboard permissions status
 */
export async function getClipboardPermissions(): Promise<PermissionState | 'unsupported'> {
  try {
    if (typeof navigator !== 'undefined' && navigator.permissions && window.isSecureContext) {
      const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
      return permission.state;
    }
    return 'unsupported';
  } catch (error) {
    // Silently fail without logging errors
    return 'unsupported';
  }
}
