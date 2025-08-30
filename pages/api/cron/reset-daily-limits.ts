import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify this is a cron request
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);
    
    // Reset daily listing counts for users who posted yesterday or earlier
    const result = await prisma.user.updateMany({
      where: {
        lastListingDate: {
          lt: yesterday
        },
        dailyListingCount: {
          gt: 0
        }
      },
      data: {
        dailyListingCount: 0
      }
    });
    
    console.log(`Reset daily limits for ${result.count} users`);
    
    res.status(200).json({ 
      success: true, 
      resetCount: result.count 
    });
  } catch (error) {
    console.error('Error resetting daily limits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}