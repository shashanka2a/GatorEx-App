import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../src/lib/db/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    // Check if user is admin (you can implement your own admin check logic)
    if (!session?.user?.email || !session.user.email.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get all giveaway entries
    const entries = await prisma.giveawayEntry.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            ufEmail: true,
            createdAt: true
          }
        },
        giveaway: {
          select: {
            id: true,
            title: true,
            prize: true
          }
        }
      },
      orderBy: {
        verifiedAt: 'desc'
      }
    });

    // Get summary stats
    const stats = {
      totalEntries: entries.length,
      eligibleEntries: entries.filter(e => e.isEligible).length,
      instagramFollowers: entries.filter(e => e.instagramFollowed).length,
      verifiedEmails: entries.filter(e => e.ufEmailVerified).length,
      activeListers: entries.filter(e => e.hasPostedListing).length
    };

    return res.status(200).json({
      entries,
      stats
    });

  } catch (error) {
    console.error('Admin giveaway entries error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}