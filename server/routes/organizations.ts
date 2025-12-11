import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { SearchResult, SearchParams } from "@shared/api";
import { mockOrganizations } from "../data/organizations";

/**
 * Helper function to load organizations from TypeScript data source
 * Transforms Organization to SearchResult format (adds alignmentScore)
 * Changes to server/data/organizations.ts are picked up on server restart
 */
function loadOrganizations(): SearchResult[] {
  return mockOrganizations.map((org) => ({
    id: org.id,
    name: org.name,
    type: org.type,
    website: org.website,
    headquarters: org.headquarters,
    region: org.region,
    focusAreas: org.focusAreas,
    mission: org.mission,
    description: org.description,
    verificationStatus: org.verificationStatus,
    projects: org.projects,
    fundingType: org.fundingType,
    targetBeneficiaries: org.targetBeneficiaries,
    partnerHistory: org.partnerHistory,
    confidence: org.confidence,
    alignmentScore: org.confidence || 75,
  }));
}

/**
 * GET /api/organizations
 * Returns all organizations from the JSON data file
 */
export const handleGetOrganizations: RequestHandler = (_req, res) => {
  try {
    const organizations = loadOrganizations();
    res.json({
      organizations,
      total: organizations.length,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
};

/**
 * GET /api/organizations/search
 * Filters organizations based on query parameters
 * Query params:
 *   - q: search term (name, mission, description)
 *   - focusArea: single focus area to filter by
 *   - region: single region to filter by
 *   - fundingType: funding type to filter by
 *   - verificationStatus: verification status to filter by
 *   - sortBy: sort by 'alignment' | 'name' | 'recency' (default: alignment)
 */
export const handleSearchOrganizations: RequestHandler = (req, res) => {
  try {
    const params: SearchParams = {
      query: (req.query.q as string) || "",
      focusArea: (req.query.focusArea as string) || "",
      region: (req.query.region as string) || "",
      fundingType: (req.query.fundingType as string) || "",
      verificationStatus: (req.query.verificationStatus as string) || "",
      sortBy: (req.query.sortBy as "alignment" | "recency" | "name") || "alignment",
    };

    const organizations = loadOrganizations();
    let filtered = [...organizations];

    // Filter by search query (name, mission, description, focusAreas)
    if (params.query) {
      const q = params.query.toLowerCase();
      filtered = filtered.filter((org) => {
        const matchesName = org.name.toLowerCase().includes(q);
        const matchesMission = org.mission?.toLowerCase().includes(q) || false;
        const matchesDescription = org.description?.toLowerCase().includes(q) || false;
        const matchesFocusArea = (org.focusAreas || []).some((area) =>
          area.toLowerCase().includes(q)
        );
        return matchesName || matchesMission || matchesDescription || matchesFocusArea;
      });
    }

    // Filter by focus area
    if (params.focusArea) {
      filtered = filtered.filter((org) =>
        (org.focusAreas || []).includes(params.focusArea!)
      );
    }

    // Filter by region
    if (params.region) {
      filtered = filtered.filter((org) => org.region === params.region);
    }

    // Filter by funding type
    if (params.fundingType) {
      filtered = filtered.filter((org) => org.fundingType === params.fundingType);
    }

    // Filter by verification status
    if (params.verificationStatus) {
      filtered = filtered.filter((org) => org.verificationStatus === params.verificationStatus);
    }

    // Extract filter options
    const allOrganizations = loadOrganizations();
    const focusAreas = Array.from(
      new Set(allOrganizations.flatMap((org) => org.focusAreas || []))
    ).sort();
    const regions = Array.from(
      new Set(allOrganizations.map((org) => org.region).filter(Boolean))
    ).sort();

    // Sort results
    if (params.sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (params.sortBy === "recency") {
      // Keep insertion order (recency not tracked in current data structure)
    } else {
      // Sort by alignment score (default)
      filtered.sort((a, b) => (b.alignmentScore || 0) - (a.alignmentScore || 0));
    }

    // Return response in format expected by Search.tsx
    res.json({
      success: true,
      results: filtered,
      total: filtered.length,
      focusAreas,
      regions,
    });
  } catch (error) {
    console.error("Error searching organizations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search organizations"
    });
  }
};

/**
 * GET /api/organizations/filters/focus-areas
 * Returns distinct focus areas from all organizations
 */
export const handleGetFocusAreas: RequestHandler = (_req, res) => {
  try {
    const organizations = loadOrganizations();
    const focusAreas = Array.from(
      new Set(organizations.flatMap((org) => org.focusAreas || []))
    ).sort();

    res.json({ focusAreas });
  } catch (error) {
    console.error("Error fetching focus areas:", error);
    res.status(500).json({ error: "Failed to fetch focus areas" });
  }
};

/**
 * GET /api/organizations/filters/regions
 * Returns distinct regions from all organizations
 */
export const handleGetRegions: RequestHandler = (_req, res) => {
  try {
    const organizations = loadOrganizations();
    const regions = Array.from(
      new Set(organizations.map((org) => org.region).filter(Boolean))
    ).sort();

    res.json({ regions });
  } catch (error) {
    console.error("Error fetching regions:", error);
    res.status(500).json({ error: "Failed to fetch regions" });
  }
};

/**
 * GET /api/organizations/:id
 * Returns a single organization by ID
 */
export const handleGetOrganizationById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const organizations = loadOrganizations();
    const org = organizations.find((o) => o.id === id);

    if (!org) {
      res.status(404).json({ error: "Organization not found" });
      return;
    }

    res.json(org);
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ error: "Failed to fetch organization" });
  }
};

/**
 * POST /api/organizations/submit
 * Append a new organization to client/data/organizations.json (temporary for MVP)
 */
export const handleSubmitOrganizationToJson: RequestHandler = (req, res) => {
  try {
    const payload = req.body as any;
    if (!payload || !payload.name) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const filePath = path.join(process.cwd(), "client", "data", "organizations.json");
    const fileData = fs.readFileSync(filePath, "utf8");
    const organizations = JSON.parse(fileData) as any[];

    const newOrg = {
      id: `org-${Date.now()}`,
      name: payload.name,
      focusAreas: payload.focusAreas || [],
      region: payload.region || "",
      website: payload.website || "",
      description: payload.description || "",
      alignmentScore: payload.alignmentScore || 50,
    };

    organizations.push(newOrg);
    fs.writeFileSync(filePath, JSON.stringify(organizations, null, 2), "utf8");

    res.status(201).json(newOrg);
  } catch (error) {
    console.error("Error appending organization:", error);
    res.status(500).json({ error: "Failed to append organization" });
  }
};
