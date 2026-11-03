import { AUTH_INDICATOR_COOKIE } from '@/constants/auth';

export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.cookie
    .split('; ')
    .some((cookie) => cookie.startsWith(`${AUTH_INDICATOR_COOKIE}=1`));
}

export function notifyAuthChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('vestio:auth-changed'));
  }
}