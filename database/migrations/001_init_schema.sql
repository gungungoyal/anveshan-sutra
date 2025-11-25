-- ANVESHAN Database Schema
-- Run these migrations in your Supabase project

-- 1. Focus Areas Table (Controlled Taxonomy)
CREATE TABLE IF NOT EXISTS focus_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert controlled focus areas
INSERT INTO focus_areas (name, icon, description) VALUES
  ('Education', 'book', 'Education and learning programs'),
  ('Health', 'heart', 'Healthcare and wellness initiatives'),
  ('Women Empowerment', 'female', 'Gender equality and women rights'),
  ('Technology', 'code', 'Technology and digital innovation'),
  ('Environment', 'leaf', 'Climate action and environmental conservation'),
  ('Livelihood', 'briefcase', 'Economic development and livelihood programs'),
  ('Governance', 'building', 'Governance and policy development'),
  ('Clean Water', 'droplet', 'Water access and sanitation'),
  ('Agriculture', 'wheat', 'Agricultural development'),
  ('Disability', 'accessibility', 'Disability rights and inclusion')
ON CONFLICT (name) DO NOTHING;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('ngo', 'funder')),
  profile_complete BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 3. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) CHECK (type IN ('NGO', 'CSR', 'Foundation', 'Social Enterprise', 'Donor')),
  description TEXT,
  mission TEXT,
  vision TEXT,
  founded_year INTEGER,
  headquarters VARCHAR(255),
  website VARCHAR(500),
  focus_area_ids UUID[],
  regions VARCHAR(255)[],
  international_partnerships TEXT,
  document_urls VARCHAR(500)[],
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_user_id ON organizations(user_id);
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_verified ON organizations(verified);

-- 4. Matches Table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_a_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  organization_b_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  alignment_score INTEGER CHECK (alignment_score >= 0 AND alignment_score <= 100),
  match_reason TEXT,
  status VARCHAR(50) CHECK (status IN ('pending', 'accepted', 'rejected', 'shortlisted', 'excluded')),
  user_action VARCHAR(50) CHECK (user_action IN ('shortlist', 'exclude', 'contacted') OR user_action IS NULL),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matches_org_a ON matches(organization_a_id);
CREATE INDEX idx_matches_org_b ON matches(organization_b_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_score ON matches(alignment_score DESC);

-- 5. Shortlist Table
CREATE TABLE IF NOT EXISTS shortlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shortlist_user ON shortlist(user_id);
CREATE INDEX idx_shortlist_org ON shortlist(organization_id);
CREATE UNIQUE INDEX idx_shortlist_unique ON shortlist(user_id, organization_id);
