# GatorEx Onboarding Flows

## 🎯 Overview

GatorEx has two main entry points with different verification requirements:

1. **WhatsApp Bot** - Only accessible to UF students (pre-verified)
2. **Web Platform** - Open access requiring UF email verification

## 📱 WhatsApp Bot Onboarding Flow

### Access Control
- **Prerequisite**: Only UF students can access the WhatsApp bot
- **Verification**: Pre-verified through UF's WhatsApp access control
- **No additional email verification needed**

### Flow Steps:

#### 1. Initial Contact
```
User: [Any message to bot]
Bot: 👋 Welcome to GatorEx! 

I help UF students buy and sell items safely on campus.

To get started, I need your consent to:
• Store your WhatsApp number
• Send you listing notifications
• Connect you with other students

Reply "YES" to continue or "NO" to stop.
```

#### 2. Consent Collection
```
User: YES
Bot: 🎉 Perfect! You're all set up!

What would you like to do today?

🛒 BUY - Search for items or set up alerts
🏷️ SELL - List an item for sale

Just reply "BUY" or "SELL" to get started!
```

#### 3A. Buying Flow
```
User: BUY
Bot: 🛒 What are you looking to buy?

Just tell me the item name (e.g., "iPhone 13", "calculus textbook", "bike"):

User: iPhone 13
Bot: Got it! Looking for "iPhone 13"

What's your budget? (optional - just say "skip" if you don't want to specify)

Examples: "$50-100", "under $200", "skip"

User: $300-500
Bot: Perfect! I'll notify you when someone posts:
📱 iPhone 13
💰 $300-500

Reply "CONFIRM" to set up alerts, or "POST REQUEST" to post a buy request that sellers can see.

User: CONFIRM
Bot: ✅ Alert set up! I'll message you when matching items are posted.

Want to do anything else? Just say "BUY" or "SELL"
```

#### 3B. Selling Flow
```
User: SELL
Bot: 🏷️ What are you selling?

Please tell me the item name:

User: iPhone 12 Pro
Bot: Great! Now what's your asking price for "iPhone 12 Pro"?

Please enter a number (e.g., "50", "125.99"):

User: 450
Bot: Perfect! $450 for iPhone 12 Pro

Now I need at least one photo. Please send me a clear image of your item:

User: [Sends photo]
Bot: 📸 Photo received!

I think this is: Electronics - Excellent

Is this correct? Reply "YES" or tell me the right category/condition:

User: YES
Bot: Got it! Where would you like to meet buyers?

Suggestions: "Reitz Union", "Library West", "Student Rec Center"
Or just say "skip" if you'll decide later:

User: Reitz Union
Bot: Any external links? (Facebook Marketplace, Amazon, etc.)

Send the link or say "skip":

User: skip
Bot: 🎉 Your listing is live!

📱 iPhone 12 Pro - $450
🔗 https://gatorex.com/listing/abc123

Buyers will contact you via: https://wa.me/15558912275

Your listing expires in 14 days. I'll remind you 2 days before!

Want to list something else? Just say "SELL"
```

## 🌐 Web Platform Onboarding Flow

### Access Control
- **Open Access**: Anyone can visit the website
- **Verification Required**: Must verify UF email to participate
- **Email-based verification with magic links**

### Flow Steps:

#### 1. Landing Page
- User visits website
- Sees marketplace listings (read-only)
- "Verify UF Email" button to participate

#### 2. Email Verification
```
User clicks "Verify UF Email"
→ Email input form (validates @ufl.edu)
→ Verification email sent with magic link
→ User clicks link in email
→ Account verified and activated
```

#### 3. Full Access
- Can create listings
- Can contact sellers
- Can set up alerts
- Full marketplace access

## 🔄 User States & Transitions

### WhatsApp Bot States:
```
INITIAL → AWAITING_CONSENT → AWAITING_INTENT → [BUYING/SELLING flows]
```

### Web Platform States:
```
ANONYMOUS → EMAIL_VERIFICATION → VERIFIED → [Full Access]
```

## 🛡️ Security & Trust

### WhatsApp Users:
- **Auto-verified**: Trusted as UF students from start
- **Trust Score**: Start with 10 points (verified bonus)
- **Rate Limiting**: 3 listings per day
- **Moderation**: AI content filtering

### Web Users:
- **Email Verified**: Must verify @ufl.edu email
- **Trust Score**: Start with 10 points after verification
- **Same Limits**: 3 listings per day
- **Same Moderation**: AI content filtering

## 📊 User Journey Analytics

### Key Metrics to Track:

#### WhatsApp Bot:
- Consent rate (YES vs NO)
- Intent distribution (BUY vs SELL)
- Completion rates for each flow
- Time to first listing
- User retention

#### Web Platform:
- Email verification completion rate
- Time from email to verification
- First action after verification
- Conversion from visitor to active user

## 🔧 Technical Implementation

### Database Schema:
```sql
User {
  whatsappId: String (unique)
  ufEmail: String? (optional for WhatsApp users)
  ufEmailVerified: Boolean (auto-true for WhatsApp)
  trustScore: Int (starts at 10 for verified users)
  source: 'WHATSAPP' | 'WEB'
}
```

### Conversation States:
```typescript
type ConversationState = 
  | 'INITIAL'
  | 'AWAITING_CONSENT'
  | 'AWAITING_INTENT'
  | 'BUYING_ITEM_NAME'
  | 'BUYING_PRICE_RANGE'
  | 'BUYING_CONFIRM_SUBSCRIPTION'
  | 'SELLING_ITEM_NAME'
  | 'SELLING_PRICE'
  | 'SELLING_IMAGE'
  | 'SELLING_CATEGORY_CONFIRM'
  | 'SELLING_MEETING_SPOT'
  | 'SELLING_EXTERNAL_LINK'
```

## 🚀 Benefits of This Approach

### For WhatsApp Users:
- ✅ **Streamlined**: No redundant email verification
- ✅ **Fast**: 2-step onboarding (consent → action)
- ✅ **Mobile-first**: Perfect for on-the-go usage
- ✅ **Trusted**: Pre-verified UF student status

### For Web Users:
- ✅ **Accessible**: Can browse without verification
- ✅ **Secure**: Email verification ensures UF students only
- ✅ **Flexible**: Full web interface for detailed listings
- ✅ **SEO-friendly**: Public listings for discovery

### For the Platform:
- ✅ **Dual Entry**: Captures both mobile and web users
- ✅ **Verified Community**: All active users are verified UF students
- ✅ **Scalable**: Different flows for different user preferences
- ✅ **Secure**: Appropriate verification for each entry point