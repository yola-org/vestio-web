import { AUTH_INDICATOR_COOKIE } from '@/constants/auth';

/**
 * Check if user is authenticated on the client side.
 * Reads the auth indicator cookie set by the server.
 * Note: This is for UI purposes only - always validate auth server-side.
 * 
 * @returns true if auth indicator cookie is present, false otherwise
 * 
 * @example
 * ```typescript
 * 'use client';
 * import { isAuthenticated } from '@/lib/auth';
 * 
 * if (isAuthenticated()) {
 *   // Show authenticated UI
 * }
 * ```
 */
export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.cookie
    .split('; ')
    .some((cookie) => cookie.startsWith(`${AUTH_INDICATOR_COOKIE}=1`));
}

/**
 * Dispatch an event to notify the app that authentication state has changed.
 * Components listening for 'vestio:auth-changed' will update their auth state.
 * 
 * @example
 * ```typescript
 * import { notifyAuthChanged } from '@/lib/auth';
 * import { useRouter } from 'next/navigation';
 * 
 * // After successful login
 * notifyAuthChanged();
 * router.refresh();
 * ```
 */
export function notifyAuthChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('vestio:auth-changed'));
  }
}