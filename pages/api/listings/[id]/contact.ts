import { NextApiRequest, NextApiResponse } from 'next';
import { checkApiAuthAndTerms } from '../../../../src/lib/auth/server-auth-check';
import { prisma } from '../../../../src/lib/db/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authResult = await checkApiAuthAndTerms(req, res);
    if (authResult.error) {
      return res.status(authResult.status).json({ 
        error: authResult.error
      });
    }
    
    const user = authResult.user;
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { id } = req.query;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid listing ID' });
    }

    // Get the listing with user contact details
    const listing = await prisma.listing.findUnique({
      where: { 
        id,
        status: 'PUBLISHED',
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        title: true,
        user: {
          select: {
            email: true,
            phoneNumber: true,
            name: true
          }
        }
      }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found or expired' });
    }

    // Track contact event
    try {
      await prisma.contactEvent.create({
        data: {
          listingId: listing.id,
          contacterId: user.id,
          contactType: 'VIEW_CONTACT'
        }
      });
    } catch (contactError) {
      console.error('Error tracking contact event:', contactError);
      // Don't fail the request if contact tracking fails
    }

    return res.status(200).json({
      listingId: listing.id,
      listingTitle: listing.title,
      seller: {
        name: listing.user.name,
        email: listing.user.email,
        phoneNumber: listing.user.phoneNumber
      }
    });

  } catch (error) {
    console.error('Error fetching contact details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}