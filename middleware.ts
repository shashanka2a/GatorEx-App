import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow access to auth pages and public browsing routes
    if (
      pathname.startsWith('/verify') ||
      pathname.startsWith('/verify-request') ||
      pathname.startsWith('/login-otp') ||
      pathname.startsWith('/auth/') ||
      pathname === '/' ||
      pathname === '/buy' ||
      pathname === '/sublease'
    ) {
      return NextResponse.next();
    }

    // Protected routes that require authentication
    const protectedRoutes = ['/sell', '/me', '/share'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute && !token) {
      return NextResponse.redirect(new URL('/verify', req.url));
    }

    // If user is signed in but not UF verified, redirect to verify
    if (token && !token.ufEmailVerified && pathname !== '/verify' && pathname !== '/login-otp') {
      return NextResponse.redirect(new URL('/verify', req.url));
    }

    // If user is UF verified but hasn't completed profile, redirect to complete-profile
    // Exception: allow access to /me page to view profile status
    if (token && token.ufEmailVerified && !token.profileCompleted && pathname !== '/complete-profile' && pathname !== '/me') {
      return NextResponse.redirect(new URL('/complete-profile', req.url));
    }

    // If user has completed profile but tries to access complete-profile, redirect to buy
    if (token && token.profileCompleted && pathname === '/complete-profile') {
      return NextResponse.redirect(new URL('/buy', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Public routes that don't require authentication
        const publicRoutes = [
          '/',
          '/buy',
          '/sublease',
          '/verify',
          '/verify-request',
          '/login-otp'
        ];
        
        // Allow access to public routes and static files
        if (
          publicRoutes.includes(pathname) ||
          pathname.startsWith('/api/auth/') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/favicon') ||
          pathname.startsWith('/logo') ||
          pathname.startsWith('/apple-touch-icon') ||
          pathname.startsWith('/manifest') ||
          pathname.includes('.')
        ) {
          return true;
        }

        // Protected routes require authentication
        const protectedRoutes = ['/sell', '/me', '/share'];
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
        
        if (isProtectedRoute) {
          return !!token;
        }

        // Default to allowing access for other routes
        return true;
      },
    },
  }
);

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