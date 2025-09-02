import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../src/lib/db/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, search, limit = '20', page = '1' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      status: 'PUBLISHED',
      expiresAt: {
        gt: new Date()
      }
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search as string,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search as string,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Optimized query with selective fields
    const listings = await prisma.listing.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        category: true,
        condition: true,
        meetingSpot: true,
        createdAt: true,
        images: {
          select: { url: true },
          take: 3 // Limit images for performance
        },
        user: {
          select: { 
            name: true
            // Contact details hidden for privacy - only shown to authenticated users
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limitNum,
      skip: skip
    });

    // Set cache headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return res.status(200).json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}