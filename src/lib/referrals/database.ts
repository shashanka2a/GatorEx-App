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
    // If table creation fails, return a mock object with the generated code
    return {
      user_id: userId,
      code: code,
      created_at: new Date()
    };
  }
}

export async function getReferralCode(userId: string) {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM referral_codes WHERE user_id = ${userId} LIMIT 1;
    `;
    
    return Array.isArray(result) && result.length > 0 ? result[0] : null;
  } catch (error) {
    // If table doesn't exist or query fails, return null
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
    // Return null if logging fails - don't break the flow
    return null;
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
    // Return null if creation fails
    return null;
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
    // Return null if update fails
    return null;
  }
}

export async function getReferralSummary(userId: string) {
  try {
    // Get user's referral code first
    const userCode = await getUserReferralCode(userId);
    
    let clickCount = 0;
    let verifiedCount = 0;
    let earned = 0;
    let thisWeekPoints = 0;

    // Get total clicks with error handling
    try {
      const clicks = await prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*) as count FROM referral_clicks WHERE code = ${userCode};
      `;
      clickCount = Number(clicks[0]?.count || 0);
    } catch (clickError) {
      // Table might not exist, default to 0
      clickCount = 0;
    }

    // Get verified referrals with error handling
    try {
      const verified = await prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*) as count FROM referrals 
        WHERE referrer_user_id = ${userId} AND status = ${REFERRAL_STATUS.verified};
      `;
      verifiedCount = Number(verified[0]?.count || 0);
    } catch (verifiedError) {
      // Table might not exist, default to 0
      verifiedCount = 0;
    }

    // Get earned rewards with error handling
    try {
      const rewards = await prisma.$queryRaw<Array<{ amount_cents: number }>>`
        SELECT amount_cents FROM rewards 
        WHERE user_id = ${userId} AND status = ${REWARD_STATUS.approved};
      `;
      earned = rewards?.reduce((sum: number, r: any) => sum + (Number(r.amount_cents) || 0), 0) || 0;
    } catch (rewardsError) {
      // Table might not exist, default to 0
      earned = 0;
    }

    // Get this week points with error handling
    try {
      const weekId = getISOWeek();
      const weekData = await prisma.$queryRaw<Array<{ points: number }>>`
        SELECT points FROM leaderboard_week 
        WHERE user_id = ${userId} AND week_id = ${weekId} LIMIT 1;
      `;
      thisWeekPoints = Number(weekData[0]?.points || 0);
    } catch (weekError) {
      // Table might not exist, default to 0
      thisWeekPoints = 0;
    }

    // Calculate next tier
    const currentRefs = verifiedCount || 0;
    let nextTier = null;
    try {
      const tier = REFERRAL_CONFIG.tiers.find(t => t.refs > currentRefs);
      nextTier = tier ? { refs: tier.refs, reward: tier.reward } : null;
    } catch (tierError) {
      nextTier = null;
    }

    return {
      clicks: clickCount,
      verified: verifiedCount,
      earned,
      thisWeekPoints,
      nextTier
    };
  } catch (error) {
    // Return default values instead of throwing
    return {
      clicks: 0,
      verified: 0,
      earned: 0,
      thisWeekPoints: 0,
      nextTier: null
    };
  }
}

export async function getLeaderboard(period: 'week' | 'all' = 'week', limit = 100) {
  try {
    if (period === 'week') {
      try {
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
          points: Number(row.points) || 0,
          rank: Number(row.rank) || 0,
          users: { email: row.email }
        }));
      } catch (weekError) {
        // If weekly leaderboard fails, return empty array
        return [];
      }
    } else {
      try {
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
          points: Number(row.count) || 0,
          rank: index + 1,
          users: { email: row.email }
        }));
      } catch (allTimeError) {
        // If all-time leaderboard fails, return empty array
        return [];
      }
    }
  } catch (error) {
    // Return empty array instead of throwing
    return [];
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
    // Return null if reward creation fails
    return null;
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
    // Return null if leaderboard update fails
    return null;
  }
}

async function getUserReferralCode(userId: string): Promise<string> {
  try {
    const result = await prisma.$queryRaw<Array<{ code: string }>>`
      SELECT code FROM referral_codes WHERE user_id = ${userId} LIMIT 1;
    `;
    
    return result[0]?.code || '';
  } catch (error) {
    // If table doesn't exist or query fails, return empty string
    return '';
  }
}