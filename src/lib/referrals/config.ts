// Referrals system configuration
export const REFERRAL_CONFIG = {
  tiers: [
    { refs: 5, reward: { type: 'voucher', amount_cents: 1000, description: '$10 Amazon Gift Card' } },
    { refs: 10, reward: { type: 'voucher', amount_cents: 2500, description: '$25 Amazon Gift Card' } },
    { refs: 25, reward: { type: 'sub', amount_cents: 6000, description: 'ChatGPT Pro (3 months)' } },
    { refs: 50, reward: { type: 'voucher', amount_cents: 10000, description: '$100 Best Buy Gift Card' } },
    { refs: 75, reward: { type: 'sub', amount_cents: 19900, description: 'Best Buy Totaltech Membership (1 year)' } },
    { refs: 100, reward: { type: 'device', amount_cents: 24900, description: 'AirPods Pro 2' } },
    { refs: 200, reward: { type: 'device', amount_cents: 120000, description: 'iPhone 16 Pro' } },
    { refs: 500, reward: { type: 'equity', amount_cents: 0, description: 'Marketing Lead + 5% Company Equity' } }
  ],
  
  limits: {
    clicksPerHour: 60,
    completionsPerMinute: 10,
    maxSignupsPerIP24h: 3,
    cookieTTL: 30 * 24 * 60 * 60 * 1000, // 30 days
    duplicateWindowDays: 7,
    clickRetentionDays: 90
  },

  points: {
    perVerifiedReferral: 1
  }
};

export const REWARD_TYPES = {
  voucher: 'voucher',
  cash: 'cash', 
  sub: 'sub',
  device: 'device',
  equity: 'equity'
} as const;

export const REFERRAL_STATUS = {
  clicked: 'clicked',
  verified: 'verified', 
  rejected: 'rejected'
} as const;

export const REWARD_STATUS = {
  pending: 'pending',
  approved: 'approved',
  paid: 'paid'
} as const;