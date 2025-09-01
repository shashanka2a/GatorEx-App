import { NextApiRequest, NextApiResponse } from 'next';
import { verifyOTP } from '../../../src/lib/auth/otp';
import { prisma } from '../../../src/lib/db/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  try {
    // Verify the OTP
    const verification = await verifyOTP(email, code);
    
    if (!verification.success) {
      return res.status(400).json({ error: verification.message });
    }

    // OTP verified successfully - now handle user creation/login
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          emailVerified: new Date(),
          ufEmail: email,
          ufEmailVerified: true,
          name: email.split('@')[0], // Use email prefix as initial name
        }
      });
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { email },
        data: {
          emailVerified: new Date(),
          ufEmailVerified: true,
        }
      });
    }

    // Create a simple JWT token for session
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        verified: true 
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.setHeader('Set-Cookie', [
      `gatorex-token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    ]);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileCompleted: user.profileCompleted
      },
      redirectTo: user.profileCompleted ? '/me' : '/complete-profile'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}