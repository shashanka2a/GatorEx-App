# Production Setup Guide for GatorEx Email Verification

## 🚀 Making Email Verification Production-Ready

### 1. Environment Variables Setup

Create a `.env.local` file (or configure in your hosting platform) with these variables:

```bash
# Database
DATABASE_URL="your_production_database_url"

# Email Configuration (Choose one option below)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_gatorex_email@gmail.com"
SMTP_PASS="your_app_specific_password"

# Base URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Other required variables
NEXTAUTH_SECRET="your_secure_random_string"
```

### 2. Email Service Options

#### Option A: Gmail SMTP (Recommended for small scale)
1. Create a dedicated Gmail account for GatorEx
2. Enable 2-factor authentication
3. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
4. Use the app password as `SMTP_PASS`

#### Option B: SendGrid (Recommended for production scale)
```bash
npm install @sendgrid/mail
```

Update `src/lib/email/verification.ts` to use SendGrid:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Replace the nodemailer implementation with:
await sgMail.send({
  to: email,
  from: 'noreply@gatorex.com', // Use your verified domain
  subject: 'Verify your UF email for GatorEx 🐊',
  html: mailOptions.html,
  text: mailOptions.text
});
```

#### Option C: AWS SES (Enterprise scale)
```bash
npm install aws-sdk
```

### 3. Database Migration

Run the database migration to add the new `verifyTokenExpiry` field:

```bash
npx prisma db push
```

### 4. Domain Setup

1. **Custom Domain**: Set up your custom domain (e.g., gatorex.ufl.edu)
2. **SSL Certificate**: Ensure HTTPS is enabled
3. **Email Domain**: If using SendGrid/SES, verify your sending domain

### 5. Security Considerations

#### Rate Limiting
Add rate limiting to prevent abuse:

```typescript
// In pages/api/send-verification.ts
const rateLimitMap = new Map();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 3;

  const attempts = rateLimitMap.get(clientIP) || [];
  const recentAttempts = attempts.filter((time: number) => now - time < windowMs);

  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
  }

  rateLimitMap.set(clientIP, [...recentAttempts, now]);
  
  // ... rest of the handler
}
```

#### Input Validation
```typescript
// Add email validation
const emailRegex = /^[a-zA-Z0-9._%+-]+@ufl\.edu$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: 'Invalid UF email format' });
}
```

### 6. Monitoring & Logging

#### Email Delivery Monitoring
```typescript
// Add to your email service
console.log(`📧 Email sent to ${email} at ${new Date().toISOString()}`);

// For production, use a proper logging service
// import winston from 'winston';
// logger.info('Email sent', { email, timestamp: new Date().toISOString() });
```

#### Error Tracking
Consider integrating Sentry or similar for error tracking:
```bash
npm install @sentry/nextjs
```

### 7. Testing in Production

#### Test Checklist:
- [ ] Email delivery works with real UF emails
- [ ] Verification links work correctly
- [ ] Token expiration (24 hours) functions properly
- [ ] Rate limiting prevents abuse
- [ ] Error handling works for invalid tokens
- [ ] Database updates correctly on verification
- [ ] Listings publish after verification

#### Test Commands:
```bash
# Test email sending
curl -X POST https://your-domain.com/api/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ufl.edu"}'

# Test verification
curl -X POST https://your-domain.com/api/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"your_token","email":"test@ufl.edu"}'
```

### 8. Performance Optimization

#### Email Queue (for high volume)
Consider implementing an email queue using Redis or similar:
```bash
npm install bull redis
```

#### Database Indexing
Ensure proper indexes exist:
```sql
CREATE INDEX idx_users_verify_token ON users(verifyToken);
CREATE INDEX idx_users_uf_email ON users(ufEmail);
```

### 9. Backup & Recovery

#### Database Backups
Set up automated database backups for user data.

#### Email Templates
Store email templates in version control for easy updates.

### 10. Compliance & Privacy

#### FERPA Compliance
Ensure UF email handling complies with FERPA requirements.

#### Data Retention
Implement policies for:
- Unverified account cleanup (30 days)
- Expired token cleanup (weekly)
- User data retention policies

## 🔧 Deployment Steps

1. **Set up environment variables** in your hosting platform
2. **Deploy the application** with the new code
3. **Run database migrations**: `npx prisma db push`
4. **Test email functionality** with a real UF email
5. **Monitor logs** for any issues
6. **Set up monitoring** and alerting

## 📊 Success Metrics

Track these metrics to ensure the system is working:
- Email delivery rate (should be >95%)
- Verification completion rate
- Time from email send to verification
- Error rates and types

## 🚨 Troubleshooting

### Common Issues:
1. **Emails not sending**: Check SMTP credentials and firewall settings
2. **Emails in spam**: Set up SPF, DKIM, and DMARC records
3. **Token expiration**: Verify server time zones are correct
4. **Database errors**: Check connection strings and permissions

### Debug Mode:
Set `NODE_ENV=development` to see verification links in console logs instead of sending emails.