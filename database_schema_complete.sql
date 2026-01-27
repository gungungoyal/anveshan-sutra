-- ============================================
-- DRIVYA.AI - COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 2: ENUMS
-- ============================================

-- Drop existing types if they exist (for clean recreation)
DROP TYPE IF EXISTS org_type_enum CASCADE;
DROP TYPE IF EXISTS verification_status_enum CASCADE;
DROP TYPE IF EXISTS funding_type CASCADE;
DROP TYPE IF EXISTS user_role_enum CASCADE;
DROP TYPE IF EXISTS match_status CASCADE;
DROP TYPE IF EXISTS user_intent_enum CASCADE;
DROP TYPE IF EXISTS onboarding_step_enum CASCADE;

CREATE TYPE org_type_enum AS ENUM ('NGO', 'Foundation', 'Incubator', 'CSR', 'Social Enterprise');
CREATE TYPE verification_status_enum AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE funding_type AS ENUM ('grant', 'provider', 'recipient', 'mixed');
CREATE TYPE user_role_enum AS ENUM ('ngo', 'incubator', 'csr', 'funder');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'rejected', 'shortlisted', 'excluded');
CREATE TYPE user_intent_enum AS ENUM ('seeker', 'provider', 'both');
CREATE TYPE onboarding_step_enum AS ENUM ('personal_info', 'role_selection', 'interest_selection', 'org_form', 'complete');

-- ============================================
-- STEP 3: USER PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    
    -- Role & Intent
    role user_role_enum NOT NULL DEFAULT 'ngo',
    user_role user_role_enum,  -- Deprecated, kept for backward compatibility
    user_intent user_intent_enum DEFAULT 'seeker',
    
    -- Organization info (before org table link)
    organization_name TEXT,
    
    -- Onboarding state
    onboarding_step onboarding_step_enum DEFAULT 'personal_info',
    onboarding_complete BOOLEAN DEFAULT false,
    profile_complete BOOLEAN DEFAULT false,
    verified BOOLEAN DEFAULT false,
    
    -- Interests & Preferences
    interest_areas TEXT[] DEFAULT '{}',
    bio TEXT,
    preferences JSONB DEFAULT '{"notifications": true, "theme": "system", "newsletter": false}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 4: ORGANIZATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type org_type_enum NOT NULL,
    website TEXT,
    headquarters TEXT NOT NULL,
    region TEXT NOT NULL,
    mission TEXT NOT NULL,
    description TEXT NOT NULL,
    verification_status verification_status_enum DEFAULT 'unverified',
    funding_type funding_type,
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    alignment_score INTEGER CHECK (alignment_score >= 0 AND alignment_score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON organizations;
DROP POLICY IF EXISTS "Anyone can submit organizations" ON organizations;

CREATE POLICY "Organizations are viewable by everyone" ON organizations
    FOR SELECT USING (true);

CREATE POLICY "Anyone can submit organizations" ON organizations
    FOR INSERT WITH CHECK (true);

-- ============================================
-- STEP 5: USER-ORGANIZATION JUNCTION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'admin', 'member', 'viewer'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own organization links" ON user_organizations;
DROP POLICY IF EXISTS "Users can manage own organization links" ON user_organizations;

CREATE POLICY "Users can view own organization links" ON user_organizations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own organization links" ON user_organizations
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: ORGANIZATION FOCUS AREAS
-- ============================================

CREATE TABLE IF NOT EXISTS organization_focus_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    focus_area TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, focus_area)
);

CREATE INDEX IF NOT EXISTS idx_org_focus_areas ON organization_focus_areas(organization_id);
CREATE INDEX IF NOT EXISTS idx_focus_area_name ON organization_focus_areas(focus_area);

ALTER TABLE organization_focus_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Focus areas are viewable by everyone" ON organization_focus_areas;
DROP POLICY IF EXISTS "Anyone can add focus areas" ON organization_focus_areas;

CREATE POLICY "Focus areas are viewable by everyone" ON organization_focus_areas
    FOR SELECT USING (true);

CREATE POLICY "Anyone can add focus areas" ON organization_focus_areas
    FOR INSERT WITH CHECK (true);

-- ============================================
-- STEP 7: SHORTLIST TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS shortlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

ALTER TABLE shortlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own shortlist" ON shortlist;

CREATE POLICY "Users can manage own shortlist" ON shortlist
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- OTP CODES (Email Verification)
-- ============================================

CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    purpose TEXT NOT NULL, -- 'signup', 'login', 'password_reset'
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT false,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);

-- Enable RLS
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Allow public access for insert/verify (needed for unauthenticated flow)
-- Note: In production, you might want more restrictive policies
DROP POLICY IF EXISTS "Serve otp codes" ON otp_codes;

CREATE POLICY "Serve otp codes" ON otp_codes
    FOR ALL USING (true); -- Service role key bypasses this anyway, but good for anon access if needed

-- ============================================
-- STEP 8: FOCUS AREAS MASTER TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS focus_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default focus areas
INSERT INTO focus_areas (name, description) VALUES
    ('Education', 'Education initiatives and programs'),
    ('Health', 'Healthcare and medical services'),
    ('Environment', 'Environmental conservation and sustainability'),
    ('Livelihood', 'Skills training and employment'),
    ('Technology', 'Tech-based solutions and digital literacy'),
    ('Governance', 'Civic engagement and public services')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STEP 9: MATCHES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_a_id TEXT NOT NULL REFERENCES organizations(id),
    organization_b_id TEXT NOT NULL REFERENCES organizations(id),
    alignment_score INTEGER CHECK (alignment_score >= 0 AND alignment_score <= 100),
    match_reason TEXT,
    status match_status DEFAULT 'pending',
    user_action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 10: PROJECTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);

-- ============================================
-- STEP 11: TARGET BENEFICIARIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS target_beneficiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    beneficiary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, beneficiary)
);

CREATE INDEX IF NOT EXISTS idx_beneficiaries_org ON target_beneficiaries(organization_id);

-- ============================================
-- STEP 12: PARTNER HISTORY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS partner_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    partner_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, partner_name)
);

CREATE INDEX IF NOT EXISTS idx_partners_org ON partner_history(organization_id);

-- ============================================
-- STEP 13: UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON user_profiles;

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Your database is ready.
-- ============================================
