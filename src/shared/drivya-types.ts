/**
 * DRIVYA.AI - Shared TypeScript Types
 * Used across both client & server
 */

// ============================================
// ORGANIZATION & MATCHING TYPES
// ============================================

export type OrganizationType =
  | "NGO"
  | "CSR"
  | "INCUBATOR"
  | "FOUNDATION"
  | "CONSULTANCY"
  | "GOVERNMENT";

export interface DrivyaOrganization {
  id: string;
  name: string;
  slug: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  type: OrganizationType;
  registrationNumber?: string;
  incorporationYear?: number;
  teamSize?: number;
  headquartersCity?: string;
  headquartersState?: string;
  headquartersCountry?: string;
  profileSummary?: string;
  profileScraped: boolean;
  lastScrapedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations loaded conditionally
  focusAreas?: FocusAreaAssociation[];
  contactPoints?: ContactPoint[];
  ngoData?: NGODataResponse;
  csrData?: CSRDataResponse;
  incubatorData?: IncubatorDataResponse;
  verificationData?: VerificationDataResponse;
}

export interface SearchOrganizationResponse extends DrivyaOrganization {
  fitScore?: number;
  fitScoreLevel?: "EXCELLENT" | "GOOD" | "MODERATE" | "POOR";
}

// ============================================
// FOCUS AREAS
// ============================================

export interface FocusArea {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder?: number;
}

export interface FocusAreaAssociation {
  id: string;
  focusAreaId: string;
  organizationId: string;
  isPrimary: boolean;
  yearsOfExperience?: number;
  focusArea?: FocusArea;
}

// EXACT FOCUS AREAS FROM SPECIFICATION
export const DRIVYA_FOCUS_AREAS = [
  "Education & STEM",
  "School Education",
  "Digital Education",
  "STEM / Robotics",
  "Scholarships",
  "Teacher Training",
  "Adult Literacy",
  "Skill Development & Livelihood",
  "Vocational Training",
  "Entrepreneurship Support",
  "Self-Employment",
  "Rural Livelihood",
  "Urban Livelihood",
  "Health & Nutrition",
  "Preventive Healthcare",
  "Maternal & Child Health",
  "Sanitation & Hygiene",
  "Nutrition Programs",
  "Medical Camps",
  "Women Empowerment",
  "Women Skilling",
  "Women Safety & Rights",
  "Financial Inclusion (Women)",
  "Leadership Development (Women)",
  "Environment & Sustainability",
  "Waste Management",
  "Water Conservation",
  "Renewable Energy",
  "Energy Efficiency",
  "Climate Action",
  "Urban Green Spaces",
  "Agriculture & Rural Development",
  "Farmer Training",
  "Agri-Tech",
  "Supply Chain Improvement",
  "Irrigation Support",
  "Animal Husbandry",
  "Community Development",
  "Village Development",
  "Infrastructure Support",
  "Slum Development",
  "Migrant Support",
  "Disaster Relief",
  "Public Utilities",
  "Innovation, Research & Technology",
  "Innovation Labs",
  "Incubation Support",
  "R&D Projects",
  "Social Innovation",
  "Startup & Entrepreneurship Programs",
  "Digital Transformation",
  "Differently-Abled Support",
  "Assistive Devices",
  "Special Education",
  "Accessibility Initiatives",
  "Youth Development & Sports",
  "Sports Training",
  "Sports Infrastructure",
  "Youth Leadership Programs",
  "Volunteering Programs",
  "Arts, Culture & Heritage",
  "Cultural Preservation",
  "Museums & Heritage",
  "Cultural Programs",
  "Governance, Policy & Civic Engagement",
  "Good Governance",
  "Digital Governance",
  "Transparency Initiatives",
  "Citizen Engagement Platforms",
  "RTI Awareness",
] as const;

// ============================================
// ORGANIZATION EXTENSIONS
// ============================================

export interface NGODataResponse {
  id: string;
  organizationId: string;
  registrar_12a?: string;
  registrar_80g?: string;
  fcra_number?: string;
  fcra_validity_till?: string;
  audited_reports_url?: string;
  annual_revenue?: number;
  beneficiaries?: number;
  programs?: string[]; // JSON array
  createdAt: string;
  updatedAt: string;
}

export interface CSRDataResponse {
  id: string;
  organizationId: string;
  csr_budget_annual?: number;
  csr_budget_year?: number;
  csr_budget_link?: string;
  focus_areas?: string[]; // JSON array of focus area IDs
  past_partners?: string[]; // JSON array of org IDs
  createdAt: string;
  updatedAt: string;
}

