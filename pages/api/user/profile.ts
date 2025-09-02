import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../src/lib/db/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Add cache headers for better performance
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch user profile data with listings in a single optimized query
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        ufEmailVerified: true,
        profileCompleted: true,
        trustScore: true,
        createdAt: true,
        listings: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            views: true,
            createdAt: true,
            expiresAt: true,
            images: {
              select: {
                url: true
              },
              take: 1 // Only get first image for performance
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 50 // Limit to recent 50 listings for performance
        },
        _count: {
          select: {
            listings: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const listings = user.listings;

    // Calculate user stats
    const publishedListings = listings.filter(l => l.status === 'PUBLISHED');
    const totalViews = 0; // Mock for now - you can add a views field to listings later
    
    // Calculate trust level based on listings and trust score
    const getTrustLevel = (score: number, listingCount: number) => {
      if (score >= 80 && listingCount >= 5) return 'TRUSTED';
      if (score >= 50 && listingCount >= 2) return 'VERIFIED';
      return 'BASIC';
    };
    
    const profileData = {
      id: user.id,
      name: user.name || 'Gator Student',
      ufEmail: user.email,
      verified: user.ufEmailVerified,
      profileCompleted: user.profileCompleted,
      trustLevel: getTrustLevel(user.trustScore, publishedListings.length),
      trustScore: user.trustScore,
      rating: 4.8, // Mock rating - implement reviews system later
      totalSales: publishedListings.length,
      responseTime: '2h', // Mock - implement messaging system later
      totalViews,
      joinedAt: user.createdAt,
      listings: listings.map(listing => ({
        ...listing,
        views: 0, // Mock for now
        image: listing.images && listing.images.length > 0 ? listing.images[0].url : null
      }))
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}