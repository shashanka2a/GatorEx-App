import { NextApiRequest, NextApiResponse } from 'next';
import { generateOTP, sendOTPEmail, storeOTP } from '../../../src/lib/auth/otp';

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

  // Check if it's a UF email (optional - remove if you want to allow all emails)
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

    // Send OTP email
    const sent = await sendOTPEmail(email, otp);
    if (!sent) {
      return res.status(500).json({ error: 'Failed to send code. Please try again.' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Verification code sent! Check your email.' 
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}