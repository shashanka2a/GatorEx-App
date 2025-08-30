export function generateWhatsAppBotLink(intent?: 'sell' | 'buy'): string {
  const baseNumber = process.env.WHATSAPP_BOT_NUMBER || '1234567890';
  let message = 'Hi GatorEx Bot!';
  
  if (intent === 'sell') {
    message = 'SELL';
  } else if (intent === 'buy') {
    message = 'BUY';
  }
  
  return `https://wa.me/${baseNumber}?text=${encodeURIComponent(message)}`;
}

export function generateQRCodeData(intent?: 'sell' | 'buy'): string {
  return generateWhatsAppBotLink(intent);
}

export function generateShareableContent(intent?: 'sell' | 'buy'): {
  title: string;
  message: string;
  link: string;
} {
  const link = generateWhatsAppBotLink(intent);
  
  if (intent === 'sell') {
    return {
      title: '🏷️ Sell on GatorEx',
      message: `🐊 Sell your stuff to UF students safely on GatorEx!\n\nTap to start listing: ${link}`,
      link
    };
  } else if (intent === 'buy') {
    return {
      title: '🛒 Buy on GatorEx', 
      message: `🐊 Find great deals from UF students on GatorEx!\n\nTap to start shopping: ${link}`,
      link
    };
  } else {
    return {
      title: '🐊 Join GatorEx',
      message: `🐊 Buy and sell safely with fellow UF students on GatorEx!\n\nGet started: ${link}`,
      link
    };
  }
}

export function generateGroupShareMessage(): string {
  const link = generateWhatsAppBotLink();
  
  return `🐊 **GatorEx Bot** - Safe buying & selling for UF students!

📱 DM the bot to get started: ${link}

✅ UF email verification required
🔒 Safe campus meetups only  
⚡ Quick & easy listings

*Note: Please DM the bot directly - it doesn't work in groups*`;
}