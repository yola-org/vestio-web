import { AUTH_DISPLAY_NAME_COOKIE, AUTH_INDICATOR_COOKIE } from "@/constants/auth"
import { AccountDisplayNameSchema } from "@/lib/api/schemas"

const AUTH_LOCAL_STORAGE_KEY = "vestio_was_authenticated"

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
  if (typeof document === "undefined") {
    return false
  }

  return document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith(`${AUTH_INDICATOR_COOKIE}=1`))
}

export function readAccountDisplayName() {
  if (!isAuthenticated()) return undefined

  const prefix = `${AUTH_DISPLAY_NAME_COOKIE}=`
  const cookie = document.cookie.split("; ").find((item) => item.startsWith(prefix))
  if (!cookie) return undefined

  try {
    return AccountDisplayNameSchema.safeParse(
      JSON.parse(decodeURIComponent(cookie.slice(prefix.length))),
    ).data
  } catch {
    return undefined
  }
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

/**
 * Mark user as having been authenticated (for tracking session expiry)
 */
export function markAuthenticated(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, "1")
    } catch {}
  }
}

/**
 * Check if user was previously authenticated
 */
export function wasAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false
  }
  try {
    return localStorage.getItem(AUTH_LOCAL_STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

/**
 * Clear authentication tracking
 */
export function clearAuthTracking(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY)
    } catch {}
  }
}

export function notifyAuthChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("vestio:auth-changed"))
  }
}
