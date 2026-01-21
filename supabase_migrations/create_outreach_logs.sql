-- ============================================
-- OUTREACH LOGS TABLE
-- Tracks user outreach outcomes for Drivya decision learning
-- ============================================

CREATE TABLE IF NOT EXISTS outreach_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    replied BOOLEAN NOT NULL,
    useful BOOLEAN NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE outreach_logs ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own outreach logs
CREATE POLICY "Users can insert own outreach logs" ON outreach_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own outreach logs" ON outreach_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own outreach logs" ON outreach_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_outreach_logs_user ON outreach_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_logs_org ON outreach_logs(organization_id);

-- Update trigger
CREATE TRIGGER update_outreach_logs_updated_at
    BEFORE UPDATE ON outreach_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
