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
      referralCode = await createReferralCode(userId);
    }

    // Get summary data
    const summary = await getReferralSummary(userId);

    res.status(200).json({
      ...summary,
      referralCode: referralCode.code,
      referralLink: `${process.env.NEXTAUTH_URL}/signup?ref=${referralCode.code}`
    });

  } catch (error) {
    console.error('Referral summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}