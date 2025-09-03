-- Add reward claims table for idempotency
CREATE TABLE IF NOT EXISTS reward_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    idempotency_key TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reward_id, idempotency_key)
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_reward_claims_user ON reward_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_idempotency ON reward_claims(idempotency_key);

-- Enable RLS
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view their own claims" ON reward_claims
    FOR SELECT USING (auth.uid() = user_id);