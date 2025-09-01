import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP in database
async function storeOTP(email: string, otp: string): Promise<boolean> {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP for this email first
    await prisma.oTP.deleteMany({
      where: { email }
    });

    // Create new OTP record
    await prisma.oTP.create({
      data: {
        email,
        code: otp,
        expiresAt,
        attempts: 0
      }
    });

    return true;
  } catch (error) {
    console.error('Failed to store OTP:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Check if it's a UF email
  const ufDomains = ['ufl.edu', 'gators.ufl.edu'];
  const domain = email.toLowerCase().split('@')[1];
  if (!ufDomains.includes(domain)) {
    return res.status(400).json({ 
      error: 'Please use your UF email address (@ufl.edu or @gators.ufl.edu)' 
    });
  }

  try {
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP in database
    const stored = await storeOTP(email, otp);
    if (!stored) {
      return res.status(500).json({ error: 'Failed to generate code. Please try again.' });
    }

    // For now, just return success without sending email
    // In development, log the OTP code
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 OTP for ${email}: ${otp}`);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Verification code generated! Check console for code in development.',
      ...(process.env.NODE_ENV === 'development' && { otp }) // Include OTP in dev mode
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}