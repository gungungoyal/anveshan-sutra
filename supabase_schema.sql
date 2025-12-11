-- ============================================
-- ANVESHAN SUTRA - SUPABASE DATABASE SCHEMA
-- Complete SQL to run on Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE org_type_enum AS ENUM ('NGO', 'Foundation', 'Incubator', 'CSR', 'Social Enterprise');
CREATE TYPE verification_status_enum AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE funding_type AS ENUM ('grant', 'provider', 'recipient', 'mixed');
CREATE TYPE user_role AS ENUM ('ngo', 'funder');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'rejected', 'shortlisted', 'excluded');

-- ============================================
-- FOCUS AREAS (Master Table)
-- ============================================

CREATE TABLE focus_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert focus areas
INSERT INTO focus_areas (name, description) VALUES
    ('Education', 'Education initiatives and programs'),
    ('Health', 'Healthcare and medical services'),
    ('Environment', 'Environmental conservation and sustainability'),
    ('Livelihood', 'Skills training and employment'),
    ('Technology', 'Tech-based solutions and digital literacy'),
    ('Governance', 'Civic engagement and public services');

-- ============================================
-- ORGANIZATIONS (Main Table)
-- ============================================

CREATE TABLE organizations (
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

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Public read access for organizations
CREATE POLICY "Organizations are viewable by everyone" ON organizations
    FOR SELECT USING (true);

-- ============================================
-- ORGANIZATION FOCUS AREAS (Junction Table)
-- ============================================

CREATE TABLE organization_focus_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    focus_area TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, focus_area)
);

CREATE INDEX idx_org_focus_areas ON organization_focus_areas(organization_id);
CREATE INDEX idx_focus_area_name ON organization_focus_areas(focus_area);

-- ============================================
-- PROJECTS
-- ============================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_org ON projects(organization_id);

-- ============================================
-- TARGET BENEFICIARIES
-- ============================================

CREATE TABLE target_beneficiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    beneficiary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, beneficiary)
);

CREATE INDEX idx_beneficiaries_org ON target_beneficiaries(organization_id);

-- ============================================
-- PARTNER HISTORY
-- ============================================

CREATE TABLE partner_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    partner_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, partner_name)
);

CREATE INDEX idx_partners_org ON partner_history(organization_id);

-- ============================================
-- USERS (Supabase Auth integration)
-- ============================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role user_role NOT NULL,
    profile_complete BOOLEAN DEFAULT false,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- SHORTLIST (User saved organizations)
-- ============================================

CREATE TABLE shortlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

ALTER TABLE shortlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shortlist" ON shortlist
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- MATCHES
-- ============================================

CREATE TABLE matches (
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
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
