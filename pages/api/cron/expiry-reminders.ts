import { NextApiRequest, NextApiResponse } from 'next';
import { sendExpiryReminders } from '../../../src/lib/listings/expiry';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify this is a legitimate cron request
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await sendExpiryReminders();
    res.status(200).json({ success: true, message: 'Expiry reminders sent' });
  } catch (error) {
    console.error('Error sending expiry reminders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}