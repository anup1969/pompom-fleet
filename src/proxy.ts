import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route protection proxy (Next.js 16 — replaces middleware.ts).
 *
 * Checks for fleet_session cookie on protected routes.
 * Allows through: /login, /api/auth/*, /_next/*, /favicon.ico
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes through
  const publicPaths = [
    '/login',
    '/api/auth/',
    '/api/seed',
    '/_next/',
    '/favicon.ico',
  ];

  const isPublic = publicPaths.some((path) => pathname.startsWith(path));
  if (isPublic) {
    return NextResponse.next();
  }

  // If ?token= is present on ANY URL, redirect to auth endpoint
  const jwtToken = request.nextUrl.searchParams.get('token');
  if (jwtToken) {
    const authUrl = new URL('/api/auth/token', request.url);
    authUrl.searchParams.set('token', jwtToken);
    return NextResponse.redirect(authUrl);
  }

  // Check for session cookie
  const sessionToken = request.cookies.get('fleet_session')?.value;

  if (!sessionToken) {
    // No session — redirect to login
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Cookie exists — let the request through.
  // Full session validation happens in API routes / server components
  // to avoid async DB calls in proxy (edge-compatible, fast).
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
