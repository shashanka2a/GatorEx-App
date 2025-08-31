import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow access to auth pages and public routes
    if (
      pathname.startsWith('/verify') ||
      pathname.startsWith('/verify-request') ||
      pathname.startsWith('/auth/') ||
      pathname === '/'
    ) {
      return NextResponse.next();
    }

    // If user is signed in but not UF verified, redirect to verify
    if (token && !token.ufEmailVerified && pathname !== '/verify') {
      return NextResponse.redirect(new URL('/verify', req.url));
    }

    // If user is UF verified but hasn't completed profile, redirect to complete-profile
    if (token && token.ufEmailVerified && !token.profileCompleted && pathname !== '/complete-profile') {
      return NextResponse.redirect(new URL('/complete-profile', req.url));
    }

    // If user has completed profile but tries to access complete-profile, redirect to buy
    if (token && token.profileCompleted && pathname === '/complete-profile') {
      return NextResponse.redirect(new URL('/buy', req.url));
    }

    // Block access to sell page if not verified
    if (pathname === '/sell' && (!token || !token.ufEmailVerified)) {
      return NextResponse.redirect(new URL('/verify', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public routes
        if (
          pathname === '/' ||
          pathname.startsWith('/verify') ||
          pathname.startsWith('/verify-request') ||
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

        // Require authentication for all other routes
        return !!token;
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