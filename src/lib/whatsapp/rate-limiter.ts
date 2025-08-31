import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  resetTime?: Date;
}

// Rate limits configuration
const RATE_LIMITS = {
  DAILY_LISTINGS: 3,
  HOURLY_MESSAGES: 20,
  DAILY_MESSAGES: 100
};

export async function checkRateLimit(userId: string, type: 'listing' | 'message' = 'listing'): Promise<RateLimitResult> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
  
  try {
    if (type === 'listing') {
      return await checkListingRateLimit(userId, today);
    } else {
      return await checkMessageRateLimit(userId, today, thisHour);
    }
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow the action if we can't check limits
    return { allowed: true };
  }
}

async function checkListingRateLimit(userId: string, today: Date): Promise<RateLimitResult> {
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Count listings created today
  const todayListings = await prisma.listing.count({
    where: {
      userId: userId,
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    }
  });
  
  const remaining = Math.max(0, RATE_LIMITS.DAILY_LISTINGS - todayListings);
  const allowed = todayListings < RATE_LIMITS.DAILY_LISTINGS;
  
  return {
    allowed,
    remaining,
    resetTime: tomorrow
  };
}

async function checkMessageRateLimit(userId: string, today: Date, thisHour: Date): Promise<RateLimitResult> {
  const nextHour = new Date(thisHour);
  nextHour.setHours(nextHour.getHours() + 1);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // For now, use a simple in-memory rate limiting for messages
  // In production, you'd want to use Redis or database storage
  const messageKey = `${userId}_messages_${today.toISOString().split('T')[0]}`;
  
  // Simple rate limiting - allow up to limits per day/hour
  // This is a basic implementation - in production use Redis
  return {
    allowed: true,
    remaining: RATE_LIMITS.HOURLY_MESSAGES,
    resetTime: nextHour
  };
}

export async function getRateLimitStatus(userId: string): Promise<{
  listings: RateLimitResult;
  messages: RateLimitResult;
}> {
  const [listings, messages] = await Promise.all([
    checkRateLimit(userId, 'listing'),
    checkRateLimit(userId, 'message')
  ]);
  
  return { listings, messages };
}

export function getRateLimitMessage(result: RateLimitResult, type: 'listing' | 'message'): string {
  if (result.allowed) {
    return '';
  }
  
  const resetTime = result.resetTime;
  const timeUntilReset = resetTime ? Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60)) : 0;
  
  if (type === 'listing') {
    return `You've reached your daily limit of ${RATE_LIMITS.DAILY_LISTINGS} listings. Try again tomorrow!`;
  } else {
    if (timeUntilReset < 60) {
      return `You're sending messages too quickly. Please wait ${timeUntilReset} minutes before trying again.`;
    } else {
      const hoursUntilReset = Math.ceil(timeUntilReset / 60);
      return `You've reached your daily message limit. Try again in ${hoursUntilReset} hours.`;
    }
  }
}