-- ============================================
-- DRIVYA.AI - SUPABASE DATABASE SCHEMA
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
-- Allow anyone to insert new organizations (for public submission form)
CREATE POLICY "Anyone can submit organizations" ON organizations
    FOR INSERT WITH CHECK (true);

-- Also add INSERT policy for organization_focus_areas
ALTER TABLE organization_focus_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can add focus areas" ON organization_focus_areas
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Focus areas are viewable by everyone" ON organization_focus_areas
    FOR SELECT USING (true);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"notifications": true, "theme": "system", "newsletter": false}'::jsonb;
-- ============================================
-- DRIVYA.AI - SEED DATA FOR SUPABASE
-- Run this AFTER supabase_schema.sql
-- ============================================

-- ============================================
-- INSERT ALL 50 ORGANIZATIONS
-- ============================================

INSERT INTO organizations (id, name, type, website, headquarters, region, mission, description, verification_status, funding_type, confidence, alignment_score) VALUES
('org-001', 'Future Educators Foundation', 'NGO', 'https://futureteachers.org', 'Uttar Pradesh', 'Northern India', 'Empowering rural communities through quality education and skill development programs.', 'Future Educators Foundation works across Uttar Pradesh and Madhya Pradesh, providing educational resources and teacher training to over 50 schools. We focus on making quality education accessible to underprivileged children.', 'verified', 'recipient', 92, 92),
('org-002', 'Health for All Initiative', 'Foundation', 'https://healthforall.org', 'Maharashtra', 'Western India', 'Ensuring access to quality healthcare in underserved communities across India.', 'Health for All Initiative operates mobile clinics and trains community health workers in rural Maharashtra and Gujarat. We focus on preventive care and health education.', 'verified', 'mixed', 88, 88),
('org-003', 'Green Earth Collective', 'NGO', 'https://greenearthcollective.in', 'Karnataka', 'Southern India', 'Promoting sustainable livelihoods through environmental conservation.', 'Green Earth Collective works on reforestation, organic farming, and sustainable tourism in Western Ghats. We engage local communities in conservation efforts.', 'verified', 'recipient', 85, 85),
('org-004', 'Tech Skills Academy', 'Incubator', 'https://techskillsacademy.com', 'Bangalore', 'Southern India', 'Building tech talent from underrepresented communities through bootcamp and mentorship.', 'Tech Skills Academy runs intensive coding bootcamps and provides job placement support. We have trained 2000+ developers from low-income backgrounds.', 'verified', 'mixed', 90, 90),
('org-005', 'ACIC Innovation Hub', 'Incubator', 'https://acicinnovation.org', 'Delhi', 'Northern India', 'Accelerating social enterprises solving India''s critical challenges through innovation.', 'ACIC Innovation Hub supports 50+ social enterprises annually through mentorship, funding, and network access. We focus on scalable solutions for governance, education, and livelihood.', 'verified', 'provider', 91, 91),
('org-006', 'Vocational Skills India', 'NGO', 'https://vocationalskillsindia.org', 'Andhra Pradesh', 'Southern India', 'Providing vocational training to youth for employment and entrepreneurship.', 'Vocational Skills India runs training centers in rural Andhra Pradesh, offering courses in construction, hospitality, and healthcare. We have trained 10000+ youth.', 'unverified', 'recipient', 72, 72),
('org-007', 'Women Empowerment Network', 'NGO', 'https://womenempowermentnet.in', 'Rajasthan', 'Western India', 'Empowering rural women through self-help groups and economic opportunities.', 'WEN facilitates self-help groups across Rajasthan, providing microfinance, business training, and market linkages. We support 5000+ women entrepreneurs.', 'verified', 'mixed', 87, 87),
('org-008', 'Youth Leadership Foundation', 'Foundation', 'https://youthleadership.org', 'Tamil Nadu', 'Southern India', 'Developing next-generation leaders through civic engagement and skills training.', 'YLF runs leadership programs in schools, colleges, and communities across Tamil Nadu. We focus on youth civic engagement and social responsibility.', 'verified', 'provider', 84, 84),
('org-009', 'Clean Water Foundation', 'Foundation', 'https://cleanwaterfoundation.org', 'Bihar', 'Eastern India', 'Ensuring access to safe drinking water and sanitation in rural communities.', 'Clean Water Foundation builds and maintains water systems in rural Bihar, benefiting 50000+ people. We also provide hygiene education and community training.', 'verified', 'recipient', 89, 89),
('org-010', 'Digital Innovation Lab', 'Incubator', 'https://digitalinnovationlab.in', 'Hyderabad', 'Southern India', 'Enabling digital solutions for social good through innovation and collaboration.', 'DIL works with social enterprises to develop tech solutions for governance, healthcare, and education. We provide technical support, funding, and market linkages.', 'pending', 'provider', 79, 79),
('org-011', 'Rural Health Outreach Trust', 'NGO', 'https://ruralhealthoutreach.in', 'Jharkhand', 'Eastern India', 'Reducing rural health disparities through mobile clinics and public health awareness.', 'RHOT operates in tribal districts of Jharkhand, offering preventive healthcare, vaccination drives, and maternal health programs.', 'verified', 'recipient', 86, 86),
('org-012', 'SkillUp Youth Foundation', 'Foundation', 'https://skillupyouth.org', 'Haryana', 'Northern India', 'Improving employability of rural youth through career training and industry partnerships.', 'SkillUp runs training centers in Haryana, offering job-oriented courses in IT, retail, and logistics.', 'verified', 'mixed', 90, 90),
('org-013', 'Smart Village Innovation Trust', 'NGO', 'https://smartvillagetrust.in', 'Odisha', 'Eastern India', 'Digitizing governance and improving rural service delivery through tech solutions.', 'SVIT builds digital kiosks, e-governance access points, and citizen service centers in remote blocks of Odisha.', 'pending', 'recipient', 78, 78),
('org-014', 'Nature Conservation Forum', 'NGO', 'https://natureconservationforum.org', 'Assam', 'North-East India', 'Protecting biodiversity and empowering indigenous communities for environmental stewardship.', 'NCF operates conservation programs in Assam''s forest belts, focusing on anti-poaching education and habitat restoration.', 'verified', 'recipient', 83, 83),
('org-015', 'India Tech for Good Alliance', 'Foundation', 'https://techforgoodalliance.in', 'Mumbai', 'Western India', 'Accelerating the use of technology to improve education and public services.', 'ITGA funds and supports ed-tech and civic-tech startups, providing grants, mentorship, and research support.', 'verified', 'provider', 92, 92),
('org-016', 'Community Resilience Network', 'NGO', 'https://crnetwork.in', 'Uttarakhand', 'Northern India', 'Building disaster-resilient communities in hilly regions through capacity development.', 'CRN strengthens disaster preparedness by training communities for landslides, floods, and emergency response.', 'unverified', 'recipient', 71, 71),
('org-017', 'Women Tech Forward', 'Foundation', 'https://womentechforward.org', 'Pune', 'Western India', 'Increasing women''s participation in the technology workforce.', 'The foundation sponsors tech scholarships, coding programs, and mentorship networks for women across India.', 'verified', 'provider', 89, 89),
('org-018', 'Bharat Rural Development Center', 'NGO', 'https://brdcenter.in', 'Madhya Pradesh', 'Central India', 'Improving rural income and empowering Panchayats through decentralised development.', 'BRDC works with Panchayats to improve local governance, run livelihood clusters, and support SHGs in MP.', 'pending', 'mixed', 76, 76),
('org-019', 'Future Cities Innovation Lab', 'Incubator', 'https://futurecitieslab.in', 'Bangalore', 'Southern India', 'Driving innovation for sustainable and smart urban development.', 'FCIL incubates cleantech, mobility, and urban governance startups focused on solving Indian city challenges.', 'verified', 'provider', 88, 88),
('org-020', 'Mindful Education Collective', 'NGO', 'https://mindfuleducationcollective.in', 'Kerala', 'Southern India', 'Enhancing student well-being through mental health programs in schools.', 'MEC provides school counselors, SEL curriculum, and teacher training on mental health across Kerala.', 'verified', 'recipient', 91, 91),
('org-021', 'Himalayan Education Support Trust', 'NGO', 'https://himalayanedusupport.in', 'Himachal Pradesh', 'Northern India', 'Improving access to schooling in remote mountain regions.', 'Operates learning centers and provides volunteer teachers in remote Himachal villages.', 'verified', 'recipient', 88, 88),
('org-022', 'Clean Air Action Network', 'NGO', 'https://cleanairaction.in', 'Delhi', 'Northern India', 'Reducing air pollution through awareness, data tracking, and policy advocacy.', 'Runs air-quality monitoring stations and community sensitization programs across NCR.', 'verified', 'mixed', 91, 91),
('org-023', 'Digital Rural Access Mission', 'Foundation', 'https://dramission.org', 'Telangana', 'Southern India', 'Bridging the rural digital divide through connectivity and training.', 'Provides Wi-Fi hotspots, digital kiosks, and basic digital literacy in rural Telangana.', 'pending', 'recipient', 79, 79),
('org-024', 'Sustainable Agriculture Collective', 'NGO', 'https://sacindia.org', 'Punjab', 'Northern India', 'Promoting chemical-free agriculture and small farmer sustainability.', 'Works with farmer groups to reduce stubble burning and adopt natural farming.', 'verified', 'recipient', 87, 87),
('org-025', 'Urban Women Workforce Fund', 'Foundation', 'https://uwf-india.org', 'Mumbai', 'Western India', 'Increasing women''s workforce participation in urban India.', 'Supports skilling, placement, and workplace safety advocacy for low-income women.', 'verified', 'provider', 92, 92),
('org-026', 'Green Villages Restoration Trust', 'NGO', 'https://greenvillagetrust.in', 'Chhattisgarh', 'Central India', 'Reviving forest ecosystems with community partnership.', 'Works with tribal communities on reforestation, water conservation, and forest-based livelihoods.', 'unverified', 'recipient', 70, 70),
('org-027', 'TechBridge Incubation Hub', 'Incubator', 'https://techbridgehub.in', 'Pune', 'Western India', 'Supporting deep-tech startups solving social and industrial problems.', 'Runs structured incubation programs with prototyping labs and investor access.', 'verified', 'provider', 90, 90),
('org-028', 'India Water Security Mission', 'NGO', 'https://iwsm.in', 'Rajasthan', 'Western India', 'Ensuring village-level water security through sustainable interventions.', 'Builds rainwater harvesting systems, restores ponds, and trains village committees.', 'verified', 'mixed', 89, 89),
('org-029', 'Youth Employability Accelerator', 'NGO', 'https://yeaccelerator.in', 'Karnataka', 'Southern India', 'Preparing youth for the future job market through practical training.', 'Runs domain-based certifications and soft-skills workshops in tier-2 cities.', 'pending', 'recipient', 77, 77),
('org-030', 'India Governance Research Forum', 'Foundation', 'https://igrf.in', 'Delhi', 'Northern India', 'Improving public service delivery through research and policy pilots.', 'Works with state governments on education, health, and municipal governance reforms.', 'verified', 'provider', 93, 93),
('org-031', 'Rural Transport Access Coalition', 'NGO', 'https://rtacoalition.in', 'Bihar', 'Eastern India', 'Improving rural connectivity and access to basic services.', 'Works with panchayats to upgrade village roads and provide shared transport solutions.', 'pending', 'recipient', 78, 78),
('org-032', 'Women Health Literacy Forum', 'NGO', 'https://whlf.in', 'West Bengal', 'Eastern India', 'Building awareness on maternal and menstrual health.', 'Operates health literacy workshops and partners with ASHA workers for community outreach.', 'verified', 'mixed', 88, 88),
('org-033', 'Tech for Schools Initiative', 'Foundation', 'https://techforschools.in', 'Chennai', 'Southern India', 'Boosting digital education through accessible tools and teacher training.', 'Provides low-cost tablets, digital content, and teacher support for government schools.', 'verified', 'provider', 93, 93),
('org-034', 'Community Nutrition Improvement Trust', 'NGO', 'https://cnitrust.in', 'Jharkhand', 'Eastern India', 'Reducing malnutrition through community-driven nutrition programs.', 'Runs nutrition camps and partners with anganwadis for child growth monitoring.', 'pending', 'recipient', 74, 74),
('org-035', 'Indian Youth Climate Forum', 'NGO', 'https://iycf.in', 'Delhi', 'Northern India', 'Mobilizing youth for climate action and sustainability projects.', 'Conducts climate leadership programs, schools outreach, and community climate pilots.', 'verified', 'mixed', 89, 89),
('org-036', 'Inclusive Tech Workforce Alliance', 'Foundation', 'https://itwa.in', 'Bangalore', 'Southern India', 'Increasing employment opportunities for persons with disabilities.', 'Connects companies with trained candidates, provides accessibility training, and develops assistive tech tools.', 'verified', 'provider', 92, 92),
('org-037', 'Rural Microenterprise Accelerator', 'NGO', 'https://rmea.in', 'Madhya Pradesh', 'Central India', 'Supporting rural entrepreneurs through training and market linkages.', 'Helps small artisans, shopkeepers, and women microenterprises grow sustainably.', 'verified', 'recipient', 90, 90),
('org-038', 'India Mental Health Collective', 'NGO', 'https://imhc.in', 'Goa', 'Western India', 'Improving access to mental health support across India.', 'Runs helplines, tele-counseling, and training for school counselors and youth workers.', 'pending', 'mixed', 80, 80),
('org-039', 'Farm-to-Market Linkages Trust', 'NGO', 'https://fmltrust.in', 'Gujarat', 'Western India', 'Helping small farmers access stable, higher-value markets.', 'Creates farmer groups, trains in post-harvest handling, and connects to wholesale buyers.', 'verified', 'recipient', 91, 91),
('org-040', 'Future Skills Coding Lab', 'Incubator', 'https://futureskillscodinglab.in', 'Hyderabad', 'Southern India', 'Preparing students for future digital careers.', 'Operates coding labs, robotics workshops, and early-tech training in schools and colleges.', 'verified', 'provider', 89, 89),
('org-041', 'Indian Community Housing Trust', 'NGO', 'https://ichousingtrust.in', 'Tamil Nadu', 'Southern India', 'Supporting safe housing and basic infrastructure for low-income communities.', 'Works with municipalities to upgrade slum housing and support community groups.', 'pending', 'recipient', 76, 76),
('org-042', 'Tribal Education Advancement Fund', 'Foundation', 'https://teaf.in', 'Odisha', 'Eastern India', 'Increasing school attendance and learning outcomes in tribal belts.', 'Provides residential schooling support, scholarships, and remedial education.', 'verified', 'provider', 91, 91),
('org-043', 'Clean Rivers Restoration Alliance', 'NGO', 'https://crra.in', 'Uttar Pradesh', 'Northern India', 'Restoring river ecosystems through community participation.', 'Runs river clean-ups, pollution monitoring, and watershed restoration.', 'verified', 'mixed', 89, 89),
('org-044', 'Women Legal Empowerment Network', 'NGO', 'https://wlen.in', 'Maharashtra', 'Western India', 'Providing legal literacy and support services to women.', 'Runs legal aid clinics, support groups, and case-navigation services in semi-urban areas.', 'pending', 'recipient', 79, 79),
('org-045', 'India Renewable Energy Lab', 'Incubator', 'https://irelab.in', 'Bangalore', 'Southern India', 'Accelerating clean-energy startups working on solar, wind, and bioenergy.', 'Provides testing labs, prototyping tools, and investor networks for energy innovators.', 'verified', 'provider', 93, 93),
('org-046', 'Rural Water Governance Support Center', 'NGO', 'https://rwgs.in', 'Karnataka', 'Southern India', 'Improving village water governance through committees and data-based planning.', 'Trains gram panchayats on water budgeting, monitoring, and village planning.', 'verified', 'mixed', 88, 88),
('org-047', 'Future of Learning Innovation Fund', 'Foundation', 'https://flif.in', 'Delhi', 'Northern India', 'Supporting innovation in teaching, assessments, and learning tools.', 'Funds pilots in government schools and early-stage edtech startups.', 'verified', 'provider', 92, 92),
('org-048', 'India Public Health Research Collective', 'NGO', 'https://iphrc.in', 'Kerala', 'Southern India', 'Strengthening public health systems with research and field pilots.', 'Works with state governments on disease surveillance, data systems, and health worker training.', 'pending', 'mixed', 82, 82),
('org-049', 'Community Digital Services Alliance', 'NGO', 'https://cdsa.in', 'Andhra Pradesh', 'Southern India', 'Expanding digital public services in rural communities.', 'Runs digital seva centers and trains volunteers for assisted digital transactions.', 'unverified', 'recipient', 72, 72),
('org-050', 'National Social Enterprise Accelerator', 'Incubator', 'https://nsea.in', 'Delhi', 'Northern India', 'Accelerating impact ventures solving India''s toughest development challenges.', 'Supports early-stage social enterprises with mentorship, capital access, and corporate linkages.', 'verified', 'provider', 94, 94);
-- ============================================
-- DRIVYA.AI - SEED DATA (PART 2)
-- Focus Areas, Projects, Beneficiaries, Partners
-- Run this AFTER supabase_seed_organizations.sql
-- ============================================

