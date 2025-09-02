import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';
import { prisma } from '../../../src/lib/db/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { termsAccepted, privacyAccepted } = req.body;

  if (!termsAccepted || !privacyAccepted) {
    return res.status(400).json({ error: 'Both terms and privacy policy must be accepted' });
  }

  try {
    const now = new Date();

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        termsAccepted: true,
        termsAcceptedAt: now,
        privacyAccepted: true,
        privacyAcceptedAt: now,
      },
    });

    return res.status(200).json({ 
      success: true,
      message: 'Terms accepted successfully' 
    });

  } catch (error) {
    console.error('Error accepting terms:', error);
    return res.status(500).json({ error: 'Failed to accept terms' });
  }
}