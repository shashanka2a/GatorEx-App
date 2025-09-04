import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { ListingParser } from '../../../src/lib/ai/listingParser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text input is required' });
    }

    if (text.length > 500) {
      return res.status(400).json({ error: 'Text input too long (max 500 characters)' });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API not configured' });
    }

    console.log(`Parsing listing text for user ${session.user.id}: "${text}"`);

    const parsed = await ListingParser.parseListingText(text);

    // Log successful parsing
    console.log(`Successfully parsed listing:`, {
      title: parsed.title,
      price: parsed.price,
      category: parsed.category,
      condition: parsed.condition,
      confidence: parsed.confidence
    });

    return res.status(200).json({
      success: true,
      parsed,
      message: 'Listing parsed successfully'
    });

  } catch (error: any) {
    console.error('Listing parsing error:', error);
    
    // Return user-friendly error messages
    if (error.message?.includes('API key')) {
      return res.status(500).json({ error: 'AI service temporarily unavailable' });
    }
    
    if (error.message?.includes('rate limit')) {
      return res.status(429).json({ error: 'Too many requests. Please try again in a moment.' });
    }

    return res.status(500).json({ 
      error: 'Failed to parse listing. Please try again or enter details manually.',
      fallback: true
    });
  }
}