-- ============================================
-- ORGANIZATION FOCUS AREAS
-- ============================================

INSERT INTO organization_focus_areas (organization_id, focus_area, is_primary) VALUES
-- org-001 Future Educators Foundation
('org-001', 'Education', true),
('org-001', 'Livelihood', false),
-- org-002 Health for All Initiative
('org-002', 'Health', true),
('org-002', 'Environment', false),
-- org-003 Green Earth Collective
('org-003', 'Environment', true),
('org-003', 'Livelihood', false),
-- org-004 Tech Skills Academy
('org-004', 'Technology', true),
('org-004', 'Livelihood', false),
-- org-005 ACIC Innovation Hub
('org-005', 'Technology', true),
('org-005', 'Governance', false),
-- org-006 Vocational Skills India
('org-006', 'Livelihood', true),
('org-006', 'Education', false),
-- org-007 Women Empowerment Network
('org-007', 'Livelihood', true),
('org-007', 'Governance', false),
-- org-008 Youth Leadership Foundation
('org-008', 'Education', true),
('org-008', 'Governance', false),
-- org-009 Clean Water Foundation
('org-009', 'Health', true),
('org-009', 'Environment', false),
-- org-010 Digital Innovation Lab
('org-010', 'Technology', true),
('org-010', 'Governance', false),
-- org-011 Rural Health Outreach Trust
('org-011', 'Health', true),
('org-011', 'Governance', false),
-- org-012 SkillUp Youth Foundation
('org-012', 'Livelihood', true),
('org-012', 'Education', false),
-- org-013 Smart Village Innovation Trust
('org-013', 'Governance', true),
('org-013', 'Technology', false),
-- org-014 Nature Conservation Forum
('org-014', 'Environment', true),
('org-014', 'Governance', false),
-- org-015 India Tech for Good Alliance
('org-015', 'Technology', true),
('org-015', 'Education', false),
-- org-016 Community Resilience Network
('org-016', 'Health', true),
('org-016', 'Environment', false),
-- org-017 Women Tech Forward
('org-017', 'Technology', true),
('org-017', 'Livelihood', false),
-- org-018 Bharat Rural Development Center
('org-018', 'Livelihood', true),
('org-018', 'Governance', false),
-- org-019 Future Cities Innovation Lab
('org-019', 'Technology', true),
('org-019', 'Environment', false),
-- org-020 Mindful Education Collective
('org-020', 'Education', true),
('org-020', 'Health', false),
-- org-021 Himalayan Education Support Trust
('org-021', 'Education', true),
-- org-022 Clean Air Action Network
('org-022', 'Environment', true),
('org-022', 'Health', false),
-- org-023 Digital Rural Access Mission
('org-023', 'Technology', true),
('org-023', 'Governance', false),
-- org-024 Sustainable Agriculture Collective
('org-024', 'Livelihood', true),
('org-024', 'Environment', false),
-- org-025 Urban Women Workforce Fund
('org-025', 'Livelihood', true),
('org-025', 'Governance', false),
-- org-026 Green Villages Restoration Trust
('org-026', 'Environment', true),
-- org-027 TechBridge Incubation Hub
('org-027', 'Technology', true),
-- org-028 India Water Security Mission
('org-028', 'Environment', true),
('org-028', 'Health', false),
-- org-029 Youth Employability Accelerator
('org-029', 'Livelihood', true),
-- org-030 India Governance Research Forum
('org-030', 'Governance', true),
-- org-031 Rural Transport Access Coalition
('org-031', 'Governance', true),
('org-031', 'Livelihood', false),
-- org-032 Women Health Literacy Forum
('org-032', 'Health', true),
('org-032', 'Education', false),
-- org-033 Tech for Schools Initiative
('org-033', 'Technology', true),
('org-033', 'Education', false),
-- org-034 Community Nutrition Improvement Trust
('org-034', 'Health', true),
-- org-035 Indian Youth Climate Forum
('org-035', 'Environment', true),
('org-035', 'Education', false),
-- org-036 Inclusive Tech Workforce Alliance
('org-036', 'Technology', true),
('org-036', 'Livelihood', false),
-- org-037 Rural Microenterprise Accelerator
('org-037', 'Livelihood', true),
('org-037', 'Governance', false),
-- org-038 India Mental Health Collective
('org-038', 'Health', true),
-- org-039 Farm-to-Market Linkages Trust
('org-039', 'Livelihood', true),
-- org-040 Future Skills Coding Lab
('org-040', 'Technology', true),
('org-040', 'Education', false),
-- org-041 Indian Community Housing Trust
('org-041', 'Governance', true),
('org-041', 'Livelihood', false),
-- org-042 Tribal Education Advancement Fund
('org-042', 'Education', true),
-- org-043 Clean Rivers Restoration Alliance
('org-043', 'Environment', true),
-- org-044 Women Legal Empowerment Network
('org-044', 'Governance', true),
-- org-045 India Renewable Energy Lab
('org-045', 'Environment', true),
('org-045', 'Technology', false),
-- org-046 Rural Water Governance Support Center
('org-046', 'Governance', true),
('org-046', 'Environment', false),
-- org-047 Future of Learning Innovation Fund
('org-047', 'Education', true),
('org-047', 'Technology', false),
-- org-048 India Public Health Research Collective
('org-048', 'Health', true),
('org-048', 'Governance', false),
-- org-049 Community Digital Services Alliance
('org-049', 'Technology', true),
('org-049', 'Governance', false),
-- org-050 National Social Enterprise Accelerator
('org-050', 'Livelihood', true),
('org-050', 'Technology', false);

