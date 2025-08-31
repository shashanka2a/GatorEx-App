import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../src/lib/auth/session';
import { prisma } from '../../../src/lib/db/turso';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await requireAuth(req, res);
    if (!session) return; // requireAuth already sent error response

    const { name, phoneNumber } = req.body;
    
    if (!name || !phoneNumber) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    // Validate phone number (should be 10 digits)
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
    }

    // Update user profile
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: name.trim(),
        phoneNumber: phoneDigits,
        profileCompleted: true
      }
    });

    res.status(200).json({ 
      message: 'Profile completed successfully'
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}