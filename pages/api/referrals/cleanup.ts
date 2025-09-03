import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/supabase';
import { REFERRAL_CONFIG } from '../../../src/lib/referrals/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret for security
  const cronSecret = req.headers['x-cron-secret'];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Calculate cutoff date (90 days ago)
    const cutoffDate = new Date(
      Date.now() - REFERRAL_CONFIG.limits.clickRetentionDays * 24 * 60 * 60 * 1000
    );

    // Delete old referral clicks
    const { count, error } = await supabase
      .from('referral_clicks')
      .delete({ count: 'exact' })
      .lt('ts', cutoffDate.toISOString());

    if (error) {
      throw error;
    }

    res.status(200).json({ 
      success: true, 
      deletedRecords: count || 0,
      cutoffDate: cutoffDate.toISOString()
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}