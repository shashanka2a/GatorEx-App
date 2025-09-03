import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/supabase';
import { getISOWeek } from '../../../src/lib/referrals/utils';
import { REFERRAL_STATUS } from '../../../src/lib/referrals/config';

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
    const weekId = getISOWeek();

    // Get all verified referrals for current week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
    weekStart.setHours(0, 0, 0, 0);

    const { data: weeklyReferrals, error: fetchError } = await supabase
      .from('referrals')
      .select('referrer_user_id')
      .eq('status', REFERRAL_STATUS.verified)
      .gte('ts', weekStart.toISOString());

    if (fetchError) {
      throw fetchError;
    }

    // Count referrals per user
    const userCounts = weeklyReferrals.reduce((acc, ref) => {
      acc[ref.referrer_user_id] = (acc[ref.referrer_user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort by points (descending) and assign ranks
    const sortedUsers = Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([userId, points], index) => ({
        week_id: weekId,
        user_id: userId,
        points,
        rank: index + 1,
        updated_at: new Date().toISOString()
      }));

    // Clear existing week data
    await supabase
      .from('leaderboard_week')
      .delete()
      .eq('week_id', weekId);

    // Insert new rankings
    if (sortedUsers.length > 0) {
      const { error: insertError } = await supabase
        .from('leaderboard_week')
        .insert(sortedUsers);

      if (insertError) {
        throw insertError;
      }
    }

    res.status(200).json({ 
      success: true, 
      weekId,
      usersRanked: sortedUsers.length,
      topUser: sortedUsers[0] || null
    });

  } catch (error) {
    console.error('Leaderboard rebuild error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}