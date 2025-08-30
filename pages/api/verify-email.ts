import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, email } = req.body;

  if (!token || !email) {
    return res.status(400).json({ error: 'Token and email are required' });
  }

  // Validate UF email
  if (!email.endsWith('@ufl.edu')) {
    return res.status(400).json({ error: 'Please use a valid UF email address' });
  }

  try {
    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: { verifyToken: token }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    // Update user with verified email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        verified: true,
        verifyToken: null
      }
    });

    // Publish any ready draft listings for this user (not shadow banned ones)
    await prisma.listing.updateMany({
      where: {
        userId: user.id,
        status: 'READY'
      },
      data: {
        status: 'PUBLISHED'
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}