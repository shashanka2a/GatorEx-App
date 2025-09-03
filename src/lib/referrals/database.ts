import { PrismaClient } from '@prisma/client';
import { REFERRAL_CONFIG, REFERRAL_STATUS, REWARD_STATUS } from './config';
import { generateReferralCode, getISOWeek } from './utils';

const prisma = new PrismaClient();

export async function createReferralCode(userId: string) {
  const code = generateReferralCode();
  
  try {
    await prisma.$executeRaw`
      INSERT INTO referral_codes (user_id, code) 
      VALUES (${userId}, ${code})
      ON CONFLICT (user_id) DO UPDATE SET code = ${code};
    `;

    // Get the created record
    const result = await prisma.$queryRaw`
      SELECT * FROM referral_codes WHERE user_id = ${userId};
    `;

    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    console.error('Error creating referral code:', error);
    throw error;
  }
}

export async function getReferralCode(userId: string) {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM referral_codes WHERE user_id = ${userId} LIMIT 1;
    `;
    
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting referral code:', error);
    return null;
  }
}

export async function logReferralClick(code: string, ipHash: string, uaHash: string) {
  try {
    const result = await prisma.$queryRaw`
      INSERT INTO referral_clicks (code, ip_hash, ua_hash) 
      VALUES (${code}, ${ipHash}, ${uaHash})
      RETURNING *;
    `;
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    console.error('Error logging referral click:', error);
    throw error;
  }
}

export async function createReferral(
  code: string, 
  referrerUserId: string, 
  refereeUserId: string, 
  status: string = REFERRAL_STATUS.clicked
) {
  try {
    const result = await prisma.$queryRaw`
      INSERT INTO referrals (code, referrer_user_id, referee_user_id, status) 
      VALUES (${code}, ${referrerUserId}, ${refereeUserId}, ${status})
      ON CONFLICT (referee_user_id) DO UPDATE SET 
        code = ${code}, 
        referrer_user_id = ${referrerUserId}, 
        status = ${status}
      RETURNING *;
    `;
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    console.error('Error creating referral:', error);
    throw error;
  }
}

export async function updateReferralStatus(
  refereeUserId: string, 
  status: string, 
  reason?: string
) {
  try {
    const result = await prisma.$queryRaw`
      UPDATE referrals 
      SET status = ${status}, reason = ${reason || null}
      WHERE referee_user_id = ${refereeUserId}
      RETURNING *;
    `;
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    console.error('Error updating referral status:', error);
    throw error;
  }
}

export async function getReferralSummary(userId: string) {
  try {
    // Get user's referral code first
    const userCode = await getUserReferralCode(userId);
    
    // Get total clicks
    const clicks = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*) as count FROM referral_clicks WHERE code = ${userCode};
    `;
    const clickCount = clicks[0]?.count || 0;

    // Get verified referrals
    const verified = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*) as count FROM referrals 
      WHERE referrer_user_id = ${userId} AND status = ${REFERRAL_STATUS.verified};
    `;
    const verifiedCount = Number(verified[0]?.count || 0);

    // Get earned rewards
    const rewards = await prisma.$queryRaw<Array<{ amount_cents: number }>>`
      SELECT amount_cents FROM rewards 
      WHERE user_id = ${userId} AND status = ${REWARD_STATUS.approved};
    `;
    const earned = rewards?.reduce((sum: number, r: any) => sum + (r.amount_cents || 0), 0) || 0;

    // Get this week points
    const weekId = getISOWeek();
    const weekData = await prisma.$queryRaw<Array<{ points: number }>>`
      SELECT points FROM leaderboard_week 
      WHERE user_id = ${userId} AND week_id = ${weekId} LIMIT 1;
    `;
    const thisWeekPoints = weekData[0]?.points || 0;

    // Calculate next tier
    const currentRefs = verifiedCount || 0;
    const nextTier = REFERRAL_CONFIG.tiers.find(t => t.refs > currentRefs);

    return {
      clicks: clickCount,
      verified: verifiedCount,
      earned,
      thisWeekPoints,
      nextTier: nextTier ? { refs: nextTier.refs, reward: nextTier.reward } : null
    };
  } catch (error) {
    console.error('Error getting referral summary:', error);
    throw error;
  }
}

export async function getLeaderboard(period: 'week' | 'all' = 'week', limit = 100) {
  try {
    if (period === 'week') {
      const weekId = getISOWeek();
      const result = await prisma.$queryRaw<Array<{
        user_id: string;
        points: number;
        rank: number;
        email: string;
      }>>`
        SELECT lw.user_id, lw.points, lw.rank, u.email
        FROM leaderboard_week lw
        JOIN users u ON lw.user_id = u.id
        WHERE lw.week_id = ${weekId}
        ORDER BY lw.rank
        LIMIT ${limit};
      `;
      
      return result.map(row => ({
        user_id: row.user_id,
        points: row.points,
        rank: row.rank,
        users: { email: row.email }
      }));
    } else {
      // All-time leaderboard from referrals table
      const result = await prisma.$queryRaw<Array<{
        referrer_user_id: string;
        email: string;
        count: number;
      }>>`
        SELECT r.referrer_user_id, u.email, COUNT(*) as count
        FROM referrals r
        JOIN users u ON r.referrer_user_id = u.id
        WHERE r.status = ${REFERRAL_STATUS.verified}
        GROUP BY r.referrer_user_id, u.email
        ORDER BY count DESC
        LIMIT ${limit};
      `;

      return result.map((row, index) => ({
        user_id: row.referrer_user_id,
        points: row.count,
        rank: index + 1,
        users: { email: row.email }
      }));
    }
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
}

export async function createReward(
  userId: string, 
  type: string, 
  amountCents: number, 
  tier: number
) {
  try {
    const result = await prisma.$queryRaw`
      INSERT INTO rewards (user_id, type, amount_cents, tier, source, status) 
      VALUES (${userId}, ${type}, ${amountCents}, ${tier}, 'referral', ${REWARD_STATUS.pending})
      RETURNING *;
    `;
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    console.error('Error creating reward:', error);
    throw error;
  }
}

export async function updateLeaderboardPoints(userId: string, points: number) {
  try {
    const weekId = getISOWeek();
    
    const result = await prisma.$queryRaw`
      INSERT INTO leaderboard_week (week_id, user_id, points, rank, updated_at) 
      VALUES (${weekId}, ${userId}, ${points}, 0, NOW())
      ON CONFLICT (week_id, user_id) DO UPDATE SET 
        points = ${points}, 
        rank = 0, 
        updated_at = NOW()
      RETURNING *;
    `;
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    console.error('Error updating leaderboard points:', error);
    throw error;
  }
}

async function getUserReferralCode(userId: string): Promise<string> {
  try {
    const result = await prisma.$queryRaw<Array<{ code: string }>>`
      SELECT code FROM referral_codes WHERE user_id = ${userId} LIMIT 1;
    `;
    
    return result[0]?.code || '';
  } catch (error) {
    console.error('Error getting user referral code:', error);
    return '';
  }
}