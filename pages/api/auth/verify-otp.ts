import { NextApiRequest, NextApiResponse } from 'next';
import { verifyOTP } from '../../../src/lib/auth/verification';
import { createSession, setSessionCookie } from '../../../src/lib/auth/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, otpCode } = req.body;
    
    if (!email || !otpCode) {
      return res.status(400).json({ error: 'Email and OTP code are required' });
    }

    // Get client IP
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     req.connection.remoteAddress || 
                     '127.0.0.1';

    const result = await verifyOTP(email.toLowerCase().trim(), otpCode.trim(), ipAddress);
    
    if (result.success && result.userId) {
      // Create session
      const sessionToken = createSession(result.userId, email);
      setSessionCookie(res, sessionToken);
      
      res.status(200).json({ 
        message: result.message,
        redirectTo: '/complete-profile'
      });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}