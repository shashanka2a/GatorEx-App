import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../src/lib/db/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid listing ID' });
  }

  try {
    // Verify the listing belongs to the user
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: {
          select: { url: true }
        }
      }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.userId !== session.user.id) {
      return res.status(403).json({ error: 'Not authorized to modify this listing' });
    }

    switch (req.method) {
      case 'GET':
        return res.status(200).json(listing);

      case 'PUT':
        const { title, description, price, category, condition, meetingSpot } = req.body;

        const updatedListing = await prisma.listing.update({
          where: { id },
          data: {
            title,
            description,
            price: parseFloat(price),
            category,
            condition,
            meetingSpot,
            updatedAt: new Date()
          },
          include: {
            images: {
              select: { url: true }
            }
          }
        });

        return res.status(200).json(updatedListing);

      case 'DELETE':
        // Delete associated images first
        await prisma.image.deleteMany({
          where: { listingId: id }
        });

        // Delete the listing
        await prisma.listing.delete({
          where: { id }
        });

        return res.status(200).json({ message: 'Listing deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Listing API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}