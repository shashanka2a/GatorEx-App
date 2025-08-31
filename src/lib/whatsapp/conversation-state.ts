import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type ConversationState = 
  | 'INITIAL'
  | 'AWAITING_CONSENT'
  | 'AWAITING_INTENT'
  | 'BUYING_ITEM_NAME'
  | 'BUYING_PRICE_RANGE'
  | 'BUYING_CONFIRM_SUBSCRIPTION'
  | 'SELLING_ITEM_NAME'
  | 'SELLING_PRICE'
  | 'SELLING_IMAGE'
  | 'SELLING_MEETING_SPOT'
  | 'SELLING_EXTERNAL_LINK'
  | 'SELLING_CATEGORY_CONFIRM'
  | 'SELLING_CONDITION_CONFIRM'
  | 'VERIFIED';

export interface ConversationData {
  state: ConversationState;
  itemName?: string;
  price?: number;
  priceRange?: string;
  images?: string[];
  meetingSpot?: string;
  externalLink?: string;
  category?: string;
  condition?: string;
  ufName?: string;
  ufEmail?: string;
  intent?: 'BUYING' | 'SELLING';
  ufVerified?: boolean;
  onboardingComplete?: boolean;
}

export async function getConversationState(userId: string): Promise<ConversationData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      ufEmailVerified: true
    }
  });

  if (!user) {
    return { state: 'INITIAL' };
  }

  if (user.ufEmailVerified) {
    return { state: 'VERIFIED' };
  }

  return { state: 'INITIAL' };
}

export async function updateConversationState(
  userId: string, 
  state: ConversationState, 
  data?: Partial<ConversationData>
): Promise<void> {
  // For now, we'll use a simple in-memory store since the schema doesn't have conversation fields
  // In a real implementation, you'd want to add conversationState and conversationData fields to the User model
  console.log(`Updating conversation state for ${userId}: ${state}`, data);
}

export async function clearConversationState(userId: string): Promise<void> {
  // For now, we'll use a simple in-memory store since the schema doesn't have conversation fields
  console.log(`Clearing conversation state for ${userId}`);
}