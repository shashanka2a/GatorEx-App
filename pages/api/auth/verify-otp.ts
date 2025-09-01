import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { signIn } from 'next-auth/react';

const prisma = new PrismaClient();

// Verify OTP
async function verifyOTP(email: string, inputCode: string): Promise<{ success: boolean; message: string }> {
  try {
    // Get the latest OTP for this email
    const otpRecord = await prisma.oTP.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return { success: false, message: 'No OTP found. Please request a new code.' };
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      return { success: false, message: 'Code expired. Please request a new code.' };
    }

    // Check attempts
    if (otpRecord.attempts && otpRecord.attempts >= 3) {
      return { success: false, message: 'Too many attempts. Please request a new code.' };
    }

    // Verify code
    if (otpRecord.code !== inputCode) {
      // Increment attempts
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { attempts: (otpRecord.attempts || 0) + 1 }
      });

      return { success: false, message: 'Invalid code. Please try again.' };
    }

    // Success - delete the used OTP
    await prisma.oTP.delete({
      where: { id: otpRecord.id }
    });

    return { success: true, message: 'Code verified successfully!' };
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    return { success: false, message: 'Verification failed. Please try again.' };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate code format (6 digits)
  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Code must be 6 digits' });
  }

  try {
    // Verify the OTP
    const result = await verifyOTP(email, code);
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    // OTP verified successfully - now create or update user
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          ufEmail: email,
          ufEmailVerified: true,
          trustScore: 10 // Initial trust score for verified UF email
        }
      });
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ufEmail: email,
          ufEmailVerified: true,
          trustScore: { increment: 5 } // Bonus for re-verification
        }
      });
    }

    // Determine redirect URL
    let redirectTo = '/buy'; // Default
    if (!user.profileCompleted) {
      redirectTo = '/complete-profile';
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully signed in!',
      redirectTo,
      user: {
        id: user.id,
        email: user.email,
        ufEmailVerified: user.ufEmailVerified,
        profileCompleted: user.profileCompleted
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}