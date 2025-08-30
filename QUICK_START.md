# 🚀 Quick Start Guide - Production Magic Link Setup

## 1. Run Setup Script
```bash
npm run setup:prod
```
This will guide you through configuring:
- Database connection
- Email provider
- App settings

## 2. Initialize Database
```bash
npm run db:generate
npm run db:push
```

## 3. Test Email Service
```bash
npm run test:email
```

## 4. Start Development Server
```bash
npm run dev
```

## 5. Test the Flow
1. Go to `http://localhost:3000/verify`
2. Enter a UF email address
3. Check your email for the magic link
4. Click the link to verify

## Email Provider Quick Setup

### Gmail (Easiest)
1. Create Gmail account for GatorEx
2. Enable 2FA in Google Account settings
3. Generate App Password: Security → 2-Step Verification → App passwords
4. Use the 16-character password in setup

### SendGrid (Production)
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify sender email/domain
3. Create API key with Mail Send permissions
4. Install: `npm install @sendgrid/mail`

### AWS SES (Enterprise)
1. Set up AWS account and SES service
2. Verify sending domain/email
3. Create IAM user with SES permissions
4. Install: `npm install aws-sdk`

## Database Options

### Supabase (Free)
1. Create project at [supabase.com](https://supabase.com)
2. Copy connection string from Settings → Database

### Railway (Simple)
1. Create PostgreSQL at [railway.app](https://railway.app)
2. Copy connection string

### Local PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql
createdb gatorex_prod
```

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
# Add environment variables in Vercel dashboard
vercel --prod
```

### Railway
1. Connect GitHub repository
2. Add environment variables in dashboard
3. Auto-deploys on git push

## Environment Variables Checklist

Required for all setups:
- [ ] `DATABASE_URL`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXTAUTH_SECRET`

Gmail setup:
- [ ] `EMAIL_PROVIDER="gmail"`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS`

SendGrid setup:
- [ ] `EMAIL_PROVIDER="sendgrid"`
- [ ] `SENDGRID_API_KEY`
- [ ] `SENDGRID_FROM_EMAIL`

AWS SES setup:
- [ ] `EMAIL_PROVIDER="ses"`
- [ ] `AWS_REGION`
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `SES_FROM_EMAIL`

## Troubleshooting

**Emails not sending?**
- Check credentials in .env.local
- Verify sender email is authenticated
- Check spam folder
- Run `npm run test:email`

**Database errors?**
- Verify DATABASE_URL format
- Check database server is running
- Run `npm run db:push`

**Need help?**
- Check `PRODUCTION_SETUP_COMPLETE.md` for detailed guide
- Review error logs in console
- Test individual components