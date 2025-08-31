import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createSubscription(
  userId: string,
  itemName: string,
  priceRange?: string
): Promise<void> {
  // For now, just log the subscription request since the subscription model doesn't exist in the schema
  // In a real implementation, you'd want to add a Subscription model to the schema
  console.log(`Creating subscription for user ${userId}: ${itemName} (${priceRange})`);
}

export async function createBuyRequest(
  userId: string,
  itemName: string,
  priceRange?: string
): Promise<void> {
  // For now, just log the buy request since the buyRequest model doesn't exist in the schema
  // In a real implementation, you'd want to add a BuyRequest model to the schema
  console.log(`Creating buy request for user ${userId}: ${itemName} (${priceRange})`);
}

export async function notifySubscribers(listing: any): Promise<void> {
  // For now, just log the notification since the subscription model doesn't exist in the schema
  // In a real implementation, you'd want to add a Subscription model to the schema
  console.log(`Would notify subscribers about new listing: ${listing.title}`);
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

async function sendSubscriptionNotification(userId: string, listing: any): Promise<void> {

  const message = `🔔 New match for your alert!

📱 ${listing.title}
💰 $${listing.price}
📍 ${listing.category}

Interested? Contact the seller via the app!`;

  try {
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement in-app notification system
      console.log(`[PROD] Notification to ${userId}: ${message}`);
    } else {
      console.log(`[DEV] Notification to ${userId}: ${message}`);
    }
  } catch (error) {
    console.error('Failed to send subscription notification:', error);
  }
}

// Removed WhatsApp contact link generation since we're using in-app messaging