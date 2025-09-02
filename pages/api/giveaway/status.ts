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
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get or create the iPhone 14 giveaway
    let giveaway = await prisma.giveaway.findFirst({
      where: {
        title: 'iPhone 14 Launch Giveaway',
        isActive: true
      }
    });

    if (!giveaway) {
      // Create the giveaway if it doesn't exist
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 days from now

      giveaway = await prisma.giveaway.create({
        data: {
          title: 'iPhone 14 Launch Giveaway',
          description: 'Win an iPhone 14 by completing our launch requirements!',
          prize: 'iPhone 14',
          startDate: new Date(),
          endDate: endDate,
          isActive: true
        }
      });
    }

    // Check user's verification status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        listings: {
          where: {
            status: 'PUBLISHED'
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get existing giveaway entry
    let entry = await prisma.giveawayEntry.findUnique({
      where: {
        userId_giveawayId: {
          userId: session.user.id,
          giveawayId: giveaway.id
        }
      }
    });

    // Check verification status
    const ufEmailVerified = user.ufEmailVerified || false;
    const hasPostedListing = user.listings.length > 0;
    const instagramFollowed = entry?.instagramFollowed || false;

    // Update or create entry with current status
    const entryData = {
      userId: session.user.id,
      giveawayId: giveaway.id,
      ufEmailVerified,
      hasPostedListing,
      instagramFollowed,
      isEligible: ufEmailVerified && hasPostedListing && instagramFollowed,
      instagramUsername: entry?.instagramUsername
    };

    if (entry) {
      entry = await prisma.giveawayEntry.update({
        where: { id: entry.id },
        data: entryData
      });
    } else {
      entry = await prisma.giveawayEntry.create({
        data: entryData
      });
    }

    return res.status(200).json({
      instagramFollowed: entry.instagramFollowed,
      ufEmailVerified: entry.ufEmailVerified,
      hasPostedListing: entry.hasPostedListing,
      isEligible: entry.isEligible,
      instagramUsername: entry.instagramUsername
    });

  } catch (error) {
    console.error('Giveaway status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}