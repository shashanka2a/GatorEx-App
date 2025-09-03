import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getReferralSummary, getReferralCode, createReferralCode } from '../../../src/lib/referrals/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.id;

    // Ensure user has a referral code
    let referralCode = await getReferralCode(userId);
    if (!referralCode) {
      try {
        referralCode = await createReferralCode(userId);
      } catch (codeError) {
        // If creating referral code fails, return basic summary without code
        return res.status(200).json({
          clicks: 0,
          verified: 0,
          earned: 0,
          thisWeekPoints: 0,
          nextTier: null,
          referralCode: null,
          referralLink: null,
          error: 'Could not generate referral code'
        });
      }
    }

    // Get summary data with fallback
    let summary;
    try {
      summary = await getReferralSummary(userId);
    } catch (summaryError) {
      // Return default summary if database query fails
      summary = {
        clicks: 0,
        verified: 0,
        earned: 0,
        thisWeekPoints: 0,
        nextTier: null
      };
    }

    res.status(200).json({
      ...summary,
      referralCode: referralCode?.code || null,
      referralLink: referralCode?.code ? `${process.env.NEXTAUTH_URL}/verify?ref=${referralCode.code}` : null
    });

  } catch (error) {
    // Return a basic response instead of 500 error
    res.status(200).json({
      clicks: 0,
      verified: 0,
      earned: 0,
      thisWeekPoints: 0,
      nextTier: null,
      referralCode: null,
      referralLink: null,
      error: 'Service temporarily unavailable'
    });
  }
}