-- ============================================
-- PROJECTS (Sample for first 20 organizations)
-- ============================================

INSERT INTO projects (organization_id, title, year, description) VALUES
-- org-001
('org-001', 'Village Teacher Training Initiative', 2023, 'Trained 500+ teachers in modern teaching methodologies'),
('org-001', 'Digital Literacy Program', 2023, 'Provided computer training to 2000+ students'),
-- org-002
('org-002', 'Mobile Health Clinics', 2024, 'Serving 10000+ patients annually across 50 villages'),
('org-002', 'Community Health Worker Training', 2023, 'Trained 300+ local health workers'),
-- org-003
('org-003', 'Reforestation Program', 2024, 'Planted 100000+ trees and protected 5000 hectares'),
('org-003', 'Organic Farming Collective', 2023, 'Supporting 200+ farmers in sustainable agriculture'),
-- org-004
('org-004', 'Full Stack Development Bootcamp', 2024, '85% job placement rate, 500+ students graduated'),
('org-004', 'Women in Tech Initiative', 2023, '30% female cohort with dedicated mentorship'),
-- org-005
('org-005', 'Accelerator Program', 2024, 'Supporting 50+ social enterprises with $2M in funding'),
('org-005', 'Innovation Fellowship', 2023, '100+ fellows trained in social enterprise management'),
-- org-006
('org-006', 'Construction Skills Program', 2024, 'Training 500+ construction workers with certification'),
('org-006', 'Healthcare Assistant Course', 2023, '80% placement rate among healthcare trainees'),
-- org-007
('org-007', 'Self-Help Group Network', 2024, 'Supporting 500+ SHGs with $5M in microfinance'),
('org-007', 'Women Entrepreneur Bootcamp', 2023, 'Trained 1000+ women in business and financial literacy'),
-- org-008
('org-008', 'School Leadership Program', 2024, 'Engaging 10000+ school students in civic activities'),
('org-008', 'College Fellowship', 2023, '50+ college leaders selected as change agents'),
-- org-009
('org-009', 'Water System Installation', 2024, 'Built 200+ water systems benefiting 50000+ people'),
('org-009', 'Hygiene Education Program', 2023, 'Trained 2000+ community health volunteers'),
-- org-010
('org-010', 'Social Tech Accelerator', 2024, 'Supporting 30+ tech-based social enterprises'),
('org-010', 'Civic Tech Initiative', 2023, 'Developing digital solutions for local governance'),
-- org-011
('org-011', 'Maternal Health Initiative', 2024, 'Supported 3000+ women with prenatal and postnatal care'),
('org-011', 'Vaccination Outreach Drive', 2023, 'Reached 15000+ children across 80 villages'),
-- org-012
('org-012', 'Rural Employment Program', 2024, 'Placed 1500+ youth in private sector roles'),
('org-012', 'Retail Skills Bootcamp', 2023, 'Trained 800+ participants with 70% placement rate'),
-- org-013
('org-013', 'E-Governance Kiosk Project', 2024, 'Set up 120+ citizen service kiosks across districts'),
('org-013', 'Digital Literacy for Farmers', 2023, 'Trained 4000 farmers to use digital services'),
-- org-014
('org-014', 'Habitat Restoration Program', 2024, 'Restored 1200 hectares of degraded forest land'),
('org-014', 'Anti-Poaching Awareness Drive', 2023, 'Trained 500+ youth volunteers'),
-- org-015
('org-015', 'EdTech Innovation Grant', 2024, 'Funded 20+ early-stage education technology startups'),
('org-015', 'Digital Civics Research Program', 2023, 'Published 12+ research papers on tech-based governance'),
-- org-016
('org-016', 'Disaster Preparedness Workshops', 2024, 'Trained 7000+ villagers in emergency response'),
('org-016', 'Eco-Safe Housing Initiative', 2023, 'Built 50+ sustainable community shelters'),
-- org-017
('org-017', 'Women Coders Scholarship', 2024, 'Awarded 800+ coding scholarships'),
('org-017', 'Tech Mentorship Circles', 2023, 'Connected 2000+ women with industry mentors'),
-- org-018
('org-018', 'Panchayat Leadership Training', 2024, 'Trained 1200+ elected representatives'),
('org-018', 'Rural Livelihood Cluster Program', 2023, 'Helped 3000+ artisans scale microenterprises'),
-- org-019
('org-019', 'Urban Innovation Accelerator', 2024, 'Supported 25+ startups in mobility, waste, and energy'),
('org-019', 'Smart City Data Lab', 2023, 'Built open datasets for 4 Indian cities'),
-- org-020
('org-020', 'School Mental Wellness Program', 2024, 'Reached 300+ schools and 40,000+ students'),
('org-020', 'Teacher SEL Certification', 2023, 'Certified 1500+ teachers in emotional literacy');

