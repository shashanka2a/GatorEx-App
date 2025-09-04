import { getSession } from 'next-auth/react';

/**
 * Simple client-side auth check for protected pages
 * Returns where to redirect if auth is incomplete
 */
export async function checkClientAuthAndTerms() {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return { redirectTo: '/verify' };
    }

    if (!session.user.termsAccepted || !session.user.privacyAccepted) {
      return { redirectTo: '/terms' };
    }

    if (!session.user.profileCompleted) {
      return { redirectTo: '/complete-profile' };
    }

    return { redirectTo: null };
  } catch (error) {
    console.error('Client auth check error:', error);
    return { redirectTo: '/verify' };
  }
}