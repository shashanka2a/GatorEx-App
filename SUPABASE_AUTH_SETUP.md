# Supabase Auth Setup for Reliable Magic Links

## Current Status
- ✅ Database connected and schema applied
- ✅ Supabase client library installed
- ✅ Environment variables configured
- 🔄 **Next**: Configure custom SMTP in Supabase Studio

## Step-by-Step Configuration

### 1. Get Your Supabase API Keys
1. Go to: https://supabase.com/dashboard/project/hxmanrgbkoojbambqvdn
2. Navigate to: **Settings → API**
3. Copy the **anon/public** key
4. Replace the placeholder in your `.env` files:
   ```bash
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-actual-anon-key-here"
   ```

### 2. Configure Custom SMTP
1. In Supabase Studio: **Authentication → Settings → SMTP Settings**
2. **Enable Custom SMTP** and enter:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: gatorex.shop@gmail.com
   SMTP Password: npicbczewjrefvht
   Sender Name: GatorEx
   Sender Email: gatorex.shop@gmail.com
   ```

### 3. Customize Email Templates
1. Go to: **Authentication → Email Templates**
2. Update **Magic Link** template with the HTML from `scripts/supabase-smtp-config.md`
3. Update **Signup Confirmation** template as well

### 4. Test the Setup
```bash
# Update the test email in the script first
node scripts/test-supabase-auth.js
```

### 5. Integration Options

#### Option A: Use Supabase Auth (Recommended)
Replace NextAuth with Supabase Auth for better email delivery:

```typescript
// In your login component
import { supabase } from '@/src/lib/supabase';

const handleLogin = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'https://app.gatorex.shop/auth/callback'
    }
  });
  
  if (error) {
    console.error('Login failed:', error.message);
  } else {
    // Show success message
    console.log('Magic link sent! Check your email.');
  }
};
```

#### Option B: Keep NextAuth + Improve SMTP
Continue using NextAuth but with better email templates and delivery monitoring.

## Benefits of Supabase Auth SMTP

1. **Faster Delivery**: Direct SMTP connection, no third-party delays
2. **Better Templates**: Custom branded emails with your styling
3. **Spam Avoidance**: Professional templates less likely to be flagged
4. **Monitoring**: Built-in delivery tracking in Supabase dashboard
5. **Reliability**: Dedicated SMTP connection for your app

## University Email Considerations

For `.edu` addresses that might still have delays:

1. **Whitelist Request**: Contact UF IT to whitelist `gatorex.shop@gmail.com`
2. **Subject Line**: Use clear, non-promotional subjects like "GatorEx Login Link"
3. **Fallback**: Implement OTP codes as backup (6-digit codes often pass filters better)
4. **Custom Domain**: Long-term, use `login@gatorex.app` for better deliverability

## Files Created/Updated
- ✅ `src/lib/supabase.ts` - Supabase client configuration
- ✅ `scripts/supabase-smtp-config.md` - SMTP setup guide
- ✅ `scripts/test-supabase-auth.js` - Auth testing script
- ✅ Environment variables updated in `.env` and `.env.production`

## Next Steps
1. **Get API key** from Supabase Studio and update `.env`
2. **Configure SMTP** in Supabase Studio
3. **Test magic links** with your email
4. **Deploy to production** with updated environment variables
5. **Monitor delivery** and adjust templates as needed

The magic link delays you experienced should be significantly reduced once custom SMTP is configured! 🚀