import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../src/lib/db/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Mark draft as inactive instead of deleting (for analytics)
    await prisma.draftSession.updateMany({
      where: {
        sessionId,
        userId: session.user.id // Ensure user owns this draft
      },
      data: {
        isActive: false,
        deletedAt: new Date()
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Draft delete error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}