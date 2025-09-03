# Referrals System Backend

A complete referrals system implementation with fraud detection, tiered rewards, and leaderboards.

## Features

- **Referral Tracking**: Unique codes, click tracking, attribution
- **Fraud Detection**: IP/UA hashing, duplicate detection, rate limiting
- **Tiered Rewards**: 5/10/25/100 referral milestones with automatic rewards
- **Leaderboards**: Weekly rankings with caching
- **Security**: HttpOnly cookies, salted hashes, idempotent operations

## Database Schema

Run these SQL files in Supabase:
1. `scripts/setup-referrals-schema.sql` - Main tables
2. `scripts/add-reward-claims-table.sql` - Claims tracking
3. `scripts/add-monthly-prizes-table.sql` - Monthly prizes

## API Endpoints

### User Endpoints
- `GET /api/referrals/summary` - User's referral stats
- `GET /api/referrals/leaderboard?period=week|all` - Rankings
- `POST /api/referrals/claim` - Claim approved rewards

### System Endpoints  
- `POST /api/referrals/click` - Log referral clicks (called by middleware)
- `POST /api/referrals/complete` - Process verified signups (internal)

### Cron Jobs
- `POST /api/referrals/rebuild-leaderboard` - Weekly rankings rebuild
- `POST /api/referrals/cleanup` - Remove old click data
- `POST /api/referrals/monthly-prizes` - Award monthly grand prizes

## Environment Variables

```env
REFERRAL_SALT=your-random-salt-string
CRON_SECRET=your-cron-secret-key
NEXTAUTH_URL=https://your-domain.com
```

## Integration Points

### 1. Middleware Integration
The middleware automatically:
- Detects `?ref=CODE` parameters
- Sets `gex_ref` cookie (30-day TTL)
- Logs clicks to `/api/referrals/click`

### 2. Verification Hook
After email verification, call:
```typescript
import { processReferralAfterVerification } from '../src/lib/referrals/verification-hook';

// In your verification success handler
await processReferralAfterVerification(userId, email, req);
```

### 3. User Dashboard
```typescript
// Get user's referral data
const response = await fetch('/api/referrals/summary');
const data = await response.json();
// data.referralCode, data.referralLink, data.verified, etc.
```

## Reward Tiers

- **5 referrals**: $5 voucher
- **10 referrals**: $15 voucher  
- **25 referrals**: 3-month Premium subscription ($30)
- **100 referrals**: iPhone (monthly contest winner)

## Fraud Prevention

- Self-referral blocking
- Disposable email detection
- IP/device fingerprint tracking
- Rate limiting (60 clicks/hour, 10 completions/minute)
- 7-day duplicate window
- Max 3 signups per IP per 24h

## Cron Job Setup

Configure these in your deployment platform:

```bash
# Weekly leaderboard rebuild (Mondays at midnight)
0 0 * * 1 curl -X POST "https://your-domain.com/api/referrals/rebuild-leaderboard" -H "x-cron-secret: $CRON_SECRET"

# Cleanup old data (Sundays at 2 AM)  
0 2 * * 0 curl -X POST "https://your-domain.com/api/referrals/cleanup" -H "x-cron-secret: $CRON_SECRET"

# Monthly prizes (1st of month at 1 AM)
0 1 1 * * curl -X POST "https://your-domain.com/api/referrals/monthly-prizes" -H "x-cron-secret: $CRON_SECRET"
```

## Testing

1. **Generate referral link**: Visit `/api/referrals/summary` (authenticated)
2. **Test click tracking**: Visit any page with `?ref=YOUR_CODE`
3. **Test completion**: Sign up new user with referral cookie set
4. **Check leaderboard**: Visit `/api/referrals/leaderboard`

## Security Notes

- All IP addresses and user agents are salted and hashed
- Referral cookies are HttpOnly and SameSite=Lax
- Click data is purged after 90 days
- All reward claims require idempotency keys
- Cron endpoints require secret authentication

## Admin Features

The system supports admin functionality for:
- Approving/denying rewards
- Viewing referral audit trails  
- Exporting winner data
- Manual reward adjustments

Admin endpoints can be added in `/pages/admin/referrals/` with proper authentication.