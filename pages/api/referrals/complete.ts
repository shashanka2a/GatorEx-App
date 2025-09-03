import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/supabase';
import { 
  createReferral, 
  updateReferralStatus, 
  createReward, 
  updateLeaderboardPoints,
  getReferralCode 
} from '../../../src/lib/referrals/database';
import { 
  hashIP, 
  hashUserAgent, 
  isDisposableEmail 
} from '../../../src/lib/referrals/utils';
import { 
  REFERRAL_CONFIG, 
  REFERRAL_STATUS, 
  REWARD_TYPES 
} from '../../../src/lib/referrals/config';

// Rate limiting for completions
const completionCounts = new Map<string, { count: number; resetTime: number }>();

function checkCompletionRateLimit(): boolean {
  const now = Date.now();
  const minuteMs = 60 * 1000;
  const key = 'global';
  
  const current = completionCounts.get(key);
  if (!current || now > current.resetTime) {
    completionCounts.set(key, { count: 1, resetTime: now + minuteMs });
    return true;
  }
  
  if (current.count >= REFERRAL_CONFIG.limits.completionsPerMinute) {
    return false;
  }
  
  current.count++;
  return true;
}

async function validateReferral(
  referrerUserId: string, 
  refereeUserId: string, 
  refereeEmail: string,
  ipHash: string,
  uaHash: string
): Promise<{ valid: boolean; reason?: string }> {
  
  // Self-referral check
  if (referrerUserId === refereeUserId) {
    return { valid: false, reason: 'self-referral' };
  }

  // Disposable email check
  if (isDisposableEmail(refereeEmail)) {
    return { valid: false, reason: 'disposable-email' };
  }

  // Check for duplicate IP/UA within window
  const windowStart = new Date(Date.now() - REFERRAL_CONFIG.limits.duplicateWindowDays * 24 * 60 * 60 * 1000);
  
  const { data: recentSignups } = await supabase
    .from('referral_clicks')
    .select('*')
    .or(`ip_hash.eq.${ipHash},ua_hash.eq.${uaHash}`)
    .gte('ts', windowStart.toISOString());

  if (recentSignups && recentSignups.length > 0) {
    return { valid: false, reason: 'duplicate-device' };
  }

  // Check IP signup limit (24h)
  const dayStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const { count: ipSignups } = await supabase
    .from('referral_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('ts', dayStart.toISOString());

  if (ipSignups && ipSignups >= REFERRAL_CONFIG.limits.maxSignupsPerIP24h) {
    return { valid: false, reason: 'ip-limit-exceeded' };
  }

  return { valid: true };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      refereeUserId, 
      refereeEmail, 
      referralCode,
      ipHash,
      uaHash 
    } = req.body;

    if (!refereeUserId || !refereeEmail || !referralCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Rate limiting
    if (!checkCompletionRateLimit()) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Get referrer user ID from code
    const { data: codeData } = await supabase
      .from('referral_codes')
      .select('user_id')
      .eq('code', referralCode)
      .single();

    if (!codeData) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }

    const referrerUserId = codeData.user_id;

    // Validate referral
    const validation = await validateReferral(
      referrerUserId, 
      refereeUserId, 
      refereeEmail,
      ipHash,
      uaHash
    );

    // Create or update referral record
    const status = validation.valid ? REFERRAL_STATUS.verified : REFERRAL_STATUS.rejected;
    
    await createReferral(referralCode, referrerUserId, refereeUserId, status);
    
    if (!validation.valid) {
      await updateReferralStatus(refereeUserId, REFERRAL_STATUS.rejected, validation.reason);
      return res.status(200).json({ success: true, status: 'rejected', reason: validation.reason });
    }

    // Count verified referrals for referrer
    const { count: verifiedCount } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_user_id', referrerUserId)
      .eq('status', REFERRAL_STATUS.verified);

    const totalRefs = (verifiedCount || 0);

    // Update leaderboard points
    await updateLeaderboardPoints(referrerUserId, totalRefs);

    // Check for tier rewards
    const tier = REFERRAL_CONFIG.tiers.find(t => t.refs === totalRefs);
    if (tier) {
      await createReward(
        referrerUserId,
        tier.reward.type,
        tier.reward.amount_cents,
        tier.refs
      );
    }

    res.status(200).json({ 
      success: true, 
      status: 'verified',
      totalReferrals: totalRefs,
      tierUnlocked: tier ? tier.reward : null
    });

  } catch (error) {
    console.error('Referral completion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}