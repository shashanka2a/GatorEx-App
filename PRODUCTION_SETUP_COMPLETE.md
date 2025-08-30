# 🚀 Complete Production Setup Guide for GatorEx

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Email service provider account
- Domain name (optional but recommended)

## Step 1: Environment Configuration

Create a `.env.local` file in your project root:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/gatorex_prod"

# Email Provider (choose one)
EMAIL_PROVIDER="gmail"  # Options: gmail, sendgrid, ses

# Gmail SMTP Configuration (if using Gmail)
SMTP_USER="your-gatorex-email@gmail.com"
SMTP_PASS="your-app-specific-password"

# SendGrid Configuration (if using SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# AWS SES Configuration (if using AWS SES)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
SES_FROM_EMAIL="noreply@yourdomain.com"

# Application Configuration
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secure-random-string-here"
NODE_ENV="production"
```

## Step 2: Database Setup

### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb gatorex_prod

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://your-username@localhost:5432/gatorex_prod"
```

### Option B: Cloud Database (Recommended)

#### Supabase (Free tier available)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy the connection string from Settings > Database
4. Update DATABASE_URL in .env.local

#### Railway (Simple deployment)
1. Go to [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Copy connection string
4. Update DATABASE_URL in .env.local

#### Neon (Serverless PostgreSQL)
1. Go to [neon.tech](https://neon.tech)
2. Create database
3. Copy connection string
4. Update DATABASE_URL in .env.local

### Initialize Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) View database in browser
npx prisma studio
```

## Step 3: Email Service Setup

### Option A: Gmail SMTP (Easiest for testing)

1. **Create Gmail Account**
   - Create a dedicated Gmail account for GatorEx
   - Example: `gatorex.notifications@gmail.com`

2. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Security → 2-Step Verification → Turn on

3. **Generate App Password**
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
   - Copy the 16-character password

4. **Update Environment Variables**
   ```bash
   EMAIL_PROVIDER="gmail"
   SMTP_USER="gatorex.notifications@gmail.com"
   SMTP_PASS="your-16-character-app-password"
   ```

### Option B: SendGrid (Recommended for production)

1. **Create SendGrid Account**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Sign up for free account (100 emails/day free)

2. **Verify Sender Identity**
   - Settings → Sender Authentication
   - Verify a single sender email or domain

3. **Create API Key**
   - Settings → API Keys → Create API Key
   - Choose "Restricted Access" and enable "Mail Send"
   - Copy the API key

4. **Install SendGrid Package**
   ```bash
   npm install @sendgrid/mail
   ```

5. **Update Environment Variables**
   ```bash
   EMAIL_PROVIDER="sendgrid"
   SENDGRID_API_KEY="your-sendgrid-api-key"
   SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
   ```

### Option C: AWS SES (Enterprise scale)

1. **Set up AWS Account**
   - Create AWS account if you don't have one
   - Go to SES service in AWS Console

2. **Verify Email/Domain**
   - Verify your sending email address or domain
   - Request production access (removes sandbox mode)

3. **Create IAM User**
   - Create IAM user with SES sending permissions
   - Generate access key and secret

4. **Install AWS SDK**
   ```bash
   npm install aws-sdk
   ```

5. **Update Environment Variables**
   ```bash
   EMAIL_PROVIDER="ses"
   AWS_REGION="us-east-1"
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   SES_FROM_EMAIL="noreply@yourdomain.com"
   ```

## Step 4: Testing the Setup

### Test Database Connection
```bash
# Test Prisma connection
npx prisma db push
```

### Test Email Sending
Create a test script `test-email.js`:
```javascript
const { sendVerificationEmail } = require('./src/lib/email/verification');

async function testEmail() {
  try {
    await sendVerificationEmail('your-test@ufl.edu', 'test-token-123');
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }
}

testEmail();
```

Run the test:
```bash
node test-email.js
```

### Test API Endpoints
```bash
# Test verification request
curl -X POST http://localhost:3000/api/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test@ufl.edu"}'

# Test verification (use token from email)
curl -X POST http://localhost:3000/api/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"your-token","email":"your-test@ufl.edu"}'
```

## Step 5: Deployment

### Option A: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add all variables from .env.local

4. **Redeploy**
   ```bash
   vercel --prod
   ```

### Option B: Railway

1. **Connect GitHub**
   - Push code to GitHub
   - Connect Railway to your repository

2. **Add Environment Variables**
   - In Railway dashboard, add all environment variables

3. **Deploy**
   - Railway will automatically deploy on git push

### Option C: Netlify

1. **Build Command**
   ```bash
   npm run build
   ```

2. **Environment Variables**
   - Add all variables in Netlify dashboard

## Step 6: Domain Setup (Optional)

### Custom Domain
1. **Purchase Domain** (e.g., gatorex.com)
2. **Configure DNS** to point to your hosting provider
3. **Update Environment Variable**
   ```bash
   NEXT_PUBLIC_APP_URL="https://gatorex.com"
   ```

### UF Subdomain (if possible)
- Contact UF IT to request subdomain like `gatorex.ufl.edu`
- This adds credibility for UF students

## Step 7: Security & Monitoring

### Rate Limiting
The system includes built-in rate limiting:
- 5 requests per 15 minutes per IP for verification requests
- 3 email attempts per 15 minutes per email address

### Monitoring
Add monitoring for:
- Email delivery rates
- API response times
- Database performance
- Error rates

### Logging
Consider adding structured logging:
```bash
npm install winston
```

## Step 8: Testing in Production

### Test Checklist
- [ ] Send verification email to real UF email
- [ ] Receive email in inbox (check spam folder)
- [ ] Click magic link and verify it works
- [ ] Check database for verified user
- [ ] Test rate limiting by sending multiple requests
- [ ] Test expired token handling
- [ ] Test invalid token handling

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create test-load.yml
echo "
config:
  target: 'https://yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Send verification'
    requests:
      - post:
          url: '/api/send-verification'
          json:
            email: 'test@ufl.edu'
" > test-load.yml

# Run load test
artillery run test-load.yml
```

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check SMTP credentials
   - Verify sender email is authenticated
   - Check spam folder
   - Review email provider logs

2. **Database connection errors**
   - Verify DATABASE_URL format
   - Check database server is running
   - Ensure database exists
   - Check network connectivity

3. **Rate limiting too strict**
   - Adjust limits in API files
   - Consider IP whitelisting for testing

4. **Tokens expiring too quickly**
   - Check server timezone settings
   - Verify token expiry logic

### Debug Mode
Set environment variable for debugging:
```bash
DEBUG=true
NODE_ENV=development
```

## Production Checklist

- [ ] Database is set up and accessible
- [ ] Email service is configured and tested
- [ ] Environment variables are set correctly
- [ ] Application deploys successfully
- [ ] Magic links work end-to-end
- [ ] Rate limiting is functioning
- [ ] Error handling works properly
- [ ] Monitoring is in place
- [ ] Domain is configured (if using custom domain)
- [ ] SSL certificate is active
- [ ] Load testing completed successfully

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review application logs
3. Test individual components (database, email, API)
4. Verify environment variables are correct

## Security Notes

- Never commit `.env.local` to version control
- Use strong, unique passwords for all services
- Regularly rotate API keys and passwords
- Monitor for suspicious activity
- Keep dependencies updated
- Use HTTPS in production
- Implement proper error handling to avoid information leakage