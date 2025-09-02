import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid listing ID' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if listing exists and belongs to the user
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.userId !== user.id) {
      return res.status(403).json({ error: 'You can only mark your own listings as sold' });
    }

    if (listing.status === 'SOLD') {
      return res.status(400).json({ error: 'Listing is already marked as sold' });
    }

    // Update listing status to SOLD
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        status: 'SOLD',
        soldAt: new Date()
      }
    });

    return res.status(200).json({ 
      message: 'Listing marked as sold successfully',
      listing: updatedListing
    });

  } catch (error) {
    console.error('Error marking listing as sold:', error);
    return res.status(500).json({ error: 'Failed to mark listing as sold' });
  }
}