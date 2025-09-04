import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../src/lib/db/prisma';

interface DraftSyncData {
  sessionId: string;
  userId: string;
  draft: {
    title: string;
    price: number | null;
    images: string[];
    category: string;
    condition: string;
    meetingSpot: string;
    description: string;
  };
  currentStep: number;
  lastSaved: string;
  completionPercentage: number;
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

    const syncData: DraftSyncData = req.body;

    // Validate that the user owns this draft
    if (syncData.userId !== session.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Upsert draft session
    await prisma.draftSession.upsert({
      where: {
        sessionId: syncData.sessionId
      },
      update: {
        draftData: JSON.stringify(syncData.draft),
        currentStep: syncData.currentStep,
        lastSaved: new Date(syncData.lastSaved),
        completionPercentage: syncData.completionPercentage,
        isActive: true
      },
      create: {
        sessionId: syncData.sessionId,
        userId: syncData.userId,
        draftData: JSON.stringify(syncData.draft),
        currentStep: syncData.currentStep,
        lastSaved: new Date(syncData.lastSaved),
        completionPercentage: syncData.completionPercentage,
        isActive: true
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Draft sync error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}