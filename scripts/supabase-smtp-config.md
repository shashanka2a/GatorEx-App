# Supabase SMTP Configuration Guide

## Step 1: Configure Custom SMTP in Supabase Studio

1. **Open Supabase Studio**: https://supabase.com/dashboard/project/hxmanrgbkoojbambqvdn
2. **Navigate to**: Authentication → Settings → SMTP Settings
3. **Enable Custom SMTP** and configure:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: gatorex.shop@gmail.com
SMTP Password: npicbczewjrefvht
Sender Name: GatorEx
Sender Email: gatorex.shop@gmail.com
Enable SMTP: ✅ (checked)
```

## Step 2: Configure Email Templates

Navigate to: **Authentication → Email Templates**

### Magic Link Template
```
Subject: Your GatorEx Login Link 🐊
```

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #FF6B35; margin: 0;">🐊 GatorEx</h1>
    <p style="color: #666; margin: 5px 0;">University of Florida Marketplace</p>
  </div>
  
  <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; text-align: center;">
    <h2 style="color: #333; margin-bottom: 20px;">Sign in to GatorEx</h2>
    <p style="color: #666; margin-bottom: 25px;">Click the button below to securely sign in to your account:</p>
    
    <a href="{{ .ConfirmationURL }}" 
       style="display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; 
              text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0;">
      Sign In to GatorEx
    </a>
    
    <p style="color: #999; font-size: 14px; margin-top: 20px;">
      This link expires in 1 hour for security.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p>© 2024 GatorEx - University of Florida Student Marketplace</p>
  </div>
</div>
```

### Signup Confirmation Template
```
Subject: Welcome to GatorEx! Confirm your email 🎉
```

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #FF6B35; margin: 0;">🐊 GatorEx</h1>
    <p style="color: #666; margin: 5px 0;">University of Florida Marketplace</p>
  </div>
  
  <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; text-align: center;">
    <h2 style="color: #333; margin-bottom: 20px;">Welcome to GatorEx!</h2>
    <p style="color: #666; margin-bottom: 25px;">
      Thanks for joining the UF student marketplace. Click below to confirm your email:
    </p>
    
    <a href="{{ .ConfirmationURL }}" 
       style="display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; 
              text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0;">
      Confirm Email Address
    </a>
    
    <p style="color: #999; font-size: 14px; margin-top: 20px;">
      This link expires in 24 hours.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
    <p>Ready to buy, sell, and trade with fellow Gators!</p>
    <p>© 2024 GatorEx - University of Florida Student Marketplace</p>
  </div>
</div>
```

## Step 3: Test Email Delivery

1. **In Supabase Studio**: Authentication → Users → Invite User
2. **Enter a test email** (preferably your .edu address)
3. **Check delivery time** and spam folder
4. **Verify the email** looks professional and branded

## Step 4: Update Production Environment

The following environment variables are already configured in your .env files:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://hxmanrgbkoojbambqvdn.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[Get from Supabase Studio → Settings → API]"
```

## Step 5: For University Email Deliverability

If .edu emails are still delayed:

1. **Contact UF IT**: Ask to whitelist `gatorex.shop@gmail.com`
2. **Alternative**: Set up custom domain (login@gatorex.app)
3. **Backup**: Implement OTP code system alongside magic links

## Step 6: Production Deployment

After SMTP is configured:
1. Deploy your app with updated environment variables
2. Test magic link flow in production
3. Monitor email delivery rates
4. Consider upgrading to SendGrid/Postmark for better deliverability

## Troubleshooting

- **Still in spam?** Add SPF/DKIM records for your domain
- **University blocking?** Try different subject lines or OTP codes
- **Slow delivery?** Consider transactional email service
- **Template not working?** Check Supabase logs in Studio