/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

export interface DemoResponse {
  message: string;
}

// ==================== NEW DRIVYA.AI TYPES ====================

// Focus Areas (Controlled Taxonomy)
export interface FocusArea {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// User Types
export interface UserPreferences {
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  newsletter: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "ngo" | "funder";
  profile_complete: boolean;
  verified: boolean;
  phone?: string;
  avatar_url?: string;
  organization_name?: string;
  organization_id?: string;
  organization_type?: string;
  bio?: string;
  preferences?: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  role: "ngo" | "funder";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Organization Types
export interface DrivyaOrganization {
  id: string;
  user_id: string;
  name: string;
  type: "NGO" | "CSR" | "Foundation" | "Social Enterprise" | "Donor";
  description: string;
  mission: string;
  vision: string;
  founded_year?: number;
  headquarters: string;
  website?: string;
  focus_area_ids: string[];
  regions: string[];
  international_partnerships?: string;
  document_urls?: string[];
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationRequest {
  name: string;
  type: "NGO" | "CSR" | "Foundation" | "Social Enterprise" | "Donor";
  description: string;
  mission: string;
  vision: string;
  headquarters: string;
  website?: string;
  focus_area_ids: string[];
  regions: string[];
  international_partnerships?: string;
  document_urls?: string[];
}

// Match Types
export interface Match {
  id: string;
  organization_a_id: string;
  organization_b_id: string;
  alignment_score: number;
  match_reason: string;
  status: "pending" | "accepted" | "rejected" | "shortlisted" | "excluded";
  user_action?: "shortlist" | "exclude" | "contacted";
  created_at: string;
  updated_at: string;
}

export interface SearchWithFiltersRequest {
  query?: string;
  focus_areas?: string[];
  regions?: string[];
  org_type?: string;
  sort_by?: "alignment" | "name" | "recent";
  limit?: number;
  offset?: number;
}

export interface MatchResult extends DrivyaOrganization {
  alignment_score: number;
  match_reason: string;
}

// Keep both SearchResponse interfaces - one for new API, one for legacy
export interface SearchResponse {
  organizations: SearchResult[];
  total: number;
}

// Shortlist Types
export interface ShortlistItem {
  id: string;
  user_id: string;
  organization_id: string;
  notes?: string;
  created_at: string;
}

// ==================== OLD TYPES (KEPT FOR BACKWARD COMPATIBILITY) ====================

export interface SubmitOrganizationRequest {
  name: string;
  type: "NGO" | "Foundation" | "Incubator" | "CSR" | "Social Enterprise";
  website?: string;
  headquarters: string;
  region: string;
  focusAreas: string[];
  mission: string;
  description: string;
  fundingType?: "grant" | "provider" | "recipient" | "mixed";
  targetBeneficiaries?: string[];
  partnerHistory?: string[];
  projects?: {
    title: string;
    year: number;
    description: string;
  }[];
}

export interface SubmitOrganizationResponse extends SearchResult {
  id: string;
}

export interface Organization {
  id: string;
  name: string;
  type: "NGO" | "Foundation" | "Incubator" | "CSR" | "Social Enterprise";
  website: string;
  headquarters: string;
  region: string;
  focusAreas: string[];
  mission: string;
  description: string;
  verificationStatus: "unverified" | "pending" | "verified";
  projects: {
    title: string;
    year: number;
    description: string;
  }[];
  fundingType: "grant" | "provider" | "recipient" | "mixed";
  targetBeneficiaries: string[];
  partnerHistory: string[];
  confidence: number;
}

export interface SearchParams {
  query?: string;
  focusArea?: string;
  region?: string;
  fundingType?: string;
  verificationStatus?: string;
  sortBy?: "alignment" | "recency" | "confidence" | "name";
}

export interface SearchResult extends Organization {
  alignmentScore: number;
}
