-- Updated Referrals System Database Schema
-- Run this in Supabase SQL Editor to update your referrals system
-- Includes support for the new 'equity' reward type

-- Step 1: Update rewards table to include 'equity' type
ALTER TABLE rewards DROP CONSTRAINT IF EXISTS rewards_type_check;
ALTER TABLE rewards ADD CONSTRAINT rewards_type_check 
CHECK (type IN ('voucher', 'cash', 'sub', 'device', 'equity'));

-- Step 2: Create/Update all referrals tables
-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referral_clicks table
CREATE TABLE IF NOT EXISTS referral_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL REFERENCES referral_codes(code) ON DELETE CASCADE,
    ip_hash TEXT NOT NULL,
    ua_hash TEXT NOT NULL,
    ts TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL REFERENCES referral_codes(code) ON DELETE CASCADE,
    referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referee_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('clicked', 'verified', 'rejected')) DEFAULT 'clicked',
    reason TEXT,
    ts TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rewards table with equity type
CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('voucher', 'cash', 'sub', 'device', 'equity')) NOT NULL,
    amount_cents INTEGER NOT NULL,
    tier INTEGER NOT NULL,
    source TEXT DEFAULT 'referral',
    status TEXT CHECK (status IN ('pending', 'approved', 'paid')) DEFAULT 'pending',
    ts TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboard_week table (materialized cache)
CREATE TABLE IF NOT EXISTS leaderboard_week (
    week_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0,
    rank INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (week_id, user_id)
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON referral_clicks(code);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_ts ON referral_clicks(ts);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_rewards_user_status ON rewards(user_id, status);
CREATE INDEX IF NOT EXISTS idx_leaderboard_week_points ON leaderboard_week(week_id, points DESC);

-- Step 4: Enable RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_week ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own referral code" ON referral_codes;
DROP POLICY IF EXISTS "Users can view their own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can view their own rewards" ON rewards;
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard_week;

-- Step 6: Create RLS Policies
CREATE POLICY "Users can view their own referral code" ON referral_codes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own referrals" ON referrals
    FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referee_user_id);

CREATE POLICY "Users can view their own rewards" ON rewards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view leaderboard" ON leaderboard_week
    FOR SELECT TO authenticated USING (true);

-- Verification: Check that all tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('referral_codes', 'referral_clicks', 'referrals', 'rewards', 'leaderboard_week') 
        THEN '✅ Required table exists'
        ELSE '❌ Unexpected table'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%referral%' OR table_name = 'rewards' OR table_name = 'leaderboard_week'
ORDER BY table_name;

-- Success message
SELECT '🎉 Referrals system database update completed successfully!' as message;
SELECT '📊 New reward tiers: 5, 10, 25, 50, 75, 100, 200, 500 referrals' as info;
SELECT '🏢 Ultimate reward: Marketing Lead + 5% Company Equity at 500 referrals' as ultimate_reward;