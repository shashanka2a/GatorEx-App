import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists and get their referral code
    const result = await prisma.$queryRaw`
      SELECT u.id, u.email, u.name, rc.code
      FROM users u
      LEFT JOIN referral_codes rc ON u.id = rc.user_id
      WHERE u.email = ${email.toLowerCase()}
      LIMIT 1
    `;

    const user = Array.isArray(result) && result.length > 0 ? result[0] : null;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.code) {
      return res.status(404).json({ error: 'No referral code found for this user' });
    }

    // Return referral information
    res.status(200).json({
      hasAccount: true,
      referralCode: user.code,
      referralLink: `${process.env.NEXTAUTH_URL || 'https://gatorex.com'}/verify?ref=${user.code}`,
      userName: user.name || 'User'
    });

  } catch (error) {
    console.error('Public referral info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}