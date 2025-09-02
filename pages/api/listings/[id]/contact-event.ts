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
  const { contactType, message } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid listing ID' });
  }

  if (!contactType || !['EMAIL', 'SMS', 'PHONE'].includes(contactType)) {
    return res.status(400).json({ error: 'Invalid contact type' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Don't allow users to contact themselves
    if (listing.userId === user.id) {
      return res.status(400).json({ error: 'Cannot contact your own listing' });
    }

    // Create contact event
    const contactEvent = await prisma.contactEvent.create({
      data: {
        listingId: id,
        contacterId: user.id,
        contactType,
        message: message || null
      }
    });

    return res.status(200).json({ 
      message: 'Contact event tracked successfully',
      eventId: contactEvent.id
    });

  } catch (error) {
    console.error('Error tracking contact event:', error);
    return res.status(500).json({ error: 'Failed to track contact event' });
  }
}