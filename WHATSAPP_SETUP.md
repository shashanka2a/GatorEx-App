# WhatsApp Business Integration Setup

This guide walks you through setting up the WhatsApp Business API integration for GatorEx.

## Prerequisites

1. **WhatsApp Business Account**: Set up through Meta Business Manager
2. **PostgreSQL Database**: Local or cloud instance
3. **OpenAI API Key**: For GPT-powered listing parsing
4. **Domain with HTTPS**: For webhook endpoints

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run setup
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Fill in your credentials
   ```

3. **Set up database**:
   ```bash
   npm run db:push
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## WhatsApp Business API Setup

### 1. Create WhatsApp Business App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app → Business → WhatsApp
3. Add WhatsApp product to your app

### 2. Get Credentials

From your WhatsApp Business API dashboard, collect:
- **Access Token**: Long-lived token for API calls
- **Phone Number ID**: Your business phone number ID
- **Business Account ID**: Your WhatsApp Business Account ID

### 3. Configure Webhook

1. Set webhook URL: `https://yourdomain.com/api/whatsapp/webhook`
2. Set verify token (any random string)
3. Subscribe to `messages` field
4. Add webhook fields: `messages`, `message_deliveries`

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/gatorex"

# WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN="your_access_token"
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
WHATSAPP_VERIFY_TOKEN="your_verify_token"
WHATSAPP_BUSINESS_ACCOUNT_ID="your_business_account_id"

# OpenAI
OPENAI_API_KEY="sk-your-openai-key"

# App
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
CRON_SECRET="your-cron-secret"
```

## Testing the Integration

### 1. Test Webhook Verification
```bash
curl -X GET "https://yourdomain.com/api/whatsapp/webhook?hub.mode=subscribe&hub.challenge=test&hub.verify_token=your_verify_token"
```

### 2. Send Test Message
Forward a sale post to your WhatsApp Business number:
```
"Selling my MacBook Pro 2021, 16GB RAM, excellent condition. $1200 OBO. DM me!"
```

### 3. Check Admin Dashboard
Visit `/admin/dashboard` to see processed listings.

## Features

### ✅ Implemented
- WhatsApp webhook handling
- GPT-powered listing parsing
- UF email verification
- Auto-expiring listings (14 days)
- Basic moderation filters
- Admin dashboard
- Draft/published workflow

### 🚧 Production Checklist
- [ ] Set up media storage (S3/Cloudinary)
- [ ] Configure rate limiting
- [ ] Add comprehensive logging
- [ ] Set up monitoring/alerts
- [ ] Update privacy policy
- [ ] Load test webhook endpoint
- [ ] Set up backup/recovery

## API Endpoints

- `POST /api/whatsapp/webhook` - WhatsApp message handler
- `GET /api/whatsapp/webhook` - Webhook verification
- `POST /api/verify-email` - Email verification
- `GET /api/listings` - Fetch published listings
- `GET /api/admin/stats` - Admin dashboard data
- `POST /api/cron/expire-listings` - Expire old listings

## Message Flow

1. **User forwards sale post** → WhatsApp Business number
2. **Webhook receives message** → Stores in database
3. **GPT processes content** → Extracts listing data
4. **Missing info?** → Bot asks follow-up question
5. **Complete listing** → Requires UF email verification
6. **Verified user** → Listing published to feed
7. **Auto-expires** → After 14 days

## Troubleshooting

### Webhook Not Receiving Messages
- Check webhook URL is HTTPS
- Verify webhook token matches
- Check WhatsApp app permissions
- Review webhook subscription fields

### GPT Parsing Issues
- Check OpenAI API key
- Review prompt in `gpt-parser.ts`
- Monitor API usage/costs
- Add fallback for parsing failures

### Database Connection
- Verify DATABASE_URL format
- Check database permissions
- Run `npx prisma db push` to sync schema

## Support

For issues with this integration:
1. Check the logs in your deployment
2. Review the admin dashboard for errors
3. Test individual components (webhook, GPT, database)
4. Consult WhatsApp Business API documentation