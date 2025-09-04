-- Create draft_sessions table for enhanced auto-save functionality
CREATE TABLE IF NOT EXISTS draft_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    draft_data JSONB NOT NULL,
    current_step INTEGER NOT NULL DEFAULT 0,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_saved TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes for performance
    INDEX idx_draft_sessions_user_id (user_id),
    INDEX idx_draft_sessions_session_id (session_id),
    INDEX idx_draft_sessions_active (is_active, last_saved),
    INDEX idx_draft_sessions_user_active (user_id, is_active, last_saved)
);

-- Add foreign key constraint if users table exists
-- ALTER TABLE draft_sessions ADD CONSTRAINT fk_draft_sessions_user_id 
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create cleanup function for old drafts
CREATE OR REPLACE FUNCTION cleanup_old_draft_sessions()
RETURNS void AS $$
BEGIN
    -- Mark drafts older than 30 days as inactive
    UPDATE draft_sessions 
    SET is_active = false, deleted_at = NOW()
    WHERE last_saved < NOW() - INTERVAL '30 days' 
    AND is_active = true;
    
    -- Delete very old inactive drafts (90+ days)
    DELETE FROM draft_sessions 
    WHERE deleted_at < NOW() - INTERVAL '90 days'
    OR (is_active = false AND last_saved < NOW() - INTERVAL '90 days');
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to run cleanup (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-draft-sessions', '0 2 * * *', 'SELECT cleanup_old_draft_sessions();');

-- Manual cleanup can be run with: SELECT cleanup_old_draft_sessions();