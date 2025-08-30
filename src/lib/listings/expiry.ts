import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function sendExpiryReminders(): Promise<void> {
  // Find listings expiring in 2 days
  const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const oneDayFromNow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
  
  const expiringListings = await prisma.listing.findMany({
    where: {
      status: 'PUBLISHED',
      expiresAt: {
        gte: oneDayFromNow,
        lte: twoDaysFromNow
      }
    },
    include: {
      user: true
    }
  });

  for (const listing of expiringListings) {
    await sendExpiryReminderMessage(listing);
  }
}

export async function renewListing(listingId: string): Promise<void> {
  // Extend expiry by 14 days
  const newExpiryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  
  await prisma.listing.update({
    where: { id: listingId },
    data: { expiresAt: newExpiryDate }
  });
}

async function sendExpiryReminderMessage(listing: any): Promise<void> {
  const daysLeft = Math.ceil((listing.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  
  const message = `⏰ Your "${listing.title}" listing expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}!

Want to renew for another 14 days?

Reply "RENEW ${listing.id}" to extend it, or let it expire naturally.

💰 Current price: $${listing.price}
📅 Expires: ${listing.expiresAt.toLocaleDateString()}`;

  // TODO: Implement WhatsApp message sending
  console.log(`Expiry reminder to ${listing.user.whatsappId}: ${message}`);
}

export async function handleRenewalRequest(whatsappId: string, message: string): Promise<string> {
  const renewMatch = message.match(/RENEW\s+([a-zA-Z0-9]+)/i);
  
  if (!renewMatch) {
    return `To renew a listing, reply "RENEW [listing-id]" from the reminder message.`;
  }
  
  const listingId = renewMatch[1];
  
  // Verify user owns the listing
  const listing = await prisma.listing.findFirst({
    where: {
      id: listingId,
      user: { whatsappId },
      status: 'PUBLISHED'
    }
  });
  
  if (!listing) {
    return `Sorry, I couldn't find that listing or you don't have permission to renew it.`;
  }
  
  await renewListing(listingId);
  
  return `✅ Your "${listing.title}" listing has been renewed for another 14 days!

📅 New expiry date: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}`;
}