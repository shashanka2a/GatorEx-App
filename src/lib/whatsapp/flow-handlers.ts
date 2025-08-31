// Email verification imports removed - not needed for WhatsApp flow
import { getConversationState, updateConversationState, clearConversationState } from './conversation-state';
import { checkRateLimit } from './rate-limiter';
import { moderateContent } from './moderation';
import { createDraftListing, publishListing } from '../listings/manager';
import { suggestCategoryAndCondition } from './ai-suggestions';

export async function handleInitialMessage(whatsappId: string): Promise<string> {
  await updateConversationState(whatsappId, 'AWAITING_CONSENT');
  
  return `👋 Welcome to GatorEx! 

I help UF students buy and sell items safely on campus.

To get started, I need your consent to:
• Store your WhatsApp number
• Send you listing notifications
• Connect you with other students

Reply "YES" to continue or "NO" to stop.`;
}

export async function handleConsentResponse(whatsappId: string, message: string): Promise<string> {
  const consent = message.toUpperCase().trim();
  
  if (consent === 'YES') {
    // Since only UF students can access this bot, directly create verified user
    const { findOrCreateUser } = await import('../users/manager');
    const user = await findOrCreateUser(whatsappId);
    
    // Mark as verified UF student (since they can only access if they're UF students)
    await updateConversationState(whatsappId, 'AWAITING_INTENT', {
      ufVerified: true,
      onboardingComplete: true
    });
    
    return `🎉 Perfect! You're all set up!

What would you like to do today?

🛒 **BUY** - Search for items or set up alerts
🏷️ **SELL** - List an item for sale

Just reply "BUY" or "SELL" to get started!`;
  } else if (consent === 'NO') {
    return `No problem! Feel free to message me anytime if you change your mind. 

Have a great day! 🐊`;
  } else {
    return `Please reply "YES" to continue or "NO" to stop.`;
  }
}

// UF Email submission removed - not needed since only UF students can access the bot

export async function handleIntentSelection(whatsappId: string, message: string): Promise<string> {
  const intent = message.toUpperCase().trim();
  
  if (intent === 'BUY' || intent === 'BUYING') {
    await updateConversationState(whatsappId, 'BUYING_ITEM_NAME', { intent: 'BUYING' });
    return `🛒 What are you looking to buy?

Just tell me the item name (e.g., "iPhone 13", "calculus textbook", "bike"):`;
  } else if (intent === 'SELL' || intent === 'SELLING') {
    await updateConversationState(whatsappId, 'SELLING_ITEM_NAME', { intent: 'SELLING' });
    return `🏷️ What are you selling?

Please tell me the item name:`;
  } else {
    return `Please reply "BUY" if you're looking to purchase something, or "SELL" if you want to list an item.`;
  }
}

export async function handleBuyingFlow(whatsappId: string, message: string, state: string): Promise<string> {
  const conversationData = await getConversationState(whatsappId);
  
  switch (state) {
    case 'BUYING_ITEM_NAME':
      await updateConversationState(whatsappId, 'BUYING_PRICE_RANGE', {
        itemName: message.trim()
      });
      return `Got it! Looking for "${message.trim()}"

What's your budget? (optional - just say "skip" if you don't want to specify)

Examples: "$50-100", "under $200", "skip"`;

    case 'BUYING_PRICE_RANGE':
      const priceRange = message.toLowerCase().trim() === 'skip' ? undefined : message.trim();
      
      await updateConversationState(whatsappId, 'BUYING_CONFIRM_SUBSCRIPTION', {
        priceRange
      });
      
      return `Perfect! I'll notify you when someone posts:
📱 ${conversationData.itemName}${priceRange ? `\n💰 ${priceRange}` : ''}

Reply "CONFIRM" to set up alerts, or "POST REQUEST" to post a buy request that sellers can see.`;

    case 'BUYING_CONFIRM_SUBSCRIPTION':
      if (message.toUpperCase().includes('CONFIRM')) {
        const { createSubscription } = await import('../subscriptions/manager');
        await createSubscription(whatsappId, conversationData.itemName!, conversationData.priceRange);
        await clearConversationState(whatsappId);
        return `✅ Alert set up! I'll message you when matching items are posted.

Want to do anything else? Just say "BUY" or "SELL"`;
      } else if (message.toUpperCase().includes('POST')) {
        const { createBuyRequest } = await import('../subscriptions/manager');
        await createBuyRequest(whatsappId, conversationData.itemName!, conversationData.priceRange);
        await clearConversationState(whatsappId);
        return `📢 Buy request posted! Sellers can now see you're looking for "${conversationData.itemName}"

Want to do anything else? Just say "BUY" or "SELL"`;
      } else {
        return `Reply "CONFIRM" for alerts or "POST REQUEST" to let sellers know you're buying.`;
      }
  }
  
  return `Something went wrong. Let's start over - say "BUY" or "SELL"`;
}

