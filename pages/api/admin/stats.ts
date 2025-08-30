import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalListings,
      publishedListings,
      draftListings,
      shadowBannedListings,
      totalUsers,
      verifiedUsers,
      trustedUsers,
      shadowBannedUsers,
      blockedToday,
      spamAttempts,
      recentListings
    ] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'PUBLISHED' } }),
      prisma.listing.count({ where: { status: 'DRAFT' } }),
      prisma.listing.count({ where: { status: 'SHADOW_BANNED' } }),
      prisma.user.count(),
      prisma.user.count({ where: { ufEmailVerified: true } }),
      prisma.user.count({ where: { trustLevel: 'TRUSTED' } }),
      prisma.user.count({ where: { shadowBanned: true } }),
      prisma.listing.count({ 
        where: { 
          status: 'BLOCKED',
          createdAt: { gte: today }
        } 
      }),
      prisma.user.aggregate({
        _sum: { spamAttempts: true }
      }),
      prisma.listing.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              ufEmailVerified: true,
              name: true,
              trustLevel: true,
              shadowBanned: true
            }
          }
        }
      })
    ]);

    res.status(200).json({
      totalListings,
      publishedListings,
      draftListings,
      shadowBannedListings,
      totalUsers,
      verifiedUsers,
      trustedUsers,
      shadowBannedUsers,
      moderationStats: {
        blockedToday,
        spamAttempts: spamAttempts._sum.spamAttempts || 0
      },
      recentListings
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}