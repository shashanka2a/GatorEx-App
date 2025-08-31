import { NextApiRequest, NextApiResponse } from 'next';
import { clearSessionCookie } from '../../../src/lib/auth/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  clearSessionCookie(res);
  res.status(200).json({ message: 'Logged out successfully' });
}