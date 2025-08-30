import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { generateVerificationToken, sendVerificationEmail } from '../../src/lib/email/verification';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Validate UF email
  if (!email.toLowerCase().endsWith('@ufl.edu')) {
    return res.status(400).json({ error: 'Please use a valid UF email address (@ufl.edu)' });
  }

  try {
    // In development mode, skip database and email for demo purposes
    if (process.env.NODE_ENV === 'development') {
      const token = generateVerificationToken();
      const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?token=${token}&email=${encodeURIComponent(email)}`;
      
      console.log('🔗 Development Mode - Verification link:');
      console.log(verifyLink);
      console.log('📧 Email:', email);
      console.log('🎫 Token:', token);
      
      // Store token in memory for development (in production this would be in database)
      if (typeof global === 'undefined') {
        (global as any) = {};
      }
      if (!(global as any).devTokens) {
        (global as any).devTokens = {};
      }
      (global as any).devTokens[token] = {
        email: email.toLowerCase(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
      
      return res.status(200).json({ 
        success: true, 
        message: 'Verification email sent successfully',
        devMode: true,
        verifyLink // Include link in response for development
      });
    }

    // Production mode - use database and email
    // Check if user already exists and is verified
    const existingUser = await prisma.user.findUnique({
      where: { ufEmail: email.toLowerCase() }
    });

    if (existingUser?.ufEmailVerified) {
      return res.status(400).json({ error: 'This email is already verified' });
    }

    // Generate verification token
    const token = generateVerificationToken();

    // Create or update user with verification token (24-hour expiry)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    
    await prisma.user.upsert({
      where: { ufEmail: email.toLowerCase() },
      update: { 
        verifyToken: token,
        verifyTokenExpiry: expiryDate
      },
      create: {
        whatsappId: `web_${Date.now()}_${Math.random().toString(36).substring(7)}`, // Temporary ID for web users
        ufEmail: email.toLowerCase(),
        source: 'WEB',
        verifyToken: token,
        verifyTokenExpiry: expiryDate,
        ufEmailVerified: false
      }
    });

    // Send verification email
    await sendVerificationEmail(email.toLowerCase(), token);

    res.status(200).json({ 
      success: true, 
      message: 'Verification email sent successfully' 
    });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
}