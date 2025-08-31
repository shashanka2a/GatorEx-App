import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../src/lib/db/turso';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { category, search, limit = '20' } = req.query;
      
      const where: any = {
        status: 'PUBLISHED',
        expiresAt: {
          gt: new Date()
        },
        user: {
          ufEmailVerified: true
        }
      };
      
      if (category && category !== 'All') {
        where.category = category;
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }
      
      const listings = await prisma.listing.findMany({
        where,
        include: {
          images: true,
          user: {
            select: {
              name: true,
              ufEmailVerified: true,
              phoneNumber: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: parseInt(limit as string)
      });
      
      // Transform to match existing frontend format
      const transformedListings = listings.map(listing => ({
        id: listing.id,
        title: listing.title,
        price: listing.price ? `$${listing.price}` : 'DM for price',
        originalPrice: listing.price ? `$${Math.round(listing.price * 1.3)}` : null,
        image: listing.images[0]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        location: 'Via WhatsApp',
        likes: Math.floor(Math.random() * 50),
        views: Math.floor(Math.random() * 200),
        category: listing.category || 'Other',
        seller: {
          name: listing.user?.name || 'Anonymous',
          verified: listing.user?.ufEmailVerified || false,
          rating: 4.5 + Math.random() * 0.5,
          responseTime: '1h',
          phoneNumber: listing.user?.phoneNumber,
          email: listing.user?.email
        },
        timePosted: getTimeAgo(listing.createdAt),
        condition: listing.condition || 'Good',
        trending: Math.random() > 0.7,
        savings: listing.price ? Math.floor(Math.random() * 50) + 10 : 0,
        description: listing.description || 'Contact seller for details',
        smsLink: listing.user?.phoneNumber ? `sms:${listing.user.phoneNumber}?body=${encodeURIComponent(`Hi! I'm interested in your "${listing.title}" listing on GatorEx.`)}` : null,
        emailLink: `mailto:${listing.user?.email}?subject=${encodeURIComponent(`GatorEx: ${listing.title}`)}&body=${encodeURIComponent(`Hi! I'm interested in your "${listing.title}" listing on GatorEx.`)}`
      }));
      
      res.status(200).json(transformedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}