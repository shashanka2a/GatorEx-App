import { NextApiRequest, NextApiResponse } from 'next';
import { checkApiAuthAndTerms } from '../../../src/lib/auth/server-auth-check';
import { ListingParser } from '../../../src/lib/ai/listingParser';

// Configure API route for larger payloads (images)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authResult = await checkApiAuthAndTerms(req, res);
    if (authResult.error) {
      return res.status(authResult.status).json({ 
        error: authResult.error
      });
    }

    const { image } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Validate base64 image format
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    // Check image size (rough estimate)
    const imageSizeBytes = (image.length * 3) / 4;
    const imageSizeMB = imageSizeBytes / (1024 * 1024);
    
    if (imageSizeMB > 8) {
      return res.status(400).json({ error: 'Image too large (max 8MB)' });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'AI vision service not configured' });
    }

    const user = authResult.user;
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    console.log(`Analyzing image for user ${user.id}, size: ${imageSizeMB.toFixed(2)}MB`);

    const analysis = await ListingParser.analyzeImage(image);

    // Log successful analysis
    console.log(`Successfully analyzed image:`, {
      title: analysis.title,
      category: analysis.category,
      condition: analysis.condition,
      confidence: analysis.confidence,
      detectedTextCount: analysis.detectedText.length
    });

    return res.status(200).json({
      success: true,
      analysis,
      message: 'Image analyzed successfully'
    });

  } catch (error: any) {
    console.error('Image analysis error:', error);
    
    // Return user-friendly error messages
    if (error.message?.includes('API key')) {
      return res.status(500).json({ error: 'AI vision service temporarily unavailable' });
    }
    
    if (error.message?.includes('rate limit')) {
      return res.status(429).json({ error: 'Too many requests. Please try again in a moment.' });
    }

    if (error.message?.includes('content_policy')) {
      return res.status(400).json({ error: 'Image content not suitable for analysis' });
    }

    return res.status(500).json({ 
      error: 'Failed to analyze image. Please try again or add details manually.',
      fallback: true
    });
  }
}