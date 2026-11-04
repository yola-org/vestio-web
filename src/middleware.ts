import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_INDICATOR_COOKIE } from './constants/auth';

const PUBLIC_PATHS = ['/welcome', '/login', '/register'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Check auth
  const authIndicator = request.cookies.get(AUTH_INDICATOR_COOKIE);
  const hasAuth = authIndicator?.value === '1';
  
  if (!hasAuth) {
    // Not authenticated, redirect to welcome
    const url = request.nextUrl.clone();
    url.pathname = '/welcome';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
