# Terms and Conditions Implementation

## Overview
This implementation ensures that users must accept Terms of Service and Privacy Policy as part of the authentication flow when accessing protected features.

## How It Works

### 1. Public Pages (No Auth Required)
- `/` - Home page
- `/buy` - Browse listings (public)
- `/sublease` - Browse subleases (public)
- `/referrals` - Referral program info

### 2. Protected Pages (Auth Required)
- `/sell` - Create listings
- `/me` - User profile
- `/share` - Share features
- `/favorites` - User favorites

### 3. Auth Flow
When a user tries to access a protected page:

1. **Not logged in** → Redirect to `/verify` (login)
2. **Logged in but no terms** → Redirect to `/terms`
3. **Terms accepted but no profile** → Redirect to `/complete-profile`
4. **Fully authenticated** → Access granted

## Implementation Details

### API Routes
All protected API routes use `checkApiAuthAndTerms()` which ensures:
- User is authenticated
- Terms are accepted
- Profile is completed

### Client Pages
Protected pages use `checkClientAuthAndTerms()` to redirect users through the proper flow.

### Database Fields
Users have these fields tracked:
- `termsAccepted: boolean`
- `termsAcceptedAt: DateTime`
- `privacyAccepted: boolean`
- `privacyAcceptedAt: DateTime`
- `profileCompleted: boolean`

## Key Files

### Core Auth Logic
- `src/lib/auth/terms-check.ts` - Main auth checking utilities
- `pages/api/auth/[...nextauth].ts` - NextAuth configuration with terms fields
- `pages/api/auth/verify-otp.ts` - OTP verification with terms flow
- `pages/api/auth/accept-terms.ts` - Terms acceptance endpoint

### Pages
- `pages/terms.tsx` - Terms acceptance page
- `pages/complete-profile.tsx` - Profile completion page
- `pages/sell.tsx` - Protected page example
- `pages/me.tsx` - Protected page example

### API Routes (Updated)
- `pages/api/sell/publish.ts`
- `pages/api/user/profile.ts`
- `pages/api/listings/[id]/contact.ts`
- `pages/api/ai/*.ts`

## User Experience

1. **New User**: Login → Accept Terms → Complete Profile → Access granted
2. **Returning User**: Login → Access granted (if previously completed)
3. **Incomplete User**: Login → Continue where they left off

## Benefits

- ✅ Single terms acceptance (not asked multiple times)
- ✅ Seamless user experience
- ✅ Legal compliance
- ✅ No access to protected features without terms
- ✅ Proper error handling and redirects
- ✅ TypeScript safe implementation

## Testing

Run the comprehensive test:
```bash
node scripts/test-comprehensive-terms-flow.js
```

This verifies all files are properly configured and the flow works correctly.