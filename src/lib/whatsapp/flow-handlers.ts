// Email verification imports removed - not needed for WhatsApp flow
import { getConversationState, updateConversationState, clearConversationState } from './conversation-state';
import { checkRateLimit } from './rate-limiter';
import { moderateContent } from './moderation';
import { createDraftListing, publishListing } from '../listings/manager';
import { suggestCategoryAndCondition } from './ai-suggestions';

export async function handleInitialMessage(userId: string): Promise<string> {
  await updateConversationState(userId, 'AWAITING_CONSENT');
  
  return `👋 Welcome to GatorEx! 

I help UF students buy and sell items safely on campus.

To get started, I need your consent to:
• Store your user information
• Send you listing notifications
• Connect you with other students

Reply "YES" to continue or "NO" to stop.`;
}

export async function handleConsentResponse(userId: string, message: string): Promise<string> {
  const consent = message.toUpperCase().trim();
  
  if (consent === 'YES') {
    // Since only UF students can access this system, directly create verified user
    const { findOrCreateUser } = await import('../users/manager');
    const user = await findOrCreateUser(userId);
    
    // Mark as verified UF student (since they can only access if they're UF students)
    await updateConversationState(userId, 'AWAITING_INTENT', {
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

export async function handleIntentSelection(userId: string, message: string): Promise<string> {
  const intent = message.toUpperCase().trim();
  
  if (intent === 'BUY' || intent === 'BUYING') {
    await updateConversationState(userId, 'BUYING_ITEM_NAME', { intent: 'BUYING' });
    return `🛒 What are you looking to buy?

Just tell me the item name (e.g., "iPhone 13", "calculus textbook", "bike"):`;
  } else if (intent === 'SELL' || intent === 'SELLING') {
    await updateConversationState(userId, 'SELLING_ITEM_NAME', { intent: 'SELLING' });
    return `🏷️ What are you selling?

Please tell me the item name:`;
  } else {
    return `Please reply "BUY" if you're looking to purchase something, or "SELL" if you want to list an item.`;
  }
}

export async function handleBuyingFlow(userId: string, message: string, state: string): Promise<string> {
  const conversationData = await getConversationState(userId);
  
  switch (state) {
    case 'BUYING_ITEM_NAME':
      await updateConversationState(userId, 'BUYING_PRICE_RANGE', {
        itemName: message.trim()
      });
      return `Got it! Looking for "${message.trim()}"

What's your budget? (optional - just say "skip" if you don't want to specify)

Examples: "$50-100", "under $200", "skip"`;

    case 'BUYING_PRICE_RANGE':
      const priceRange = message.toLowerCase().trim() === 'skip' ? undefined : message.trim();
      
      await updateConversationState(userId, 'BUYING_CONFIRM_SUBSCRIPTION', {
        priceRange
      });
      
      return `Perfect! I'll notify you when someone posts:
📱 ${conversationData.itemName}${priceRange ? `\n💰 ${priceRange}` : ''}

Reply "CONFIRM" to set up alerts, or "POST REQUEST" to post a buy request that sellers can see.`;

    case 'BUYING_CONFIRM_SUBSCRIPTION':
      if (message.toUpperCase().includes('CONFIRM')) {
        const { createSubscription } = await import('../subscriptions/manager');
        await createSubscription(userId, conversationData.itemName!, conversationData.priceRange);
        await clearConversationState(userId);
        return `✅ Alert set up! I'll message you when matching items are posted.

Want to do anything else? Just say "BUY" or "SELL"`;
      } else if (message.toUpperCase().includes('POST')) {
        const { createBuyRequest } = await import('../subscriptions/manager');
        await createBuyRequest(userId, conversationData.itemName!, conversationData.priceRange);
        await clearConversationState(userId);
        return `📢 Buy request posted! Sellers can now see you're looking for "${conversationData.itemName}"

Want to do anything else? Just say "BUY" or "SELL"`;
      } else {
        return `Reply "CONFIRM" for alerts or "POST REQUEST" to let sellers know you're buying.`;
      }
  }
  
  return `Something went wrong. Let's start over - say "BUY" or "SELL"`;
}

export async function handleSellingFlow(userId: string, message: string, state: string, hasImage: boolean = false, imageUrl: string = ''): Promise<string> {
  const conversationData = await getConversationState(userId);
  
  switch (state) {
    case 'SELLING_ITEM_NAME':
      // Check moderation
      const moderationResult = await moderateContent(message);
      if (!moderationResult.allowed) {
        return `Sorry, I can't help you sell that item. ${moderationResult.reason}

Please try a different item:`;
      }
      
      await updateConversationState(userId, 'SELLING_PRICE', {
        itemName: message.trim()
      });
      return `Great! Now what's your asking price for "${message.trim()}"?

Please enter a number (e.g., "50", "125.99"):`;

    case 'SELLING_PRICE':
      const price = parseFloat(message.replace(/[$,]/g, ''));
      if (isNaN(price) || price <= 0) {
        return `That doesn't look like a valid price. Please enter just the number (e.g., "50", "125.99"):`;
      }
      
      await updateConversationState(userId, 'SELLING_IMAGE', { price });
      return `Perfect! $${price} for ${conversationData.itemName}

Now I need at least one photo. Please send me a clear image of your item:`;

    case 'SELLING_IMAGE':
      if (!hasImage) {
        return `I need a photo to create your listing. Please send me an image of "${conversationData.itemName}":`;
      }
      
      // Get AI suggestions for category and condition
      const suggestions = await suggestCategoryAndCondition(conversationData.itemName || '');
      
      await updateConversationState(userId, 'SELLING_CATEGORY_CONFIRM', {
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
        // Parse user correction and normalize
        const { validateCategory, validateCondition } = await import('./ai-suggestions');
        const parts = message.split('-').map(p => p.trim());
        if (parts.length >= 2) {
          category = validateCategory(parts[0]);
          condition = validateCondition(parts[1]);
        } else {
          category = validateCategory(message.trim());
        }
      }
      
      await updateConversationState(userId, 'SELLING_MEETING_SPOT', {
        category,
        condition
      });
      
      return `Got it! Where would you like to meet buyers?

Suggestions: "Reitz Union", "Library West", "Student Rec Center"
Or just say "skip" if you'll decide later:`;

    case 'SELLING_MEETING_SPOT':
      const meetingSpot = message.toLowerCase().trim() === 'skip' ? undefined : message.trim();
      
      await updateConversationState(userId, 'SELLING_EXTERNAL_LINK', { meetingSpot });
      return `Any external links? (Facebook Marketplace, Amazon, etc.)

Send the link or say "skip":`;

    case 'SELLING_EXTERNAL_LINK':
      const externalLink = message.toLowerCase().trim() === 'skip' ? undefined : message.trim();
      
      // Check rate limits
      const rateLimitResult = await checkRateLimit(userId);
      if (!rateLimitResult.allowed) {
        await clearConversationState(userId);
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
        
        const listing = await publishListing(userId, listingData);
        await clearConversationState(userId);
        
        const listingUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/listing/${listing.id}`;
        // Generate contact link using phone number for iMessage/SMS
        const { generateContactLink } = await import('../users/manager');
        const contactLink = await generateContactLink(userId, conversationData.itemName);
        
        return `🎉 Your listing is live!

📱 ${conversationData.itemName} - $${conversationData.price}
🔗 ${listingUrl}

Buyers will contact you via: ${contactLink}

Your listing expires in 14 days. I'll remind you 2 days before!

Want to list something else? Just say "SELL"`;
      } catch (error) {
        await clearConversationState(userId);
        return `Sorry, something went wrong creating your listing. Please try again by saying "SELL"`;
      }
  }
  
  return `Something went wrong. Let's start over - say "SELL"`;
}