-- ============================================
-- TARGET BENEFICIARIES (Sample)
-- ============================================

INSERT INTO target_beneficiaries (organization_id, beneficiary) VALUES
('org-001', 'School Children 6-18'),
('org-001', 'Rural Teachers'),
('org-002', 'Rural Communities'),
('org-002', 'Women & Children'),
('org-003', 'Farmers'),
('org-003', 'Forest Communities'),
('org-004', 'Youth 18-30'),
('org-004', 'Women Developers'),
('org-005', 'Social Entrepreneurs'),
('org-005', 'Startups'),
('org-006', 'Youth 16-30'),
('org-006', 'Rural Communities'),
('org-007', 'Rural Women'),
('org-007', 'Entrepreneurs'),
('org-008', 'Youth 12-25'),
('org-008', 'Students'),
('org-009', 'Rural Communities'),
('org-009', 'Women & Children'),
('org-010', 'Social Entrepreneurs'),
('org-010', 'Communities');

-- ============================================
-- PARTNER HISTORY (Sample)
-- ============================================

INSERT INTO partner_history (organization_id, partner_name) VALUES
('org-001', 'UNICEF'),
('org-001', 'Global Fund for Education'),
('org-002', 'WHO'),
('org-002', 'Gates Foundation'),
('org-003', 'IUCN'),
('org-003', 'Rainforest Alliance'),
('org-004', 'Google'),
('org-004', 'Microsoft'),
('org-005', 'Omidyar Network'),
('org-005', 'World Economic Forum'),
('org-006', 'NITI Aayog'),
('org-007', 'NABARD'),
('org-007', 'Acumen Fund'),
('org-008', 'India Together'),
('org-008', 'Ashoka'),
('org-009', 'Water Aid'),
('org-009', 'USAID'),
('org-010', 'Google.org'),
('org-010', 'Facebook Social Impact');
-- ============================================
-- DRIVYA.AI - ROLE + INTENT ONBOARDING MIGRATION
-- Run this on your Supabase SQL Editor
-- ============================================

