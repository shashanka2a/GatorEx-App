import { NextApiRequest, NextApiResponse } from 'next';

export function verifyWhatsAppWebhook(req: NextApiRequest, res: NextApiResponse) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    console.error('WhatsApp webhook verification failed');
    res.status(403).send('Forbidden');
  }
}