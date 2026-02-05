-- ============================================
-- DRIVYA.AI - ORGANIZATION PURCHASES TABLE
-- Mock payment system for unlocking organization details
-- ============================================

-- Create purchases table to track which users have unlocked which organizations
CREATE TABLE IF NOT EXISTS organization_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    amount_paid INTEGER DEFAULT 99, -- Amount in INR (mock)
    payment_method TEXT DEFAULT 'mock_card',
    payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id TEXT, -- Mock transaction ID
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- NULL = never expires
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Enable Row Level Security
ALTER TABLE organization_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases" ON organization_purchases
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create purchases
CREATE POLICY "Users can create purchases" ON organization_purchases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_purchases_user ON organization_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_org ON organization_purchases(organization_id);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
