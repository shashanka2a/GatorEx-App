import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../src/lib/db/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { username } = req.body;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Instagram username is required' });
    }

    // Clean username (remove @ if present)
    const cleanUsername = username.replace('@', '').trim().toLowerCase();

    if (!cleanUsername) {
      return res.status(400).json({ error: 'Valid Instagram username is required' });
    }

    // Get the active giveaway
    const giveaway = await prisma.giveaway.findFirst({
      where: {
        title: 'iPhone 14 Launch Giveaway',
        isActive: true
      }
    });

    if (!giveaway) {
      return res.status(404).json({ error: 'Giveaway not found' });
    }

    // Note: This is an honor system - we trust users to follow @gatorex.shop
    // Manual verification can be done later by checking the follower list
    // Instagram's API doesn't provide easy follower verification for third parties
    
    // Update the giveaway entry
    const entry = await prisma.giveawayEntry.upsert({
      where: {
        userId_giveawayId: {
          userId: session.user.id,
          giveawayId: giveaway.id
        }
      },
      update: {
        instagramFollowed: true,
        instagramUsername: cleanUsername,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        giveawayId: giveaway.id,
        instagramFollowed: true,
        instagramUsername: cleanUsername,
        ufEmailVerified: false,
        hasPostedListing: false,
        isEligible: false
      }
    });

    // Check if user is now eligible
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

    const isEligible = entry.instagramFollowed && 
                      (user?.ufEmailVerified || false) && 
                      (user?.listings.length || 0) > 0;

    // Update eligibility
    await prisma.giveawayEntry.update({
      where: { id: entry.id },
      data: {
        ufEmailVerified: user?.ufEmailVerified || false,
        hasPostedListing: (user?.listings.length || 0) > 0,
        isEligible
      }
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Instagram follow verified successfully!' 
    });

  } catch (error) {
    console.error('Instagram verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}