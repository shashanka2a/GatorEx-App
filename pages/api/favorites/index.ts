import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (req.method === 'GET') {
    try {
      const favorites = await prisma.favorite.findMany({
        where: { userId: user.id },
        include: {
          listing: {
            include: {
              images: true,
              user: {
                select: {
                  name: true,
                  id: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const favoritedListings = favorites.map(fav => fav.listing);
      return res.status(200).json({ favorites: favoritedListings });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return res.status(500).json({ error: 'Failed to fetch favorites' });
    }
  }

  if (req.method === 'POST') {
    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    try {
      // Check if listing exists
      const listing = await prisma.listing.findUnique({
        where: { id: listingId }
      });

      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      // Check if already favorited
      const existingFavorite = await prisma.favorite.findUnique({
        where: {
          userId_listingId: {
            userId: user.id,
            listingId: listingId
          }
        }
      });

      if (existingFavorite) {
        // Remove from favorites
        await prisma.favorite.delete({
          where: { id: existingFavorite.id }
        });
        return res.status(200).json({ favorited: false });
      } else {
        // Add to favorites
        await prisma.favorite.create({
          data: {
            userId: user.id,
            listingId: listingId
          }
        });
        return res.status(200).json({ favorited: true });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return res.status(500).json({ error: 'Failed to toggle favorite' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}