-- Add role column for user type
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_role TEXT 
CHECK (user_role IN ('ngo', 'incubator', 'csr'));

-- Add intent column for user purpose
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_intent TEXT 
CHECK (user_intent IN ('seeker', 'provider', 'both'));

-- Add onboarding completion flag
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role 
ON user_profiles(user_role);

-- Create index for intent-based queries  
CREATE INDEX IF NOT EXISTS idx_user_profiles_intent 
ON user_profiles(user_intent);

-- ============================================
-- NOTES:
-- 
-- Role values:
--   'ngo' - Non-profit organization
--   'incubator' - Incubator/Accelerator 
--   'csr' - CSR/Funder/Foundation
--
-- Intent values:
--   'seeker' - Looking for partners/funding
--   'provider' - Offering support
--   'both' - Only for incubators
--
-- Business rules enforced in application:
--   NGO → Seeker only
--   CSR → Provider only  
--   Incubator → Seeker / Provider / Both
-- ============================================
-- ============================================
-- DRIVYA.AI - PROFILE SETTINGS MIGRATION
-- Run this on your Supabase SQL Editor
-- ============================================

-- Add new columns to user_profiles table for extended profile functionality
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"notifications": true, "theme": "system", "newsletter": false}'::jsonb;

-- Create storage bucket for avatars (if not exists)
-- Note: This needs to be done via Supabase Dashboard > Storage > Create Bucket
-- Bucket name: avatars
-- Public bucket: Yes (for public avatar URLs)

