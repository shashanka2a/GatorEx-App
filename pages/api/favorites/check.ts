import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
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

  const { listingIds } = req.body;

  if (!Array.isArray(listingIds)) {
    return res.status(400).json({ error: 'listingIds must be an array' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id,
        listingId: { in: listingIds }
      },
      select: { listingId: true }
    });

    const favoritedIds = favorites.map(fav => fav.listingId);
    return res.status(200).json({ favoritedIds });
  } catch (error) {
    console.error('Error checking favorites:', error);
    return res.status(500).json({ error: 'Failed to check favorites' });
  }
}