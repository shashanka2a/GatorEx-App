import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  // Handle referral tracking
  const ref = req.nextUrl.searchParams.get('ref');
  if (ref) {
    // Set referral cookie with 30-day expiry
    response.cookies.set('gex_ref', ref, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    // Log the click (fire and forget)
    fetch(`${req.nextUrl.origin}/api/referrals/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: ref })
    }).catch(() => {}); // Ignore errors
  }

  // Check if user has a session cookie
  const sessionToken = req.cookies.get('next-auth.session-token')?.value ||
    req.cookies.get('__Secure-next-auth.session-token')?.value;

  // Allow access to auth pages and public browsing routes
  if (
    pathname.startsWith('/verify') ||
    pathname.startsWith('/verify-request') ||
    pathname.startsWith('/login-otp') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/apple-touch-icon') ||
    pathname.startsWith('/manifest') ||
    pathname.includes('.') ||
    pathname === '/' ||
    pathname === '/buy' ||
    pathname === '/sublease' ||
    pathname === '/referrals'
  ) {
    return response;
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/sell', '/me', '/share', '/complete-profile'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL('/verify', req.url));
  }

  // For now, if user has a session token, let them through
  // The individual pages will handle more specific checks
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};