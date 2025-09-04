import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { analysis } = req.body;

    if (!analysis || !analysis.title) {
      return res.status(400).json({ error: 'Image analysis data is required' });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    console.log(`Generating title suggestions for user ${session.user.id}`);

    const prompt = `
Based on this image analysis of a marketplace item, generate 4 different title variations that would be appealing to college students:

Analysis:
- Detected item: ${analysis.title}
- Category: ${analysis.category}
- Condition: ${analysis.condition}
- Detected text: ${analysis.detectedText?.join(', ') || 'None'}
- Description: ${analysis.description}

Generate titles that are:
1. Clear and descriptive
2. Include key details buyers want
3. Optimized for search
4. Appeal to college students

Return ONLY a JSON array of 4 title strings:
["title1", "title2", "title3", "title4"]

Examples:
- For iPhone: ["iPhone 14 Pro Max 256GB", "iPhone 14 Pro Max - Space Black", "iPhone 14 Pro Max 256GB - Like New", "iPhone 14 Pro Max with Case & Charger"]
- For textbook: ["Calculus Early Transcendentals 8th Edition", "Stewart Calculus Textbook - 8th Ed", "Calculus Early Transcendentals by Stewart", "Calculus Textbook - Excellent Condition"]
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const suggestions = JSON.parse(content) as string[];

    // Validate suggestions
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error('Invalid suggestions format');
    }

    // Clean and validate each suggestion
    const cleanSuggestions = suggestions
      .filter(title => typeof title === 'string' && title.trim().length > 0)
      .map(title => title.trim())
      .slice(0, 4);

    console.log(`Generated ${cleanSuggestions.length} title suggestions`);

    return res.status(200).json({
      success: true,
      suggestions: cleanSuggestions,
      message: 'Title suggestions generated successfully'
    });

  } catch (error: any) {
    console.error('Title suggestion error:', error);
    
    // Return user-friendly error messages
    if (error.message?.includes('API key')) {
      return res.status(500).json({ error: 'AI service temporarily unavailable' });
    }
    
    if (error.message?.includes('rate limit')) {
      return res.status(429).json({ error: 'Too many requests. Please try again in a moment.' });
    }

    return res.status(500).json({ 
      error: 'Failed to generate suggestions. Using default titles.',
      fallback: true
    });
  }
}