export interface IncubatorDataResponse {
  id: string;
  organizationId: string;
  focus_sectors?: string[]; // JSON array
  portfolio_size?: number;
  portfolio_exits?: number;
  funding_provided?: number;
  website_link?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// VERIFICATION & COMPLIANCE
// ============================================

export type VerificationStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

export interface VerificationDataResponse {
  id: string;
  organizationId: string;
  status: VerificationStatus;
  has_12a?: boolean;
  has_80g?: boolean;
  has_fcra?: boolean;
  is_csr_eligible?: boolean;
  is_registered?: boolean;
  incorporation_year?: number;
  years_active?: number;
  team_size?: number;
  audited_reports?: boolean;
  niti_aayog?: boolean;
  guidestar?: boolean;
  credibility_score?: number;
  verificationNotes?: string;
  lastVerifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationBadgeData {
  verified: boolean;
  level: "HIGH" | "MEDIUM" | "LOW";
  has_12a: boolean;
  has_80g: boolean;
  has_fcra: boolean;
  credibility_score: number;
  reasons: string[];
}

// ============================================
// FIT SCORE & MATCHING
// ============================================

export type FitScoreLevel = "EXCELLENT" | "GOOD" | "MODERATE" | "POOR";

export interface FitScore {
  id: string;
  organizationId1: string;
  organizationId2: string;
  overallScore: number; // 0-100
  focusAreaMatch: number;
  geographyMatch: number;
  complianceMatch: number;
  pastCollabMatch: number;
  level: FitScoreLevel;
  details?: {
    focusAreaMatches?: string[];
    geographyReasons?: string[];
    complianceNotes?: string;
    pastCollabNotes?: string;
  };
  calculatedAt: string;
  expiresAt: string;
}

// ============================================
// CONTACT POINTS
// ============================================

export interface ContactPoint {
  id: string;
  organizationId: string;
  name: string;
  title?: string;
  email?: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SAVED LISTS & NOTES (CRM)
// ============================================

export interface SavedListResponse {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  isPublic: boolean;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedListItemResponse {
  id: string;
  savedListId: string;
  organizationId: string;
  notes?: string;
  addedAt: string;
  organization?: DrivyaOrganization;
}

export interface NotesResponse {
  id: string;
  workspaceId: string;
  userId: string;
  organizationId: string;
  title?: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PROPOSALS & OUTREACH
// ============================================

export interface ProposalResponse {
  id: string;
  workspaceId: string;
  userId: string;
  ngoId: string;
  csrId: string;
  status: "draft" | "sent" | "opened" | "responded" | "accepted" | "rejected";
  subject?: string;
  emailBody?: string;
  proposalContent?: string;
  fitScoreAt?: string;
  sentAt?: string;
  openedAt?: string;
  respondedAt?: string;
  customizations?: unknown; // JSON
  attachments?: string[]; // File URLs
  createdAt: string;
  updatedAt: string;
  
  // Relations
  ngo?: DrivyaOrganization;
  csr?: DrivyaOrganization;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface SearchOrgsRequest {
  query?: string;
  type?: OrganizationType[];
  focusAreas?: string[];
  cities?: string[];
  states?: string[];
  sortBy?: "relevance" | "name" | "verified" | "recent";
  limit?: number;
  offset?: number;
  matchWith?: string; // Organization ID to match against
}

export interface SearchOrgsResponse {
  data: SearchOrganizationResponse[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetOrgDetailsResponse {
  organization: DrivyaOrganization;
  relatedOrganizations?: DrivyaOrganization[];
  matchingCandidates?: Array<DrivyaOrganization & { fitScore?: number }>;
}

export interface CreateProposalRequest {
  ngoId: string;
  csrId: string;
  workspaceId: string;
  customizations?: {
    subject?: string;
    emailBodyCustom?: string;
    proposalCustom?: string;
  };
}

export interface SaveToListRequest {
  listId: string;
  organizationId: string;
  notes?: string;
}

export interface CreateNoteRequest {
  organizationId: string;
  workspaceId: string;
  title?: string;
  content: string;
  isPinned?: boolean;
}

export interface FocusAreasResponse {
  data: FocusArea[];
  total: number;
}

// ============================================
// WORKSPACE & USER TYPES
// ============================================

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface WorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  role?: WorkspaceRole;
}

export interface UserResponse {
  id: string;
  email: string;
  name?: string;
  profileImage?: string;
  bio?: string;
  createdAt: string;
}

// ============================================
// ERROR HANDLING
// ============================================

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// ============================================
// PAGINATION
// ============================================

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
