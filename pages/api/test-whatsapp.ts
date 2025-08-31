import { NextApiRequest, NextApiResponse } from 'next';
import { processWhatsAppMessage } from '../../src/lib/whatsapp/processor';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'Missing userId or message' });
    }

    console.log(`🧪 Testing message processing for ${userId}: "${message}"`);
    
    const response = await processWhatsAppMessage(userId, message);
    
    console.log(`🤖 Generated response: "${response}"`);
    
    res.status(200).json({ 
      success: true, 
      response,
      userId,
      message 
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}