-- Create policy for avatar uploads (run after creating bucket)
-- Allow authenticated users to upload their own avatars
-- INSERT policy for avatars bucket:
-- CREATE POLICY "Users can upload own avatar" ON storage.objects
--     FOR INSERT WITH CHECK (
--         bucket_id = 'avatars' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- Allow public read access to avatars
-- SELECT policy for avatars bucket:
-- CREATE POLICY "Avatars are publicly accessible" ON storage.objects
--     FOR SELECT USING (bucket_id = 'avatars');

-- Update existing users with default preferences if null
UPDATE user_profiles
SET preferences = '{"notifications": true, "theme": "system", "newsletter": false}'::jsonb
WHERE preferences IS NULL;
-- ============================================
-- DRIVYA.AI - NGO JOURNEY MIGRATION
-- Run this on your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ENHANCE ORGANIZATIONS TABLE FOR NGOs
-- ============================================

-- Add NGO-specific fields
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS year_registered INTEGER;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS beneficiary_scale TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS needs_funding BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS needs_mentorship BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS needs_infrastructure BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS needs_pilots BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged'));
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS moderation_notes TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id);

-- ============================================
-- 2. USER ORGANIZATION LINK
-- ============================================

-- Link users to their organization(s)
CREATE TABLE IF NOT EXISTS user_organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org links" ON user_organizations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create org links" ON user_organizations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. PRIVATE NOTES (Per Org Per User)
-- ============================================

