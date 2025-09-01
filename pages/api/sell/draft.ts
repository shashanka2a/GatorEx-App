import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// Since we don't have a ListingDraft table, we'll use a simple in-memory approach
// In a real app, you might want to add a ListingDraft table to the schema
// For now, drafts will be handled client-side with localStorage

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.method === 'GET') {
      // Since we don't have a draft table, return empty
      return res.status(200).json({
        draft: null,
        step: 0
      });
    }

    if (req.method === 'POST') {
      // Draft saving will be handled client-side
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      // Draft clearing will be handled client-side
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error: any) {
    console.error('Draft API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}