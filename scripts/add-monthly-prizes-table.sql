-- Add monthly prizes tracking table
CREATE TABLE IF NOT EXISTS monthly_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_key TEXT UNIQUE NOT NULL, -- Format: YYYY-MM
    winner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referrals_count INTEGER NOT NULL,
    prize_type TEXT NOT NULL,
    prize_amount_cents INTEGER NOT NULL,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_monthly_prizes_month ON monthly_prizes(month_key);
CREATE INDEX IF NOT EXISTS idx_monthly_prizes_winner ON monthly_prizes(winner_user_id);

-- Enable RLS
ALTER TABLE monthly_prizes ENABLE ROW LEVEL SECURITY;

-- RLS Policy - anyone can view monthly prizes (public leaderboard)
CREATE POLICY "Anyone can view monthly prizes" ON monthly_prizes
    FOR SELECT TO authenticated USING (true);