-- Note: shortlist table already has notes column, so this extends it
-- Add updated_at to shortlist if not exists
ALTER TABLE shortlist ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE shortlist ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
ALTER TABLE shortlist ADD COLUMN IF NOT EXISTS tags TEXT[];

-- ============================================
-- 4. EMAIL DRAFTS
-- ============================================

CREATE TABLE IF NOT EXISTS email_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    recipient_email TEXT,
    recipient_name TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own email drafts" ON email_drafts
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 5. PPT DRAFTS
-- ============================================

CREATE TABLE IF NOT EXISTS ppt_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    organization_ids TEXT[], -- Array of org IDs included
    content JSONB NOT NULL, -- Structured PPT content
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ppt_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ppt drafts" ON ppt_drafts
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 6. MOU DRAFTS
-- ============================================

CREATE TABLE IF NOT EXISTS mou_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL, -- Structured MoU content
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mou_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own mou drafts" ON mou_drafts
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 7. COLLABORATION FEEDBACK (From Previous Task)
-- ============================================

CREATE TABLE IF NOT EXISTS collaboration_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('viewed_profile', 'downloaded_ppt', 'shortlisted', 'contacted')),
    outcome TEXT CHECK (outcome IN ('started_conversation', 'scheduled_meeting', 'proposal_shared', 'partnership_formed')),
    is_positive BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id, action_type)
);

