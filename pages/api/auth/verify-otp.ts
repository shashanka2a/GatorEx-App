import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';

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

    const now = new Date();
    
    if (!user) {
      // Create new user without automatic terms acceptance
      user = await prisma.user.create({
        data: {
          email,
          ufEmail: email,
          ufEmailVerified: true,
          termsAccepted: false, // Let user explicitly accept terms
          privacyAccepted: false, // Let user explicitly accept privacy policy
          trustScore: 10 // Initial trust score for verified UF email
        }
      });
    } else {
      // Update existing user verification status
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ufEmail: email,
          ufEmailVerified: true,
          trustScore: { increment: 5 } // Bonus for re-verification
        }
      });
    }

    // Create a session for the user
    // We need to create a session record in the database
    const sessionToken = `otp-session-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires
      }
    });

    // Set the session cookie
    res.setHeader('Set-Cookie', [
      `next-auth.session-token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}`,
      `__Secure-next-auth.session-token=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires.toUTCString()}`
    ]);

    // Process referral if exists
    try {
      const referralCode = req.cookies.gex_ref;
      if (referralCode) {
        // Process referral completion
        const referralResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/referrals/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            refereeUserId: user.id,
            refereeEmail: email,
            referralCode,
            ipHash: require('crypto').createHash('sha256').update((req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1') + (process.env.REFERRAL_SALT || 'salt')).digest('hex'),
            uaHash: require('crypto').createHash('sha256').update((req.headers['user-agent'] || '') + (process.env.REFERRAL_SALT || 'salt')).digest('hex')
          })
        });

        if (referralResponse.ok) {
          // Clear referral cookie after processing
          const existingCookies = res.getHeaders()['set-cookie'];
          const cookieArray = Array.isArray(existingCookies) ? existingCookies : existingCookies ? [existingCookies] : [];
          res.setHeader('Set-Cookie', [
            ...cookieArray,
            'gex_ref=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
          ]);
        }
      }
    } catch (error) {
      console.error('Referral processing error:', error);
      // Don't fail the verification if referral processing fails
    }

    // Determine redirect URL based on user status
    let redirectTo = '/buy'; // Default
    
    // Check if user needs to accept terms first
    if (!user.termsAccepted || !user.privacyAccepted) {
      redirectTo = '/terms';
    } else if (!user.profileCompleted) {
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

  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}