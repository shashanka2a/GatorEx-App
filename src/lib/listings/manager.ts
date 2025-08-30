import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function createDraftListing(userId: string, listingData: any) {
  // Validate mandatory fields for ready status
  const hasAllMandatoryFields = 
    listingData.title && 
    listingData.price && 
    typeof listingData.price === 'number' && 
    listingData.has_image;
  
  // Create listing with 14-day expiry
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  
  const listing = await prisma.listing.create({
    data: {
      title: listingData.title || 'Untitled Item',
      description: listingData.description,
      price: listingData.price,
      category: listingData.category || 'Other',
      condition: listingData.condition || 'Good',
      status: hasAllMandatoryFields ? 'READY' : 'DRAFT',
      expiresAt,
      userId
    }
  });
  
  return listing;
}

export async function publishListing(userId: string, listingData: any) {
  const listing = await createDraftListing(userId, listingData);
  
  const publishedListing = await prisma.listing.update({
    where: { id: listing.id },
    data: { status: 'PUBLISHED' },
    include: {
      user: true
    }
  });
  
  // Notify subscribers about the new listing
  try {
    const { notifySubscribers } = await import('../subscriptions/manager');
    await notifySubscribers(publishedListing);
  } catch (error) {
    console.error('Error notifying subscribers:', error);
  }
  
  return publishedListing;
}

export async function updateDraftListing(listingId: string, listingData: any) {
  // Validate mandatory fields for ready status
  const hasAllMandatoryFields = 
    listingData.title && 
    listingData.price && 
    typeof listingData.price === 'number' && 
    listingData.has_image;
  
  const updatedListing = await prisma.listing.update({
    where: { id: listingId },
    data: {
      title: listingData.title || undefined,
      description: listingData.description || undefined,
      price: listingData.price || undefined,
      category: listingData.category || undefined,
      condition: listingData.condition || undefined,
      contact: listingData.contact || undefined,
      status: hasAllMandatoryFields ? 'READY' : 'DRAFT'
    }
  });
  
  return updatedListing;
}

export async function createVerificationLink(whatsappId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  
  await prisma.user.update({
    where: { whatsappId },
    data: { verifyToken: token }
  });
  
  return `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;
}