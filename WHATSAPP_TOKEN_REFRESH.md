# 🔄 WhatsApp Access Token Refresh Guide

## Your WhatsApp token is expired/invalid. Here's how to get a new one:

### Step 1: Go to Meta for Developers
1. Visit: https://developers.facebook.com/
2. Log in with your Facebook account
3. Go to "My Apps" → Select your WhatsApp Business app

### Step 2: Get New Access Token
1. In your app dashboard, go to "WhatsApp" → "API Setup"
2. Find the "Temporary access token" section
3. Click "Generate Token" or copy the existing token
4. Copy the new token (starts with "EAA...")

### Step 3: Update Your Environment
Replace the WHATSAPP_ACCESS_TOKEN in your .env file with the new token:

```bash
WHATSAPP_ACCESS_TOKEN="EAA_YOUR_NEW_TOKEN_HERE"
```

### Step 4: Verify Phone Number ID
While you're there, also verify your Phone Number ID:
1. In "API Setup", find "Phone number ID"
2. Make sure it matches: `780716021110182`
3. If different, update WHATSAPP_PHONE_NUMBER_ID in .env

### Step 5: Test the Token
Run this command to test:
```bash
curl -X POST \
  "https://graph.facebook.com/v18.0/780716021110182/messages" \
  -H "Authorization: Bearer YOUR_NEW_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "15558912275",
    "type": "text",
    "text": {"body": "Test message"}
  }'
```

### Note: Token Expiration
- Temporary tokens expire in 24 hours
- For production, you need a permanent token
- Follow Meta's guide to get a permanent token for your business