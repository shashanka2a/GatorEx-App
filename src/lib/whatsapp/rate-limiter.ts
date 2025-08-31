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

export async function checkRateLimit(whatsappId: string, type: 'listing' | 'message' = 'listing'): Promise<RateLimitResult> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
  
  try {
    if (type === 'listing') {
      return await checkListingRateLimit(whatsappId, today);
    } else {
      return await checkMessageRateLimit(whatsappId, today, thisHour);
    }
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow the action if we can't check limits
    return { allowed: true };
  }
}

async function checkListingRateLimit(whatsappId: string, today: Date): Promise<RateLimitResult> {
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Count listings created today
  const todayListings = await prisma.listing.count({
    where: {
      user: { whatsappId },
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

async function checkMessageRateLimit(whatsappId: string, today: Date, thisHour: Date): Promise<RateLimitResult> {
  const nextHour = new Date(thisHour);
  nextHour.setHours(nextHour.getHours() + 1);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Check if we have a rate limit record for this user
  let rateLimitRecord = await prisma.rateLimitRecord.findUnique({
    where: { whatsappId }
  });
  
  if (!rateLimitRecord) {
    // Create new rate limit record
    rateLimitRecord = await prisma.rateLimitRecord.create({
      data: {
        whatsappId,
        hourlyCount: 1,
        dailyCount: 1,
        lastHourReset: thisHour,
        lastDayReset: today
      }
    });
    
    return { allowed: true, remaining: RATE_LIMITS.HOURLY_MESSAGES - 1 };
  }
  
  // Reset counters if needed
  let { hourlyCount, dailyCount } = rateLimitRecord;
  
  if (rateLimitRecord.lastHourReset < thisHour) {
    hourlyCount = 0;
  }
  
  if (rateLimitRecord.lastDayReset < today) {
    dailyCount = 0;
  }
  
  // Check limits
  const hourlyAllowed = hourlyCount < RATE_LIMITS.HOURLY_MESSAGES;
  const dailyAllowed = dailyCount < RATE_LIMITS.DAILY_MESSAGES;
  const allowed = hourlyAllowed && dailyAllowed;
  
  if (allowed) {
    // Update counters
    await prisma.rateLimitRecord.update({
      where: { whatsappId },
      data: {
        hourlyCount: hourlyCount + 1,
        dailyCount: dailyCount + 1,
        lastHourReset: thisHour,
        lastDayReset: today
      }
    });
  }
  
  return {
    allowed,
    remaining: Math.min(
      RATE_LIMITS.HOURLY_MESSAGES - hourlyCount,
      RATE_LIMITS.DAILY_MESSAGES - dailyCount
    ),
    resetTime: !hourlyAllowed ? nextHour : tomorrow
  };
}

export async function getRateLimitStatus(whatsappId: string): Promise<{
  listings: RateLimitResult;
  messages: RateLimitResult;
}> {
  const [listings, messages] = await Promise.all([
    checkRateLimit(whatsappId, 'listing'),
    checkRateLimit(whatsappId, 'message')
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