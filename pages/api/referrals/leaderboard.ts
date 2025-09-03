import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getLeaderboard } from '../../../src/lib/referrals/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { period = 'week' } = req.query;
    
    if (period !== 'week' && period !== 'all') {
      return res.status(400).json({ error: 'Invalid period. Use "week" or "all"' });
    }

    const leaderboard = await getLeaderboard(period as 'week' | 'all');

    res.status(200).json({
      period,
      leaderboard: leaderboard.map(entry => ({
        rank: entry.rank,
        points: entry.points,
        email: (entry as any).users?.email ? 
          (entry as any).users.email.substring(0, 3) + '***@' + (entry as any).users.email.split('@')[1] : 
          'Anonymous'
      }))
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}