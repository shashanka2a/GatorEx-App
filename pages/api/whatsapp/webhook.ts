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
              
              if (message.type === 'text') {
                messageText = message.text.body;
              } else if (message.type === 'image') {
                messageText = message.image.caption || '';
                hasImage = true;
              }
              
              // Process the message
              const response = await processWhatsAppMessage(whatsappId, messageText, hasImage);
              
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
  // TODO: Implement actual WhatsApp API sending
  console.log(`Sending to ${to}: ${message}`);
  
  // In production, use WhatsApp Business API
  // const response = await fetch(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     messaging_product: 'whatsapp',
  //     to,
  //     text: { body: message }
  //   })
  // });
}