import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/src/lib/prisma';

export const runtime = 'nodejs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test basic database connectivity
    const result = await prisma.$queryRaw`SELECT 1 as ok, NOW() as timestamp`;
    
    // Test if our tables exist
    const userCount = await prisma.user.count();
    const listingCount = await prisma.listing.count();
    
    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
      query_result: result,
      tables: {
        users: userCount,
        listings: listingCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}