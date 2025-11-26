import { Request, Response } from "express";
import { mockOrganizations } from "../data/organizations";
import { calculateAlignmentScore, calculatePreferenceAlignment } from "../lib/alignment";
import { MatchResult, Organization } from "@shared/api";

// Mock storage for matches
const matchesStore: Map<string, MatchResult[]> = new Map();

/**
 * GET /api/matches/recommendations
 * Get AI-recommended matches for a given organization
 */
export async function handleGetMatches(req: Request, res: Response) {
  try {
    const { org_id, limit = 10, offset = 0 } = req.query;

    if (!org_id || typeof org_id !== "string") {
      return res.status(400).json({ error: "org_id is required" });
    }

    // Find the organization
    const sourceOrg = mockOrganizations.find((o) => o.id === org_id);
    if (!sourceOrg) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Calculate alignment scores for all other organizations
    const matches: MatchResult[] = mockOrganizations
      .filter((org) => org.id !== org_id)
      .map((org) => {
        const { score, reason } = calculateAlignmentScore(sourceOrg, org);
        return {
          ...org,
          alignment_score: score,
          match_reason: reason,
        };
      })
      .sort((a, b) => b.alignment_score - a.alignment_score)
      .slice(
        Number(offset),
        Number(offset) + Number(limit)
      );

    // Total count
    const total = mockOrganizations.length - 1;

    return res.json({
      organizations: matches,
      total,
    });
  } catch (error) {
    console.error("Error getting matches:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/matches/:org_a_id/:org_b_id/exclude
 * Mark a match as excluded
 */
export async function handleExcludeMatch(req: Request, res: Response) {
  try {
    const { org_a_id, org_b_id } = req.params;

    // In a real app, this would be stored in database
    // For now, just return success
    const cacheKey = `exclude_${org_a_id}_${org_b_id}`;
    matchesStore.set(cacheKey, []);

    return res.json({
      success: true,
      message: "Organization excluded from recommendations",
    });
  } catch (error) {
    console.error("Error excluding match:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/focus-areas
 * Get all available focus areas for filtering
 */
export async function handleGetFocusAreas(req: Request, res: Response) {
  try {
    // Get all unique focus areas from organizations
    const focusAreas = new Set<string>();
    mockOrganizations.forEach((org) => {
      org.focusAreas.forEach((fa) => focusAreas.add(fa));
    });

    return res.json({
      focus_areas: Array.from(focusAreas),
    });
  } catch (error) {
    console.error("Error getting focus areas:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/regions
 * Get all available regions for filtering
 */
export async function handleGetRegions(req: Request, res: Response) {
  try {
    const regions = new Set<string>();
    mockOrganizations.forEach((org) => {
      regions.add(org.region);
    });

    return res.json({
      regions: Array.from(regions),
    });
  } catch (error) {
    console.error("Error getting regions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
