import { NextApiRequest, NextApiResponse } from 'next';
import { checkApiAuthAndTerms } from '../../../src/lib/auth/server-auth-check';
import { prisma } from '../../../src/lib/db/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGetProfile(req, res);
  } else if (req.method === 'PUT') {
    return handleUpdateProfile(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleUpdateProfile(req: NextApiRequest, res: NextApiResponse) {
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

    const { name, phoneNumber, venmoId, cashappId, zelleId, paymentQrCode, preferredPaymentMethod } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'Name must be less than 100 characters' });
    }

    // Validate payment method IDs
    if (venmoId && venmoId.length > 100) {
      return res.status(400).json({ error: 'Venmo ID must be less than 100 characters' });
    }
    if (cashappId && cashappId.length > 100) {
      return res.status(400).json({ error: 'CashApp ID must be less than 100 characters' });
    }
    if (zelleId && zelleId.length > 100) {
      return res.status(400).json({ error: 'Zelle ID must be less than 100 characters' });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        phoneNumber: phoneNumber?.trim() || null,
        venmoId: venmoId?.trim() || null,
        cashappId: cashappId?.trim() || null,
        zelleId: zelleId?.trim() || null,
        paymentQrCode: paymentQrCode?.trim() || null,
        preferredPaymentMethod: preferredPaymentMethod || 'venmo',
        profileCompleted: true // Mark profile as completed when user updates it
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        venmoId: true,
        cashappId: true,
        zelleId: true,
        paymentQrCode: true,
        preferredPaymentMethod: true,
        profileCompleted: true
      }
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetProfile(req: NextApiRequest, res: NextApiResponse) {

  // Add cache headers for better performance
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

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

    // Fetch user profile data with listings in a single optimized query
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        ufEmailVerified: true,
        profileCompleted: true,
        trustScore: true,
        venmoId: true,
        cashappId: true,
        zelleId: true,
        paymentQrCode: true,
        preferredPaymentMethod: true,
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
        favorites: {
          select: {
            listing: {
              select: {
                id: true,
                title: true,
                images: {
                  select: {
                    url: true
                  },
                  take: 1
                }
              }
            }
          },
          take: 10 // Limit to recent 10 favorites for performance
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

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    const listings = userData.listings;

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
      id: userData.id,
      name: userData.name || 'Gator Student',
      phoneNumber: userData.phoneNumber,
      ufEmail: userData.email,
      verified: userData.ufEmailVerified,
      profileCompleted: userData.profileCompleted,
      trustLevel: getTrustLevel(userData.trustScore, publishedListings.length),
      trustScore: userData.trustScore,
      venmoId: userData.venmoId,
      cashappId: userData.cashappId,
      zelleId: userData.zelleId,
      paymentQrCode: userData.paymentQrCode,
      preferredPaymentMethod: userData.preferredPaymentMethod,
      rating: 4.8, // Mock rating - implement reviews system later
      totalSales: publishedListings.length,
      responseTime: '2h', // Mock - implement messaging system later
      totalViews,
      joinedAt: userData.createdAt,
      favorites: userData.favorites?.map(fav => ({
        id: fav.listing.id,
        title: fav.listing.title,
        image: fav.listing.images && fav.listing.images.length > 0 ? fav.listing.images[0].url : null
      })) || [],
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