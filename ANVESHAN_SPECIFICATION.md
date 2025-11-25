# ANVESHAN - Complete Platform Specification

**A Two-Sided Marketplace Connecting NGOs with Funders**

---

## Table of Contents
1. Platform Overview
2. User Roles & Journeys
3. Core Features
4. Database Schema
5. Technical Architecture
6. Pages & Components
7. API Endpoints
8. Design System
9. End-to-End Workflows
10. Success Metrics

---

## 1. Platform Overview

### What is ANVESHAN?

ANVESHAN is an **AI-powered matching platform** that connects:
- **NGOs** (organizations seeking funding and partnerships) 
- **Funders** (CSRs, foundations, donors seeking impact opportunities)

**Core Value Propositions:**
1. **Smart Matching** - AI-based alignment scoring (0-100) based on focus areas, regions, mission fit
2. **Auto Summaries** - One-click organization summaries (zero writing needed)
3. **PPT Generation** - Auto-create professional presentations for outreach
4. **Verified Profiles** - All organizations verified for credibility

### Design Philosophy

- **Zero Jargon** - Simple, clear language for non-technical users
- **Mobile-First** - Works perfectly on phone, tablet, desktop
- **Fast Onboarding** - Complete profile in < 2 minutes
- **Trust-Focused** - Verified badges, real websites, clear sources

### Color Palette

```
#1A1A1D  - Deep Dark (backgrounds, text)
#3B1C32  - Dark Purple (accents, borders)
#6A1E55  - Purple (primary buttons, key actions)
#A64D79  - Light Purple (secondary actions, hover states)
```

---

## 2. User Roles & Core Journeys

### Role 1: NGO User

**Who:** Organizations seeking funding, partnerships, and collaboration opportunities

**Key Actions:**
- Create organization profile (mission, vision, focus areas, regions)
- Search funders with filters
- View AI-ranked matching funders
- Shortlist funders
- Generate PPT for outreach
- Contact funders externally

**Success Outcome:** NGO finds relevant funder and reaches out

---

### Role 2: Funder User

**Who:** CSRs, foundations, grants bodies, donors seeking NGOs to partner with

**Key Actions:**
- Create organization profile (mission, focus areas, geographic interest, budget range)
- Search NGOs with filters
- View AI-ranked matching NGOs
- Shortlist NGOs
- Generate PPT for initial contact
- Contact NGOs externally

**Success Outcome:** Funder finds suitable NGO partner and initiates engagement

---

## 3. Core Features

### Feature 1: Organization Profile Creation

**Multi-Step Form** (Auto-save enabled)

#### Step 1 - Basic Information
```
- Organization Name (required)
- Organization Type (select: NGO | CSR | Foundation | Social Enterprise | Donor)
- Headquarters (City + Country)
- Website URL (optional)
```

#### Step 2 - Organization Details
```
- Mission Statement (required, 100+ characters)
- Vision Statement (required)
- Focus Areas (multi-select from controlled list) (required, min 1)
- Regions of Operation (multi-select) (required)
- International Partnerships (optional text)
```

#### Step 3 - Verification Documents
```
- Registration Certificate (URL or file upload)
- Annual Report (URL or file upload)
- Legal Documents (URL or file upload)
```

#### Step 4 - Review & Confirm
```
- Show summary of all information
- Checkbox: "I confirm this information is accurate"
- Submit button
```

**Funder-Specific Fields** (Additional for funder role):
```
- Grant Budget Range (optional)
- Maximum Grant Size (optional)
- Preferred NGO Types (multi-select)
- Minimum Years in Operation (optional)
```

---

### Feature 2: Search & Filtering

