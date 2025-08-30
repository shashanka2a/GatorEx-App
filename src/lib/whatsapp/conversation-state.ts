import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type ConversationState = 
  | 'INITIAL'
  | 'AWAITING_CONSENT'
  | 'AWAITING_UF_EMAIL'
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
}

export async function getConversationState(whatsappId: string): Promise<ConversationData> {
  const user = await prisma.user.findUnique({
    where: { whatsappId },
    select: { 
      conversationState: true,
      conversationData: true,
      ufEmailVerified: true
    }
  });

  if (!user) {
    return { state: 'INITIAL' };
  }

  if (user.ufEmailVerified) {
    return { state: 'VERIFIED' };
  }

  return {
    state: (user.conversationState as ConversationState) || 'INITIAL',
    ...(user.conversationData as any || {})
  };
}

export async function updateConversationState(
  whatsappId: string, 
  state: ConversationState, 
  data?: Partial<ConversationData>
): Promise<void> {
  const currentData = await getConversationState(whatsappId);
  const updatedData = { ...currentData, ...data, state };

  await prisma.user.upsert({
    where: { whatsappId },
    create: {
      whatsappId,
      conversationState: state,
      conversationData: updatedData
    },
    update: {
      conversationState: state,
      conversationData: updatedData
    }
  });
}

export async function clearConversationState(whatsappId: string): Promise<void> {
  await prisma.user.update({
    where: { whatsappId },
    data: {
      conversationState: 'VERIFIED',
      conversationData: {}
    }
  });
}