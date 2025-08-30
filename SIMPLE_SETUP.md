# 🚀 Super Simple Email Verification Setup

## Works Immediately (No Setup Required!)

The email verification system works out of the box in development mode:

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Test verification:**
   - Go to `http://localhost:3000/verify`
   - Enter any UF email (e.g., `test@ufl.edu`)
   - Click "Send Verification Email"
   - **The OTP will appear in a browser alert!**
   - Enter the 6-digit code to verify

## Optional: Real Email Setup (5 minutes)

To send actual emails, just add these 2 lines to `.env.local`:

```bash
GMAIL_USER="your-email@gmail.com"
GMAIL_PASS="your-gmail-app-password"
```

### How to get Gmail App Password:
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (turn on if not enabled)
3. Security → 2-Step Verification → App passwords
4. Generate password for "Mail"
5. Copy the 16-character password

That's it! No database, no complex setup needed.

## Features:
- ✅ **6-digit OTP codes** (like modern apps)
- ✅ **10-minute expiry** (secure)
- ✅ **Works immediately** (no setup)
- ✅ **Real email support** (optional)
- ✅ **UF email validation**
- ✅ **Clean UI** with proper error handling

## How it works:
1. User enters UF email
2. System generates 6-digit OTP
3. In development: Shows OTP in alert
4. In production: Sends email with OTP
5. User enters OTP to verify
6. System validates and marks as verified

## Production Ready:
- Memory storage (upgrade to database later)
- Rate limiting built-in
- Secure OTP generation
- Proper error handling
- Mobile-friendly UI

Perfect for MVP and can be upgraded to full database later!