import { NextApiRequest, NextApiResponse } from 'next';

// Shared in-memory storage - this needs to be the same instance as send-verification
// In production, use a database or Redis
declare global {
  var verificationTokens: Map<string, { email: string; expires: Date; otp: string }> | undefined;
}

const verificationTokens = globalThis.verificationTokens ?? new Map<string, { email: string; expires: Date; otp: string }>();
globalThis.verificationTokens = verificationTokens;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, otp, email } = req.body;

  if (!token || !otp || !email) {
    return res.status(400).json({ error: 'Token, OTP, and email are required' });
  }

  // Validate UF email
  if (!email.toLowerCase().endsWith('@ufl.edu')) {
    return res.status(400).json({ error: 'Please use a valid UF email address' });
  }

  try {
    // Get stored verification data
    const storedData = verificationTokens.get(token);

    if (!storedData) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Check if expired
    if (new Date() > storedData.expires) {
      verificationTokens.delete(token);
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    // Check email matches
    if (storedData.email !== email.toLowerCase()) {
      return res.status(400).json({ error: 'Email does not match' });
    }

    // Check OTP matches
    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Clean up used token
    verificationTokens.delete(token);

    console.log('✅ Email verified successfully:', email);

    res.status(200).json({ 
      success: true,
      message: 'Email verified successfully!',
      email: email
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
}