**Search Interface Layout:**
```
┌─────────────────────────────┬────────────────────────────────────┐
│      FILTER SIDEBAR         │       RESULTS GRID                 │
│ (Sticky on desktop)         │  (Responsive: 1-3 columns)         │
│                             │                                    │
│ Focus Areas (multi-select)  │  Organization Card:                │
│ ✓ Education                 │  ┌─────────────────────────────┐  │
│ ✓ Health                    │  │ Logo/Avatar                 │  │
│ □ Environment               │  │ Name                        │  │
│ □ Technology                │  │ Type • Region               │  │
│                             │  │ Focus Areas (tags)          │  │
│ Region (multi-select)       │  │ Alignment Score: 85/100 🎯   │  │
│ ✓ Northern India            │  │ [View] [Shortlist] [Exclude]│  │
│ □ Southern India            │  └─────────────────────────────┘  │
│                             │                                    │
│ Organization Type           │  Organization Card:                │
│ (multi-select)              │  ┌─────────────────────────────┐  │
│ ✓ NGO                       │  │ ...                         │  │
│ □ Foundation                │  └─────────────────────────────┘  │
│                             │                                    │
│ [APPLY FILTERS]             │  Organization Card:                │
│ [RESET]                     │  ┌─────────────────────────────┐  │
│                             │  │ ...                         │  │
└────────────────────────────���┴────────────────────────────────────┘
```

**Filters:**
- Focus Areas (multi-select, searchable)
- Geographic Regions (multi-select)
- Organization Type (multi-select)
- Years in Operation (for funders searching NGOs)
- Budget Range (for NGOs searching funders)

**Sorting:**
- By Alignment Score (default)
- By Name (A-Z)
- By Recently Added

---

### Feature 3: AI Alignment Scoring

**What is the Alignment Score?**

A number from 0-100 showing "how well you match."

**Scoring Algorithm:**

```
Base Score: 50

Factor 1: Focus Area Match (+0 to +30)
  - 0 overlap: 0 points
  - 1 area overlap: 10 points
  - 2-3 areas overlap: 20 points
  - 4+ areas overlap: 30 points

Factor 2: Region Match (+0 to +15)
  - Same region: 15 points
  - Nearby region: 5 points
  - No region match: 0 points

Factor 3: Type Compatibility (+0 to +5)
  - Compatible types: 5 points
  - Uncommon pairing: 0 points

FINAL SCORE = Base + Focus_Bonus + Region_Bonus + Type_Bonus
Range: 0 to 100

Examples:
- No overlap: 50-60 (low match)
- Some overlap: 65-75 (moderate match)
- Strong overlap: 80-95 (excellent match)
```

**Why is matching important?**
- Saves time searching manually
- Finds relevant partners faster
- Increases likelihood of successful partnerships

---

### Feature 4: Organization Summary Page

**What users see when they click on a result:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Organization Name                              [✓ Verified]    │
│  Type • Headquarters                                             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Alignment Score:                                               │
│  ████████░░░░░░░░░░  85/100                                    │
│  "Why this match? Focus area overlap + same region"             │
│                                                                 │
├─────────────────────────────���───────────────────────────────────┤
│                                                                 │
│  MISSION                                                        │
│  [Mission text - 2-3 sentences]                                 │
│                                                                 │
│  VISION                                                         │
│  [Vision text - 2-3 sentences]                                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FOCUS AREAS                                                    │
│  [Tag] [Tag] [Tag]                                              │
│                                                                 │
│  REGIONS                                                        │
│  [Region] [Region]                                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  KNOWN PARTNERS                                                 │
│  UNICEF • Global Fund • XYZ Foundation                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [SHORTLIST]  [GENERATE PPT]  [VISIT WEBSITE]  [EXCLUDE]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Page Layout:**
- Organization header with verified badge
- Large alignment score with explanation
- Mission & vision section
- Focus areas and regions
- Known partners
- Call-to-action buttons

---

### Feature 5: PPT Generation (UI-Only)

**What it does:** Auto-generates presentation slides in the browser (no file download for MVP)

**Presentation Structure:**

**Slide 1: Title Slide**
```
[Organization Name]

[Type]
[Mission - one line]
```

**Slide 2: Mission & Vision**
```
MISSION
[Full mission statement]

VISION
[Full vision statement]
```

**Slide 3: What We Do**
```
Focus Areas:
[Icon + Focus Area]
[Icon + Focus Area]
[Icon + Focus Area]
```

**Slide 4: Where We Work**
```
Geographic Presence:
[Region 1]
[Region 2]
[Region 3]
```

**Slide 5: Our Impact**
```
[Years in Operation] Years Active
[Number] Beneficiaries Served
[Number] Projects Completed
[Number] Partners Engaged
```

**Slide 6: Who We Work With**
```
Known Partners:
[Logo/Name] [Logo/Name] [Logo/Name]
```

