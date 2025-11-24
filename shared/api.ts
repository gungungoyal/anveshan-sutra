/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

export interface DemoResponse {
  message: string;
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

export interface SearchResponse {
  organizations: SearchResult[];
  total: number;
}
