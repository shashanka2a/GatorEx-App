import { NextApiRequest, NextApiResponse } from 'next';
import { logReferralClick } from '../../../src/lib/referrals/database';
import { hashIP, hashUserAgent, getClientIP, getUserAgent } from '../../../src/lib/referrals/utils';
import { REFERRAL_CONFIG } from '../../../src/lib/referrals/config';

// Rate limiting store (in production, use Redis)
const clickCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  
  const current = clickCounts.get(ipHash);
  if (!current || now > current.resetTime) {
    clickCounts.set(ipHash, { count: 1, resetTime: now + hourMs });
    return true;
  }
  
  if (current.count >= REFERRAL_CONFIG.limits.clicksPerHour) {
    return false;
  }
  
  current.count++;
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Referral code required' });
    }

    const ip = getClientIP(req);
    const ua = getUserAgent(req);
    
    const ipHash = hashIP(ip);
    const uaHash = hashUserAgent(ua);

    // Rate limiting
    if (!checkRateLimit(ipHash)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Log the click
    await logReferralClick(code, ipHash, uaHash);

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Referral click error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}