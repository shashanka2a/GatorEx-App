import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../src/lib/db/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid listing ID' });
    }

    // Get client IP for basic duplicate view prevention
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    
    // Check if listing exists and is published
    const listing = await prisma.listing.findUnique({
      where: { 
        id,
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        views: true,
        userId: true
      }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Simple rate limiting: check if this IP viewed this listing recently
    // In production, you might want to use Redis or a more sophisticated system
    const recentViewKey = `view_${id}_${clientIP}`;
    
    // For now, we'll just increment the view count
    // You could add more sophisticated tracking here
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      },
      select: {
        views: true
      }
    });

    // Log the view for analytics (optional)
    console.log(`📊 View tracked: Listing ${id} now has ${updatedListing.views} views (IP: ${clientIP})`);

    return res.status(200).json({
      success: true,
      views: updatedListing.views
    });

  } catch (error) {
    console.error('Error tracking view:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}