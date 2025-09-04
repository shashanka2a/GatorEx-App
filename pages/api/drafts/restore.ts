import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../src/lib/db/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get the most recent active draft for this user
    const recentDraft = await prisma.draftSession.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
        lastSaved: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Within 7 days
        }
      },
      orderBy: {
        lastSaved: 'desc'
      }
    });

    if (!recentDraft) {
      return res.status(404).json({ error: 'No recent draft found' });
    }

    const draftData = JSON.parse(recentDraft.draftData);

    return res.status(200).json({
      sessionId: recentDraft.sessionId,
      draft: draftData,
      currentStep: recentDraft.currentStep,
      lastSaved: recentDraft.lastSaved,
      completionPercentage: recentDraft.completionPercentage
    });
  } catch (error) {
    console.error('Draft restore error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}