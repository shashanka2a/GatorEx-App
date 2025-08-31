import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createSubscription(
  whatsappId: string,
  itemName: string,
  priceRange?: string
): Promise<void> {
  // Extract keywords from item name
  const keywords = itemName.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2)
    .map(word => word.replace(/[^\w]/g, ''));

  // Suggest category based on item name
  const category = suggestCategory(itemName);

  await prisma.subscription.create({
    data: {
      whatsappId,
      itemName,
      priceRange,
      category,
      keywords
    }
  });
}

export async function createBuyRequest(
  whatsappId: string,
  itemName: string,
  priceRange?: string
): Promise<void> {
  // Buy requests expire in 30 days
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.buyRequest.create({
    data: {
      whatsappId,
      itemName,
      priceRange,
      expiresAt
    }
  });
}

export async function notifySubscribers(listing: any): Promise<void> {
  // Find matching subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: {
      active: true,
      OR: [
        // Match by category
        { category: listing.category },
        // Match by keywords in title
        {
          keywords: {
            hasSome: extractKeywords(listing.title)
          }
        }
      ]
    }
  });

  // Send notifications to subscribers
  for (const subscription of subscriptions) {
    // Check price range if specified
    if (subscription.priceRange && listing.price) {
      const priceMatch = checkPriceMatch(subscription.priceRange, listing.price);
      if (!priceMatch) continue;
    }

    // Send notification (implement WhatsApp sending)
    await sendSubscriptionNotification(subscription.whatsappId, listing);
  }
}

function suggestCategory(itemName: string): string {
  const item = itemName.toLowerCase();
  
  if (item.includes('phone') || item.includes('laptop') || item.includes('computer')) {
    return 'Electronics';
  } else if (item.includes('book') || item.includes('textbook')) {
    return 'Books';
  } else if (item.includes('bike') || item.includes('scooter')) {
    return 'Transportation';
  } else if (item.includes('clothes') || item.includes('shirt') || item.includes('dress')) {
    return 'Clothing';
  } else if (item.includes('furniture') || item.includes('desk') || item.includes('chair')) {
    return 'Furniture';
  }
  
  return 'Other';
}

function extractKeywords(text: string): string[] {
  return text.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2)
    .map(word => word.replace(/[^\w]/g, ''));
}

function checkPriceMatch(priceRange: string, listingPrice: number): boolean {
  const range = priceRange.toLowerCase();
  
  // Handle "under X" format
  if (range.includes('under')) {
    const maxPrice = parseFloat(range.replace(/[^\d.]/g, ''));
    return listingPrice <= maxPrice;
  }
  
  // Handle "X-Y" format
  if (range.includes('-')) {
    const [min, max] = range.split('-').map(p => parseFloat(p.replace(/[^\d.]/g, '')));
    return listingPrice >= min && listingPrice <= max;
  }
  
  // Handle "over X" format
  if (range.includes('over') || range.includes('above')) {
    const minPrice = parseFloat(range.replace(/[^\d.]/g, ''));
    return listingPrice >= minPrice;
  }
  
  return true; // Default to match if can't parse
}

async function sendSubscriptionNotification(whatsappId: string, listing: any): Promise<void> {

  const message = `🔔 New match for your alert!

📱 ${listing.title}
💰 $${listing.price}
📍 ${listing.category}

Interested? Contact the seller:
${generateWhatsAppContactLink(listing.user.whatsappId, listing.title)}`;

  try {
    if (process.env.NODE_ENV === 'production' && process.env.WHATSAPP_ACCESS_TOKEN) {
      const { sendWhatsAppMessage } = await import('../whatsapp/sender');
      await sendWhatsAppMessage(whatsappId, message);
    } else {
      console.log(`[DEV] Notification to ${whatsappId}: ${message}`);
    }
  } catch (error) {
    console.error('Failed to send subscription notification:', error);
  }
}

function generateWhatsAppContactLink(sellerWhatsappId: string, itemTitle: string): string {
  return `https://wa.me/${sellerWhatsappId}?text=${encodeURIComponent(`Hi! I'm interested in your "${itemTitle}" listing on GatorEx.`)}`;
}