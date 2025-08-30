import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  dailyCount?: number;
  activeCount?: number;
  maxDaily?: number;
  maxActive?: number;
}

export async function checkRateLimit(whatsappId: string): Promise<RateLimitResult> {
  const user = await prisma.user.findUnique({
    where: { whatsappId },
    include: {
      listings: {
        where: {
          status: { in: ['PUBLISHED', 'READY'] },
          expiresAt: { gt: new Date() }
        }
      }
    }
  });

  if (!user) {
    return { allowed: true };
  }

  // Get limits based on trust level
  const limits = getTrustLimits(user.trustLevel);
  
  // Check daily limit
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const isNewDay = !user.lastListingDate || user.lastListingDate < today;
  const dailyCount = isNewDay ? 0 : user.dailyListingCount;
  
  if (dailyCount >= limits.dailyMax) {
    return {
      allowed: false,
      reason: 'daily_limit',
      dailyCount,
      maxDaily: limits.dailyMax
    };
  }

  // Check active listings limit
  const activeCount = user.listings.length;
  
  if (activeCount >= limits.activeMax) {
    return {
      allowed: false,
      reason: 'active_limit',
      activeCount,
      maxActive: limits.activeMax
    };
  }

  return {
    allowed: true,
    dailyCount,
    activeCount,
    maxDaily: limits.dailyMax,
    maxActive: limits.activeMax
  };
}

export async function incrementUserListingCount(whatsappId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const user = await prisma.user.findUnique({
    where: { whatsappId }
  });

  if (!user) return;

  const isNewDay = !user.lastListingDate || user.lastListingDate < today;
  
  await prisma.user.update({
    where: { whatsappId },
    data: {
      dailyListingCount: isNewDay ? 1 : user.dailyListingCount + 1,
      lastListingDate: new Date()
    }
  });
}

export async function updateUserTrustLevel(whatsappId: string) {
  const user = await prisma.user.findUnique({
    where: { whatsappId },
    include: {
      listings: {
        where: {
          status: 'PUBLISHED',
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      }
    }
  });

  if (!user) return;

  const publishedCount = user.listings.length;
  const spamAttempts = user.spamAttempts;

  // Upgrade to trusted if user has good history
  if (user.verified && publishedCount >= 5 && spamAttempts === 0 && user.trustLevel === 'BASIC') {
    await prisma.user.update({
      where: { whatsappId },
      data: { trustLevel: 'TRUSTED' }
    });
  }

  // Shadow ban if too many spam attempts
  if (spamAttempts >= 3 && user.trustLevel !== 'SHADOW_BANNED') {
    await prisma.user.update({
      where: { whatsappId },
      data: { 
        trustLevel: 'SHADOW_BANNED',
        shadowBanned: true
      }
    });
  }
}

function getTrustLimits(trustLevel: string) {
  switch (trustLevel) {
    case 'TRUSTED':
      return { dailyMax: 5, activeMax: 15 };
    case 'SHADOW_BANNED':
      return { dailyMax: 0, activeMax: 0 };
    default: // BASIC
      return { dailyMax: 3, activeMax: 10 };
  }
}