**Slide 7: Why This Match?**
```
ALIGNMENT SCORE: 85/100

Why we matched:
✓ Focus area overlap
✓ Same geographic region
✓ Complementary mission

[Visual: Large score ring]
```

**Slide 8: Get in Touch**
```
Website: [Clickable Link]

Learn more about our work at [website]
```

**User Actions on PPT:**
- View full-screen
- Copy slide text
- Navigate slides
- Download as PDF (future feature)

---

### Feature 6: Shortlist & Saved Organizations

**Shortlist Feature:**
- Users can shortlist (bookmark) organizations
- View all shortlisted items in dedicated page
- Add notes to shortlisted items
- Remove from shortlist
- Generate PPT for shortlisted organizations

**Shortlist Page Layout:**
```
┌─────────────────────────────┐
│ MY SHORTLIST                │
│ (5 organizations saved)     │
├─────────────────────────────┤
│                             │
│ Organization Card 1         │
│ [View] [Remove] [PPT]      │
│                             │
│ Organization Card 2         │
│ [View] [Remove] [PPT]      │
│                             │
│ [Show more...]              │
│                             │
└─────────────────────────────┘
```

---

### Feature 7: Dashboard

**NGO Dashboard:**
```
Welcome, [Organization Name]!

MY ORGANIZATION
- [View Profile] [Edit Profile]

QUICK ACTIONS
- [Search Funders] [My Shortlist] [Recommendations]

MATCHED FUNDERS
AI-recommended funders for you:
[Card] [Card] [Card]

RECENT ACTIVITY
- Shortlisted XYZ Foundation
- Viewed ABC CSR
```

**Funder Dashboard:**
```
Welcome, [Organization Name]!

MY ORGANIZATION
- [View Profile] [Edit Profile]

QUICK ACTIONS
- [Search NGOs] [My Shortlist] [Recommendations]

MATCHED NGOs
AI-recommended NGOs for you:
[Card] [Card] [Card]

RECENT ACTIVITY
- Shortlisted XYZ NGO
- Viewed ABC Education Organization
```

---

## 4. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  role ENUM('ngo', 'funder') NOT NULL,
  profile_complete BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Organizations Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  type ENUM('NGO', 'CSR', 'Foundation', 'Social Enterprise', 'Donor') NOT NULL,
  description TEXT,
  mission TEXT,
  vision TEXT,
  founded_year INT,
  headquarters VARCHAR,
  website VARCHAR,
  focus_area_ids UUID[] REFERENCES focus_areas(id),
  regions VARCHAR[],
  international_partnerships TEXT,
  documents_urls VARCHAR[],
  verified BOOLEAN DEFAULT false,
  alignment_score INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Focus Areas Table
```sql
CREATE TABLE focus_areas (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  icon VARCHAR,
  description TEXT,
  created_at TIMESTAMP
);

-- Pre-populated values:
INSERT INTO focus_areas VALUES
  (uuid(), 'Education', 'book', 'Education and learning'),
  (uuid(), 'Health', 'heart', 'Healthcare and wellness'),
  (uuid(), 'Women Empowerment', 'female', 'Gender equality'),
  (uuid(), 'Technology', 'code', 'Technology and innovation'),
  (uuid(), 'Environment', 'leaf', 'Climate and environment'),
  (uuid(), 'Livelihood', 'briefcase', 'Economic development'),
  (uuid(), 'Governance', 'building', 'Governance and policy'),
  (uuid(), 'Clean Water', 'droplet', 'Water and sanitation'),
  (uuid(), 'Agriculture', 'wheat', 'Agricultural development'),
  (uuid(), 'Disability', 'accessibility', 'Disability rights');
```

### Matches Table
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  organization_a_id UUID REFERENCES organizations(id),
  organization_b_id UUID REFERENCES organizations(id),
  alignment_score INT,
  match_reason TEXT,
  status ENUM('pending', 'accepted', 'rejected', 'shortlisted', 'excluded'),
  user_action ENUM('shortlist', 'exclude', 'contacted') DEFAULT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Shortlist Table
```sql
CREATE TABLE shortlist (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  notes TEXT,
  created_at TIMESTAMP
);
```

---

## 5. Technical Architecture

### Frontend
- React 18 + React Router 6 (SPA)
- TypeScript for type safety
- Tailwind CSS for styling
- Sonner for notifications
- Supabase for auth & database

