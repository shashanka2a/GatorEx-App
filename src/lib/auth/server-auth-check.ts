import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../pages/api/auth/[...nextauth]';

/**
 * Simple API auth check that includes terms validation
 * Only checks if user is fully authenticated (including terms)
 */
export async function checkApiAuthAndTerms(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return {
        error: 'Authentication required',
        status: 401,
        user: null
      };
    }

    // For API routes, user must have completed the full auth flow
    if (!session.user.termsAccepted || !session.user.privacyAccepted || !session.user.profileCompleted) {
      return {
        error: 'Please complete your account setup to use this feature',
        status: 403,
        user: null
      };
    }

    return {
      error: null,
      status: 200,
      user: session.user
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return {
      error: 'Internal server error',
      status: 500,
      user: null
    };
  }
}