ALTER TABLE collaboration_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own feedback" ON collaboration_feedback
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 8. PLATFORM FEEDBACK
-- ============================================

CREATE TABLE IF NOT EXISTS platform_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('ux', 'feature', 'bug', 'other')),
    message TEXT,
    page_context TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE platform_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit feedback" ON platform_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback" ON platform_feedback
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 9. ADD TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_email_drafts_updated_at
    BEFORE UPDATE ON email_drafts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ppt_drafts_updated_at
    BEFORE UPDATE ON ppt_drafts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mou_drafts_updated_at
    BEFORE UPDATE ON mou_drafts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shortlist_updated_at
    BEFORE UPDATE ON shortlist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_org_moderation ON organizations(moderation_status);
CREATE INDEX IF NOT EXISTS idx_org_submitted_by ON organizations(submitted_by);
CREATE INDEX IF NOT EXISTS idx_user_orgs_user ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_email_drafts_user ON email_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_ppt_drafts_user ON ppt_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_feedback_org ON collaboration_feedback(organization_id);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- ============================================
-- DRIVYA.AI - OTP AUTHENTICATION MIGRATION
-- Run this on your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. OTP CODES TABLE
-- Stores temporary OTP codes for email verification
-- ============================================

CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose TEXT DEFAULT 'signup' CHECK (purpose IN ('signup', 'login', 'password_reset')),
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by email
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);

-- Index for cleanup of expired OTPs
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);

-- Enable RLS
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert OTP codes (needed for signup before auth)
CREATE POLICY "Anyone can request OTP" ON otp_codes
    FOR INSERT WITH CHECK (true);

-- Allow anyone to verify their own OTP by email
CREATE POLICY "Anyone can verify OTP by email" ON otp_codes
    FOR SELECT USING (true);

-- Allow updates for verification
CREATE POLICY "Anyone can verify OTP" ON otp_codes
    FOR UPDATE USING (true);

-- Allow deletion of OTP codes
CREATE POLICY "Anyone can delete OTP" ON otp_codes
    FOR DELETE USING (true);

-- ============================================
-- 2. UPDATE USER_PROFILES FOR EMAIL VERIFICATION
-- ============================================

-- Add email_verified column to track verification status
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- ============================================
-- 3. CLEANUP FUNCTION FOR EXPIRED OTPs
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. INSERT POLICY FOR USER_PROFILES
-- Allows new users to create their profile during signup
-- ============================================

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- OTP AUTHENTICATION MIGRATION COMPLETE
-- ============================================
-- Allow authenticated users to insert organizations
CREATE POLICY "Authenticated users can create organizations" ON organizations
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert focus areas
CREATE POLICY "Authenticated users can create focus areas" ON organization_focus_areas
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_step TEXT 
DEFAULT 'personal_info' 
CHECK (onboarding_step IN ('personal_info', 'role_selection', 'org_form', 'complete'));
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS incubator_type TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stages_accepted TEXT[];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS org_types_supported TEXT[];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS support_offered TEXT[];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS program_intake_type TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS program_duration TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS selection_criteria TEXT[];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS takes_equity BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS equity_range TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS has_program_fee BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS platform_expectations TEXT[];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_person_role TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS csr_focus_areas TEXT[];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS geography_preference TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS preferred_states TEXT[];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS compliance_requirements TEXT[];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS engagement_types TEXT[];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS requires_past_experience BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS csr_platform_expectations TEXT[];