### Backend
- Express.js (Node.js)
- TypeScript
- Zod for validation
- Supabase SDK for database operations

### Database
- Supabase (PostgreSQL)
- Fake credentials for development

### Authentication
- Email + Password
- Supabase Auth
- Role-based (NGO vs Funder)

---

## 6. Pages & Components

### New Pages to Create

| Page | Route | Purpose |
|------|-------|---------|
| Homepage | `/` | Landing, CTAs for sign up |
| Login/Signup | `/auth/login` | Combined auth page |
| Onboarding | `/auth/onboarding` | Multi-step org profile |
| NGO Dashboard | `/dashboard/ngo` | NGO home |
| Funder Dashboard | `/dashboard/funder` | Funder home |
| Search | `/search` | Search + filter results |
| Organization Profile | `/organization/:id` | Detail view + alignment |
| Shortlist | `/shortlist` | Saved organizations |
| PPT Viewer | `/ppt/:id` | Presentation slides |
| How It Works | `/how-it-works` | Tutorial/info page |

### New Components to Create

| Component | Purpose |
|-----------|---------|
| `SearchFilters.tsx` | Filter sidebar |
| `OrganizationCard.tsx` | Result card in search |
| `AlignmentScore.tsx` | Visual score indicator |
| `PPTSlide.tsx` | Individual slide |
| `FormStep.tsx` | Multi-step form helper |
| `Navigation.tsx` | Main nav bar |
| `FeatureCarousel.tsx` | 4-feature carousel |
| `HeroSection.tsx` | Homepage hero |

---

## 7. API Endpoints

### Authentication
```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Organizations
```
POST   /api/organizations                  - Create org
GET    /api/organizations/:id              - Get one org
PUT    /api/organizations/:id              - Update org
GET    /api/organizations/search           - Search (with filters)
```

### Matches & Recommendations
```
GET    /api/matches/recommendations        - AI-ranked matches
POST   /api/matches/:id/exclude            - Mark as excluded
POST   /api/shortlist                      - Add to shortlist
GET    /api/shortlist                      - Get shortlist
DELETE /api/shortlist/:id                  - Remove from shortlist
```

### Focus Areas
```
GET    /api/focus-areas                    - Get all focus areas
```

---

## 8. Design System

### Colors
```
Background: #1A1A1D (deep dark)
Text: #FFFFFF on dark, #1A1A1D on light
Primary Button: #6A1E55 (purple)
Secondary Button: #A64D79 (light purple)
Borders: #3B1C32 (dark purple)
Success: #22C55E (green)
Error: #EF4444 (red)
```

### Typography
```
H1 (Headlines): Bold, 2.5rem
H2 (Subheadings): Bold, 1.75rem
H3 (Section titles): Bold, 1.25rem
Body: Regular, 1rem
Small: Regular, 0.875rem
Caption: Light, 0.75rem
```

### Spacing
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

### Components Styling
```
Buttons: Rounded corners (8px), min height 44px
Cards: 12px border radius, subtle shadow
Inputs: 8px border radius, clear focus state
Tags: 6px border radius, padding 4px 8px
```

### Responsive Breakpoints
```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px

All components mobile-first
```

---

## 9. End-to-End Workflows

### NGO User Journey

```
1. LANDING
   User visits homepage
   Sees "I'm an NGO" CTA
   ↓

2. SIGN UP
   Click "I'm an NGO"
   Enter email + password
   Verify email (if required)
   ↓

3. ONBOARDING
   Step 1: Organization Name, Type, Headquarters, Website
   Step 2: Mission, Vision, Focus Areas, Regions
   Step 3: Documents (optional)
   Step 4: Review & Confirm
   ↓

4. DASHBOARD
   Lands on NGO Dashboard
   Sees quick action buttons
   ↓

5. SEARCH FUNDERS
   Clicks "Search Funders"
   Applies filters (focus area, region, type)
   Sees AI-ranked results (sorted by alignment score)
   ↓

6. EXPLORE FUNDER
   Clicks on funder card
   Views funder profile + alignment score
   Reads "Why this match?"
   ↓

7. SHORTLIST
   Clicks "Shortlist" button
   Added to shortlist
   ↓

8. GENERATE PPT
   Clicks "Generate PPT"
   Views auto-generated presentation slides
   ↓

