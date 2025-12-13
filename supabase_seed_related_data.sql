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
