import axios from 'axios';

const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

export async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

const quirkySenderMessages = {
  price: [
    "👀 A price makes it real! Please drop a number so we can list your item.",
    "We can't show 'DM for price' on the marketplace — what's the asking price in $?",
    "No price, no post 😅 Give me a number (e.g., $80) and we'll get you live.",
    "💰 Need that magic number! What's your asking price?",
    "Price tag missing! 🏷️ Drop a dollar amount to get listed.",
    "Almost there! Just need a price in $ to make it official."
  ],
  title: [
    "What exactly are you selling? 🤔 Give me a clear item name!",
    "Need a better title! What's the specific item? (e.g., 'iPhone 13 Pro' not just 'phone')",
    "📝 Be specific! What item are you listing?",
    "Title needs work! What's the exact item name?",
    "Help me help you! What's the specific thing you're selling?"
  ],
  image: [
    "📸 A picture is worth a thousand sales! Please send a photo of your item.",
    "No pic, no click! 📷 Send an image to get listed.",
    "Show me what you've got! 📸 Need a photo to publish.",
    "Picture time! 📱 Send an image of your item.",
    "Visual proof needed! 📸 Snap a photo and send it over."
  ]
};

export function generateFollowUpQuestion(missingFields: string[], priceIndicators?: string[]): string {
  // Prioritize price if it's missing and we detected vague price terms
  if (missingFields.includes('price')) {
    const messages = quirkySenderMessages.price;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Add context if we detected vague price terms
    if (priceIndicators && priceIndicators.length > 0) {
      return `${randomMessage}\n\n(We saw "${priceIndicators[0]}" but need an actual $ amount for the feed!)`;
    }
    
    return randomMessage;
  }
  
  if (missingFields.includes('title')) {
    const messages = quirkySenderMessages.title;
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  if (missingFields.includes('image')) {
    const messages = quirkySenderMessages.image;
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  // Multiple missing fields
  if (missingFields.length > 1) {
    return `Almost there! I need:\n${missingFields.map(field => 
      field === 'price' ? '💰 A price in $' :
      field === 'title' ? '📝 Clear item name' :
      field === 'image' ? '📸 A photo' : field
    ).join('\n')}\n\nSend them over and we'll get you listed! 🚀`;
  }
  
  return 'Could you provide more details about the item you\'re selling?';
}