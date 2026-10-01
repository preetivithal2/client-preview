// proxy.ts
// Route protection — checks for session cookie set after Firebase login
// Prevents CDN caching to avoid stale redirects across browsers/devices
// (Next.js 16+ uses proxy.ts instead of middleware.ts)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/signin', '/signup'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes, static files, and API routes only
  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const session = request.cookies.get('session')?.value;

  if (!session) {
    const url = new URL('/signin', request.url);
    url.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(url);
    // Prevent caching — redirects must always be fresh
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  const response = NextResponse.next();
  // Prevent caching of protected pages
  response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
