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
    // In development mode, use in-memory token storage
    if (process.env.NODE_ENV === 'development') {
      const devTokens = (global as any).devTokens || {};
      const tokenData = devTokens[token];
      
      if (!tokenData) {
        return res.status(400).json({ error: 'Invalid verification token' });
      }
      
      if (new Date() > tokenData.expires) {
        delete devTokens[token];
        return res.status(400).json({ error: 'Verification token has expired' });
      }
      
      if (tokenData.email !== email.toLowerCase()) {
        return res.status(400).json({ error: 'Email does not match token' });
      }
      
      // Clean up token
      delete devTokens[token];
      
      console.log('✅ Development Mode - Email verified:', email);
      
      return res.status(200).json({ 
        success: true,
        devMode: true,
        message: 'Email verified successfully in development mode'
      });
    }

    // Production mode - use database
    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: { verifyToken: token }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    // Check if token has expired
    if (user.verifyTokenExpiry && user.verifyTokenExpiry < new Date()) {
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    // Update user with verified email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ufEmail: email,
        ufEmailVerified: true,
        verifyToken: null,
        verifyTokenExpiry: null,
        trustScore: { increment: 10 }
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