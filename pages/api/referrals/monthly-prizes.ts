import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/supabase';
import { getISOWeek } from '../../../src/lib/referrals/utils';
import { REFERRAL_CONFIG, REWARD_TYPES } from '../../../src/lib/referrals/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret for security
  const cronSecret = req.headers['x-cron-secret'];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthKey = `${lastMonth.getFullYear()}-${(lastMonth.getMonth() + 1).toString().padStart(2, '0')}`;

    // Get all weekly leaderboards from last month
    const monthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const monthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

    // Get all users who had 100+ referrals in the month
    const { data: eligibleUsers, error: fetchError } = await supabase
      .from('referrals')
      .select(`
        referrer_user_id,
        ts,
        users:referrer_user_id (email)
      `)
      .eq('status', 'verified')
      .gte('ts', monthStart.toISOString())
      .lte('ts', monthEnd.toISOString());

    if (fetchError) {
      throw fetchError;
    }

    // Count referrals per user for the month
    const userCounts = eligibleUsers.reduce((acc, ref) => {
      if (!acc[ref.referrer_user_id]) {
        acc[ref.referrer_user_id] = {
          count: 0,
          email: (ref as any).users?.email,
          earliestReferral: ref.ts
        };
      }
      acc[ref.referrer_user_id].count++;
      
      // Track earliest referral for tie-breaking
      if (ref.ts < acc[ref.referrer_user_id].earliestReferral) {
        acc[ref.referrer_user_id].earliestReferral = ref.ts;
      }
      
      return acc;
    }, {} as Record<string, { count: number; email: string; earliestReferral: string }>);

    // Filter users with 100+ referrals
    const qualifiedUsers = Object.entries(userCounts)
      .filter(([, data]) => data.count >= 100)
      .map(([userId, data]) => ({
        userId,
        referrals: data.count,
        email: data.email,
        earliestReferral: data.earliestReferral
      }));

    if (qualifiedUsers.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No qualified users for monthly prize',
        monthKey,
        qualifiedUsers: 0
      });
    }

    // Sort by referrals (desc), then by earliest referral (asc) for deterministic tie-breaking
    qualifiedUsers.sort((a, b) => {
      if (b.referrals !== a.referrals) {
        return b.referrals - a.referrals;
      }
      return new Date(a.earliestReferral).getTime() - new Date(b.earliestReferral).getTime();
    });

    const winner = qualifiedUsers[0];

    // Check if prize already awarded for this month
    const { data: existingPrize } = await supabase
      .from('monthly_prizes')
      .select('*')
      .eq('month_key', monthKey)
      .single();

    if (existingPrize) {
      return res.status(200).json({ 
        success: true, 
        message: 'Prize already awarded for this month',
        monthKey,
        winner: existingPrize
      });
    }

    // Create monthly prize record
    const { data: prize, error: prizeError } = await supabase
      .from('monthly_prizes')
      .insert({
        month_key: monthKey,
        winner_user_id: winner.userId,
        referrals_count: winner.referrals,
        prize_type: REWARD_TYPES.device,
        prize_amount_cents: 100000, // iPhone value
        awarded_at: now.toISOString()
      })
      .select()
      .single();

    if (prizeError) {
      throw prizeError;
    }

    // Create reward record
    const { error: rewardError } = await supabase
      .from('rewards')
      .insert({
        user_id: winner.userId,
        type: REWARD_TYPES.device,
        amount_cents: 100000,
        tier: 100,
        source: 'monthly_prize',
        status: 'approved'
      });

    if (rewardError) {
      throw rewardError;
    }

    res.status(200).json({ 
      success: true, 
      monthKey,
      winner: {
        userId: winner.userId,
        email: winner.email,
        referrals: winner.referrals
      },
      qualifiedUsers: qualifiedUsers.length,
      prizeId: prize.id
    });

  } catch (error) {
    console.error('Monthly prizes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}