9. CONTACT
   Clicks "Visit Website"
   Opens funder website in new tab
   Contacts funder externally
```

### Funder User Journey

```
1. LANDING
   User visits homepage
   Sees "I'm a Funder" CTA
   ↓

2. SIGN UP
   Click "I'm a Funder"
   Enter email + password
   ↓

3. ONBOARDING
   Step 1: Organization Name, Type, Headquarters, Website
   Step 2: Mission, Focus Areas, Regions, Grant Range
   Step 3: Documents
   Step 4: Review & Confirm
   ↓

4. DASHBOARD
   Lands on Funder Dashboard
   ↓

5. SEARCH NGOs
   Clicks "Search NGOs"
   Applies filters (focus area, region, maturity)
   Sees AI-ranked results
   ↓

6. EXPLORE NGO
   Clicks on NGO card
   Views NGO profile + alignment score
   ↓

7. SHORTLIST
   Clicks "Shortlist"
   Added to shortlist
   ↓

8. GENERATE PPT
   Clicks "Generate PPT"
   Auto-generates presentation
   ↓

9. OUTREACH
   Uses PPT + website link
   Contacts NGO externally
```

---

## 10. Success Metrics

### User Adoption
- [ ] 100+ users sign up (50 NGOs, 50 Funders)
- [ ] 80%+ profile completion rate
- [ ] 60%+ of users generate at least 1 PPT

### Feature Usage
- [ ] 70%+ use search filters
- [ ] 50%+ use shortlist feature
- [ ] 40%+ generate PPT

### Quality Metrics
- [ ] Page load time < 2 seconds
- [ ] Mobile responsive on all pages
- [ ] Zero crashes/errors
- [ ] 95%+ alignment score accuracy

### Business Metrics
- [ ] 30%+ of shortlisted matches result in actual partnerships
- [ ] Average partnership discovery time < 1 week
- [ ] User satisfaction score > 4.5/5

---

## 11. Implementation Timeline

### Phase 1: Foundation (Week 1-2)
- Database schema setup
- Authentication (login/signup)
- Onboarding forms

### Phase 2: Core Features (Week 3-4)
- Search & filtering
- AI alignment scoring
- Organization profiles

### Phase 3: Polish (Week 5)
- Shortlist functionality
- PPT generation
- Dashboard

### Phase 4: Styling & Launch (Week 6)
- Apply color palette
- Mobile responsiveness
- Testing & bug fixes
- Launch!

---

## 12. Future Enhancements (Post-MVP)

1. **Email Notifications** - Alert users to new matches
2. **Messaging System** - In-app communication between users
3. **Impact Metrics** - Dashboard showing partnership outcomes
4. **Advanced Filtering** - Budget range, grant size, organizational maturity
5. **PPT Download** - Export as PPTX or PDF
6. **Analytics Dashboard** - See profile views, search trends
7. **Verified Badge System** - Document verification workflow
8. **Admin Panel** - Manage organizations, taxonomy, reports
9. **Mobile App** - Native iOS/Android apps
10. **Integration APIs** - Connect to external grant databases

---

## 13. FAQ for Users

### For NGOs
**Q: Is this free?**
A: Yes, ANVESHAN is completely free for NGOs.

**Q: How does the matching work?**
A: We match you with funders based on focus area overlap, geographic region, and mission alignment. The higher the score, the better the match.

**Q: Can I update my profile later?**
A: Yes, you can edit your profile anytime from your dashboard.

**Q: How do I contact a funder?**
A: View their profile and click "Visit Website" to reach out directly.

### For Funders
**Q: Can I specify criteria for NGOs I want to work with?**
A: Yes, during onboarding you specify focus areas, regions, and organization maturity.

**Q: How do I know an NGO is verified?**
A: Verified NGOs have a [✓] badge on their profile.

**Q: Can I message NGOs through the platform?**
A: For MVP, you contact NGOs directly via their website. In-app messaging coming soon.

---

## End of Specification

This document describes the complete ANVESHAN platform. All decisions prioritize:
1. **Simplicity** - Easy for non-technical NGO workers
2. **Trust** - Verified organizations, clear information
3. **Speed** - Fast onboarding, fast matching
4. **Impact** - Meaningful partnerships formed

Ready to build! 🚀
