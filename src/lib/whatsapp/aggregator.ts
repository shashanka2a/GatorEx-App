import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function aggregateMessages(userId: string): Promise<string> {
  // Since we're not using WhatsApp anymore and the whatsAppMessage model doesn't exist,
  // this function now returns a simple message indicating no aggregation is needed
  console.log(`Message aggregation requested for user ${userId}`);
  return '[SYSTEM: No messages to aggregate]';
}