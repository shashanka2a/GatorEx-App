import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify this is a cron request (in production, use proper auth)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();
    
    // Expire listings that have passed their expiry date
    const result = await prisma.listing.updateMany({
      where: {
        status: 'PUBLISHED',
        expiresAt: {
          lt: now
        }
      },
      data: {
        status: 'EXPIRED'
      }
    });
    
    console.log(`Expired ${result.count} listings`);
    
    res.status(200).json({ 
      success: true, 
      expiredCount: result.count 
    });
  } catch (error) {
    console.error('Error expiring listings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}