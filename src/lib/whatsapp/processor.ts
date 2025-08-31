import { getConversationState } from './conversation-state';
import { 
  handleInitialMessage,
  handleConsentResponse,
  handleIntentSelection,
  handleBuyingFlow,
  handleSellingFlow
} from './flow-handlers';

export async function processWhatsAppMessage(
  userId: string,
  message: string,
  hasImage: boolean = false,
  imageUrl: string = ''
): Promise<string> {
  try {
    const conversationData = await getConversationState(userId);
    const { state } = conversationData;

    // Handle conversation flow based on current state
    switch (state) {
      case 'INITIAL':
        return await handleInitialMessage(userId);

      case 'AWAITING_CONSENT':
        return await handleConsentResponse(userId, message);

      case 'AWAITING_INTENT':
      case 'VERIFIED':
        // Check for new intent or handle current intent
        const lowerMessage = message.toLowerCase().trim();
        if (lowerMessage === 'buy' || lowerMessage === 'buying') {
          return await handleIntentSelection(userId, 'BUY');
        } else if (lowerMessage === 'sell' || lowerMessage === 'selling') {
          return await handleIntentSelection(userId, 'SELL');
        } else if (lowerMessage === 'help') {
          return `🐊 GatorEx Bot Commands:

🛒 "BUY" - Search for items or set up alerts
🏷️ "SELL" - List an item for sale
📋 "HELP" - Show this menu

What would you like to do?`;
        } else if (message.toUpperCase().includes('RENEW')) {
          const { handleRenewalRequest } = await import('../listings/expiry');
          return await handleRenewalRequest(userId, message);
        } else if (state === 'AWAITING_INTENT') {
          return await handleIntentSelection(userId, message);
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
        return await handleBuyingFlow(userId, message, state);

      // Selling flow states
      case 'SELLING_ITEM_NAME':
      case 'SELLING_PRICE':
      case 'SELLING_IMAGE':
      case 'SELLING_MEETING_SPOT':
      case 'SELLING_EXTERNAL_LINK':
      case 'SELLING_CATEGORY_CONFIRM':
      case 'SELLING_CONDITION_CONFIRM':
        return await handleSellingFlow(userId, message, state, hasImage, imageUrl);

      default:
        // Fallback - restart conversation
        return await handleInitialMessage(userId);
    }

  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
    return 'Sorry, something went wrong. Please try again or say "HELP" for options.';
  }
}