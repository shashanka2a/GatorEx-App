import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../src/lib/db/prisma';

interface ListingData {
  title: string;
  price: number;
  images: string[];
  category: string;
  condition: string;
  meetingSpot: string;
  description: string;
}

// Simple moderation blocklist
const BLOCKED_WORDS = [
  'scam', 'fake', 'stolen', 'drugs', 'weapon', 'gun', 'knife',
  'alcohol', 'beer', 'wine', 'weed', 'marijuana', 'cannabis',
  'sex', 'porn', 'escort', 'massage', 'adult', 'xxx'
];

const moderateContent = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return !BLOCKED_WORDS.some(word => lowerText.includes(word));
};

// Configure API route for larger payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { listing } = req.body as { listing: ListingData };

    // Validate required fields
    if (!listing.title || !listing.price || !listing.images || listing.images.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: title, price, and at least one image' });
    }

    // Validate price
    if (listing.price <= 0 || listing.price > 10000) {
      return res.status(400).json({ error: 'Price must be between $0.01 and $10,000' });
    }

    // Content moderation
    const contentToCheck = `${listing.title} ${listing.description}`.toLowerCase();
    if (!moderateContent(contentToCheck)) {
      return res.status(400).json({ 
        error: 'Your listing contains prohibited content. Please review our community guidelines and try again.' 
      });
    }

    // Check rate limits
    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [dailyCount, liveCount] = await Promise.all([
      prisma.listing.count({
        where: {
          userId,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.listing.count({
        where: {
          userId,
          status: 'PUBLISHED'
        }
      })
    ]);

    if (dailyCount >= 3) {
      return res.status(429).json({ error: 'Daily limit reached. You can create up to 3 listings per day.' });
    }

    if (liveCount >= 10) {
      return res.status(429).json({ error: 'You have reached the maximum of 10 active listings.' });
    }

    // Set expiry date (14 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    // Create the listing
    const newListing = await prisma.listing.create({
      data: {
        title: listing.title.trim(),
        description: listing.description?.trim() || null,
        price: listing.price,
        category: listing.category || null,
        condition: listing.condition || null,
        meetingSpot: listing.meetingSpot || null,
        status: 'PUBLISHED',
        expiresAt,
        userId
      }
    });

    // Create images - ensure no duplicates
    if (listing.images && listing.images.length > 0) {
      // Remove duplicate image URLs
      const uniqueImages = [...new Set(listing.images)];
      
      const imageData = uniqueImages.map((imageUrl, index) => ({
        url: imageUrl,
        filename: `image_${index + 1}`,
        listingId: newListing.id
      }));

      console.log(`Creating ${imageData.length} unique images for listing ${newListing.id}`);

      await prisma.image.createMany({
        data: imageData
      });
    }

    // Update user's daily listing count
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyListingCount: dailyCount + 1,
        lastListingDate: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Listing published successfully!',
      listing: {
        id: newListing.id,
        title: newListing.title,
        price: newListing.price,
        status: newListing.status,
        expiresAt: newListing.expiresAt
      }
    });

  } catch (error: any) {
    console.error('Publish listing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}