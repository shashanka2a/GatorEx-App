import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function aggregateMessages(whatsappId: string): Promise<string> {
  // Get messages from the last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const recentMessages = await prisma.whatsAppMessage.findMany({
    where: {
      whatsappId,
      createdAt: {
        gte: fiveMinutesAgo
      },
      processed: false
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
  
  // Mark messages as processed
  await prisma.whatsAppMessage.updateMany({
    where: {
      id: {
        in: recentMessages.map(m => m.id)
      }
    },
    data: {
      processed: true
    }
  });
  
  // Combine text and media descriptions
  let aggregatedContent = '';
  let hasImages = false;
  
  for (const message of recentMessages) {
    if (message.content) {
      aggregatedContent += message.content + '\n';
    }
    
    if (message.mediaUrl && message.mediaType === 'image') {
      aggregatedContent += '[Image attached]\n';
      hasImages = true;
    }
  }
  
  // Add image status to content for GPT context
  if (hasImages) {
    aggregatedContent += '\n[SYSTEM: User has attached images]';
  } else {
    aggregatedContent += '\n[SYSTEM: No images attached]';
  }
  
  return aggregatedContent.trim();
}