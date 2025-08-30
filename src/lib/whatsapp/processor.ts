import { PrismaClient } from '@prisma/client';
import { getConversationState } from './conversation-state';
import { 
  handleInitialMessage,
  handleConsentResponse,
  handleUFEmailSubmission,
  handleIntentSelection,
  handleBuyingFlow,
  handleSellingFlow
} from './flow-handlers';

const prisma = new PrismaClient();

export async function processWhatsAppMessage(
  whatsappId: string,
  message: string,
  hasImage: boolean = false
): Promise<string> {
  try {
    const conversationData = await getConversationState(whatsappId);
    const { state } = conversationData;

    // Handle conversation flow based on current state
    switch (state) {
      case 'INITIAL':
        return await handleInitialMessage(whatsappId);

      case 'AWAITING_CONSENT':
        return await handleConsentResponse(whatsappId, message);

      case 'AWAITING_UF_EMAIL':
        return await handleUFEmailSubmission(whatsappId, message);

      case 'AWAITING_INTENT':
      case 'VERIFIED':
        // Check for new intent or handle current intent
        const lowerMessage = message.toLowerCase().trim();
        if (lowerMessage === 'buy' || lowerMessage === 'buying') {
          return await handleIntentSelection(whatsappId, 'BUY');
        } else if (lowerMessage === 'sell' || lowerMessage === 'selling') {
          return await handleIntentSelection(whatsappId, 'SELL');
        } else if (lowerMessage === 'help') {
          return `🐊 GatorEx Bot Commands:

🛒 "BUY" - Search for items or set up alerts
🏷️ "SELL" - List an item for sale
📋 "HELP" - Show this menu

What would you like to do?`;
        } else if (message.toUpperCase().includes('RENEW')) {
          const { handleRenewalRequest } = await import('../listings/expiry');
          return await handleRenewalRequest(whatsappId, message);
        } else if (state === 'AWAITING_INTENT') {
          return await handleIntentSelection(whatsappId, message);
        } else {
          // Default help for verified users
          return `Hi again! What would you like to do?

🛒 Say "BUY" to search for items
🏷️ Say "SELL" to list something
📋 Say "HELP" for more options`;
        }

      // Buying flow states
      case 'BUYING_ITEM_NAME':
      case 'BUYING_PRICE_RANGE':
      case 'BUYING_CONFIRM_SUBSCRIPTION':
        return await handleBuyingFlow(whatsappId, message, state);

      // Selling flow states
      case 'SELLING_ITEM_NAME':
      case 'SELLING_PRICE':
      case 'SELLING_IMAGE':
      case 'SELLING_MEETING_SPOT':
      case 'SELLING_EXTERNAL_LINK':
      case 'SELLING_CATEGORY_CONFIRM':
      case 'SELLING_CONDITION_CONFIRM':
        return await handleSellingFlow(whatsappId, message, state, hasImage);

      default:
        // Fallback - restart conversation
        return await handleInitialMessage(whatsappId);
    }

  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
    return 'Sorry, something went wrong. Please try again or say "HELP" for options.';
  }
}