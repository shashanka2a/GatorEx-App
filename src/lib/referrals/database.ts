import { supabase } from '../supabase';
import { REFERRAL_CONFIG, REFERRAL_STATUS, REWARD_STATUS } from './config';
import { generateReferralCode, getISOWeek } from './utils';

export async function createReferralCode(userId: string) {
  const code = generateReferralCode();
  
  const { data, error } = await supabase
    .from('referral_codes')
    .insert({ user_id: userId, code })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReferralCode(userId: string) {
  const { data, error } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function logReferralClick(code: string, ipHash: string, uaHash: string) {
  const { data, error } = await supabase
    .from('referral_clicks')
    .insert({ code, ip_hash: ipHash, ua_hash: uaHash })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createReferral(
  code: string, 
  referrerUserId: string, 
  refereeUserId: string, 
  status: string = REFERRAL_STATUS.clicked
) {
  const { data, error } = await supabase
    .from('referrals')
    .upsert({ 
      code, 
      referrer_user_id: referrerUserId, 
      referee_user_id: refereeUserId, 
      status 
    }, { 
      onConflict: 'referee_user_id' 
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateReferralStatus(
  refereeUserId: string, 
  status: string, 
  reason?: string
) {
  const { data, error } = await supabase
    .from('referrals')
    .update({ status, reason })
    .eq('referee_user_id', refereeUserId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReferralSummary(userId: string) {
  // Get user's referral code first
  const userCode = await getUserReferralCode(userId);
  
  // Get total clicks
  const { count: clicks } = await supabase
    .from('referral_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('code', userCode);

  // Get verified referrals
  const { data: verified, count: verifiedCount } = await supabase
    .from('referrals')
    .select('*', { count: 'exact' })
    .eq('referrer_user_id', userId)
    .eq('status', REFERRAL_STATUS.verified);

  // Get earned rewards
  const { data: rewards } = await supabase
    .from('rewards')
    .select('amount_cents')
    .eq('user_id', userId)
    .eq('status', REWARD_STATUS.approved);

  const earned = rewards?.reduce((sum, r) => sum + r.amount_cents, 0) || 0;

  // Get this week points
  const weekId = getISOWeek();
  const { data: weekData } = await supabase
    .from('leaderboard_week')
    .select('points')
    .eq('user_id', userId)
    .eq('week_id', weekId)
    .single();

  // Calculate next tier
  const currentRefs = verifiedCount || 0;
  const nextTier = REFERRAL_CONFIG.tiers.find(t => t.refs > currentRefs);

  return {
    clicks: clicks || 0,
    verified: verifiedCount || 0,
    earned,
    thisWeekPoints: weekData?.points || 0,
    nextTier: nextTier ? { refs: nextTier.refs, reward: nextTier.reward } : null
  };
}

export async function getLeaderboard(period: 'week' | 'all' = 'week', limit = 100) {
  if (period === 'week') {
    const weekId = getISOWeek();
    const { data, error } = await supabase
      .from('leaderboard_week')
      .select(`
        user_id,
        points,
        rank,
        users:user_id (email)
      `)
      .eq('week_id', weekId)
      .order('rank')
      .limit(limit);

    if (error) throw error;
    return data;
  } else {
    // All-time leaderboard from referrals table
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        referrer_user_id,
        users:referrer_user_id (email)
      `)
      .eq('status', REFERRAL_STATUS.verified);

    if (error) throw error;

    // Group by user and count
    const counts = data.reduce((acc, ref) => {
      acc[ref.referrer_user_id] = (acc[ref.referrer_user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([userId, points]) => ({
        user_id: userId,
        points,
        users: data.find(d => d.referrer_user_id === userId)?.users
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, limit)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }
}

export async function createReward(
  userId: string, 
  type: string, 
  amountCents: number, 
  tier: number
) {
  const { data, error } = await supabase
    .from('rewards')
    .insert({
      user_id: userId,
      type,
      amount_cents: amountCents,
      tier,
      source: 'referral',
      status: REWARD_STATUS.pending
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLeaderboardPoints(userId: string, points: number) {
  const weekId = getISOWeek();
  
  const { data, error } = await supabase
    .from('leaderboard_week')
    .upsert({
      week_id: weekId,
      user_id: userId,
      points,
      rank: 0, // Will be updated by rebuild job
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getUserReferralCode(userId: string): Promise<string> {
  const { data } = await supabase
    .from('referral_codes')
    .select('code')
    .eq('user_id', userId)
    .single();
  
  return data?.code || '';
}