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

    // Get the active giveaway
    const giveaway = await prisma.giveaway.findFirst({
      where: {
        title: 'iPhone 14 Launch Giveaway',
        isActive: true,
        endDate: {
          gt: new Date()
        }
      }
    });

    if (!giveaway) {
      return res.status(404).json({ error: 'Giveaway not found or has ended' });
    }

    // Get user and their listings
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

    // Get existing entry
    const entry = await prisma.giveawayEntry.findUnique({
      where: {
        userId_giveawayId: {
          userId: session.user.id,
          giveawayId: giveaway.id
        }
      }
    });

    if (!entry) {
      return res.status(400).json({ error: 'No giveaway entry found. Please complete verification steps first.' });
    }

    // Verify all requirements are met
    const ufEmailVerified = user.ufEmailVerified || false;
    const hasPostedListing = user.listings.length > 0;
    const instagramFollowed = entry.instagramFollowed;

    if (!ufEmailVerified) {
      return res.status(400).json({ error: 'UF email must be verified' });
    }

    if (!hasPostedListing) {
      return res.status(400).json({ error: 'You must have at least one published listing' });
    }

    if (!instagramFollowed) {
      return res.status(400).json({ error: 'You must follow @gatorex.shop on Instagram' });
    }

    // Update entry as eligible and verified
    const updatedEntry = await prisma.giveawayEntry.update({
      where: { id: entry.id },
      data: {
        ufEmailVerified,
        hasPostedListing,
        isEligible: true,
        verifiedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Log the successful entry for analytics
    console.log(`Giveaway entry completed: User ${session.user.id} (${user.email}) entered iPhone 14 giveaway`);

    return res.status(200).json({ 
      success: true, 
      message: 'Congratulations! You have successfully entered the iPhone 14 giveaway!',
      entryId: updatedEntry.id
    });

  } catch (error) {
    console.error('Giveaway entry error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}