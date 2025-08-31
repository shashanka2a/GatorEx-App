import { NextApiRequest, NextApiResponse } from 'next';
import { processWhatsAppMessage } from '../../../src/lib/whatsapp/processor';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // WhatsApp webhook verification
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('WhatsApp webhook verified');
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log('📨 Webhook received:', JSON.stringify(body, null, 2));
      
      // Process WhatsApp messages
      if (body.entry && body.entry[0] && body.entry[0].changes) {
        const changes = body.entry[0].changes;
        
        for (const change of changes) {
          if (change.field === 'messages' && change.value.messages) {
            const messages = change.value.messages;
            
            for (const message of messages) {
              const whatsappId = message.from;
              let messageText = '';
              let hasImage = false;
              let imageUrl = '';
              
              if (message.type === 'text') {
                messageText = message.text.body;
              } else if (message.type === 'image') {
                messageText = message.image.caption || '';
                hasImage = true;
                
                // Download and store the image
                try {
                  const { downloadWhatsAppMedia } = await import('../../../src/lib/whatsapp/media');
                  imageUrl = await downloadWhatsAppMedia(message.image.id);
                } catch (error) {
                  console.error('Failed to download image:', error);
                }
              }
              
              console.log(`📱 Processing message from ${whatsappId}: "${messageText}"`);
              
              // Process the message
              const response = await processWhatsAppMessage(whatsappId, messageText, hasImage, imageUrl);
              console.log(`🤖 Generated response: "${response}"`);
              
              // Send response back to WhatsApp
              await sendWhatsAppMessage(whatsappId, response);
            }
          }
        }
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
  try {
    // Send WhatsApp message if we have the access token
    if (process.env.WHATSAPP_ACCESS_TOKEN) {
      const { sendWhatsAppMessage: actualSender } = await import('../../../src/lib/whatsapp/sender');
      await actualSender(to, message);
      console.log(`✅ Sent WhatsApp message to ${to}: ${message.substring(0, 50)}...`);
    } else {
      // No access token - just log
      console.log(`[NO TOKEN] Would send to ${to}: ${message}`);
    }
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    // Don't throw - we don't want to break the webhook if sending fails
  }
}