export async function handleSellingFlow(whatsappId: string, message: string, state: string, hasImage: boolean = false, imageUrl: string = ''): Promise<string> {
  const conversationData = await getConversationState(whatsappId);
  
  switch (state) {
    case 'SELLING_ITEM_NAME':
      // Check moderation
      const moderationResult = await moderateContent(message);
      if (!moderationResult.allowed) {
        return `Sorry, I can't help you sell that item. ${moderationResult.reason}

Please try a different item:`;
      }
      
      await updateConversationState(whatsappId, 'SELLING_PRICE', {
        itemName: message.trim()
      });
      return `Great! Now what's your asking price for "${message.trim()}"?

Please enter a number (e.g., "50", "125.99"):`;

    case 'SELLING_PRICE':
      const price = parseFloat(message.replace(/[$,]/g, ''));
      if (isNaN(price) || price <= 0) {
        return `That doesn't look like a valid price. Please enter just the number (e.g., "50", "125.99"):`;
      }
      
      await updateConversationState(whatsappId, 'SELLING_IMAGE', { price });
      return `Perfect! $${price} for ${conversationData.itemName}

Now I need at least one photo. Please send me a clear image of your item:`;

    case 'SELLING_IMAGE':
      if (!hasImage) {
        return `I need a photo to create your listing. Please send me an image of "${conversationData.itemName}":`;
      }
      
      // Get AI suggestions for category and condition
      const suggestions = await suggestCategoryAndCondition(conversationData.itemName || '');
      
      await updateConversationState(whatsappId, 'SELLING_CATEGORY_CONFIRM', {
        images: imageUrl ? [imageUrl] : [],
        category: suggestions.category,
        condition: suggestions.condition
      });
      
      return `📸 Photo received!

I think this is: ${suggestions.category} - ${suggestions.condition}

Is this correct? Reply "YES" or tell me the right category/condition:`;

    case 'SELLING_CATEGORY_CONFIRM':
      let category = conversationData.category;
      let condition = conversationData.condition;
      
      if (message.toUpperCase().trim() !== 'YES') {
        // Parse user correction
        const parts = message.split('-').map(p => p.trim());
        if (parts.length >= 2) {
          category = parts[0];
          condition = parts[1];
        } else {
          category = message.trim();
        }
      }
      
      await updateConversationState(whatsappId, 'SELLING_MEETING_SPOT', {
        category,
        condition
      });
      
      return `Got it! Where would you like to meet buyers?

Suggestions: "Reitz Union", "Library West", "Student Rec Center"
Or just say "skip" if you'll decide later:`;

    case 'SELLING_MEETING_SPOT':
      const meetingSpot = message.toLowerCase().trim() === 'skip' ? undefined : message.trim();
      
      await updateConversationState(whatsappId, 'SELLING_EXTERNAL_LINK', { meetingSpot });
      return `Any external links? (Facebook Marketplace, Amazon, etc.)

Send the link or say "skip":`;

    case 'SELLING_EXTERNAL_LINK':
      const externalLink = message.toLowerCase().trim() === 'skip' ? undefined : message.trim();
      
      // Check rate limits
      const rateLimitResult = await checkRateLimit(whatsappId);
      if (!rateLimitResult.allowed) {
        await clearConversationState(whatsappId);
        return `You've reached your daily limit of 3 listings. Try again tomorrow!`;
      }
      
      // Create the listing
      try {
        const listingData = {
          title: conversationData.itemName,
          price: conversationData.price,
          category: conversationData.category,
          condition: conversationData.condition,
          meetingSpot,
          externalLink,
          has_image: true
        };
        
        const listing = await publishListing(whatsappId, listingData);
        await clearConversationState(whatsappId);
        
        const listingUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/listing/${listing.id}`;
        const whatsappLink = `https://wa.me/${whatsappId}?text=${encodeURIComponent(`Hi! I'm interested in your "${conversationData.itemName}" listing on GatorEx.`)}`;
        
        return `🎉 Your listing is live!

📱 ${conversationData.itemName} - $${conversationData.price}
🔗 ${listingUrl}

Buyers will contact you via: ${whatsappLink}

Your listing expires in 14 days. I'll remind you 2 days before!

Want to list something else? Just say "SELL"`;
      } catch (error) {
        await clearConversationState(whatsappId);
        return `Sorry, something went wrong creating your listing. Please try again by saying "SELL"`;
      }
  }
  
  return `Something went wrong. Let's start over - say "SELL"`;
}