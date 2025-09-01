import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../src/lib/db/prisma';

interface ChatMessage {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ListingData {
  title: string;
  price: string;
  description: string;
  category?: string;
  condition?: string;
  images: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { action, listingData } = req.body;

    if (action === 'create_listing') {
      // Validate listing data
      if (!listingData.title || !listingData.price || !listingData.description) {
        return res.status(400).json({ error: 'Missing required listing data' });
      }

      // Parse price (remove $ and convert to number)
      const priceString = listingData.price.replace(/[^0-9.]/g, '');
      const price = parseFloat(priceString);

      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'Invalid price format' });
      }

      // Create the listing with expiration date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const listing = await prisma.listing.create({
        data: {
          title: listingData.title.trim(),
          description: listingData.description.trim(),
          price: price,
          condition: listingData.condition || 'good',
          category: listingData.category || 'other',
          userId: session.user.id,
          status: 'PUBLISHED',
          expiresAt: expiresAt
        }
      });

      // Create image records if there are any images
      if (listingData.images && listingData.images.length > 0) {
        const imageData = listingData.images.map((imageUrl: string, index: number) => ({
          url: imageUrl,
          filename: `chatbot-upload-${Date.now()}-${index}`,
          listingId: listing.id
        }));

        await prisma.image.createMany({
          data: imageData
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Listing created successfully!',
        listing: {
          id: listing.id,
          title: listing.title,
          price: listing.price,
          status: listing.status
        }
      });
    }

    // Handle other chat actions here (like getting suggestions, etc.)
    return res.status(400).json({ error: 'Invalid action' });

  } catch (error: any) {
    console.error('Chat bot API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}