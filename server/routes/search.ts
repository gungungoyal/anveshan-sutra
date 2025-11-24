import { RequestHandler } from "express";
import { SearchParams, SearchResponse, SearchResult } from "@shared/api";
import { mockOrganizations } from "../data/organizations";

function calculateAlignmentScore(
  orgIndex: number,
  params: SearchParams,
): number {
  const org = mockOrganizations[orgIndex];
  let score = 50; // Base score

  // Focus area match
  if (params.focusArea) {
    const areaMatch = org.focusAreas.some(
      (area) => area.toLowerCase() === params.focusArea?.toLowerCase(),
    );
    if (areaMatch) score += 20;
  }

  // Region match
  if (params.region) {
    const regionMatch = org.region
      .toLowerCase()
      .includes(params.region.toLowerCase());
    if (regionMatch) score += 15;
  }

  // Funding type match
  if (params.fundingType) {
    if (org.fundingType === params.fundingType) score += 10;
  }

  // Verification boost
  if (org.verificationStatus === "verified") score += 5;

  // Confidence boost
  score = score * (org.confidence / 100);

  return Math.min(100, Math.max(0, Math.round(score)));
}

export const handleSearch: RequestHandler = (req, res) => {
  try {
    const params: SearchParams = {
      query: (req.query.query as string) || "",
      focusArea: (req.query.focusArea as string) || "",
      region: (req.query.region as string) || "",
      fundingType: (req.query.fundingType as string) || "",
      verificationStatus: (req.query.verificationStatus as string) || "",
      sortBy:
        (req.query.sortBy as "alignment" | "recency" | "confidence" | "name") ||
        "alignment",
    };

    // Filter organizations
    let results = mockOrganizations.filter((org, index) => {
      // Query filter (name, mission, description)
      if (params.query) {
        const query = params.query.toLowerCase();
        const matchesQuery =
          org.name.toLowerCase().includes(query) ||
          org.mission.toLowerCase().includes(query) ||
          org.description.toLowerCase().includes(query) ||
          org.focusAreas.some((area) => area.toLowerCase().includes(query));

        if (!matchesQuery) return false;
      }

      // Focus area filter
      if (params.focusArea) {
        const hasArea = org.focusAreas.some(
          (area) => area.toLowerCase() === params.focusArea?.toLowerCase(),
        );
        if (!hasArea) return false;
      }

      // Region filter
      if (params.region) {
        const regionMatch = org.region
          .toLowerCase()
          .includes(params.region.toLowerCase());
        if (!regionMatch) return false;
      }

      // Funding type filter
      if (params.fundingType) {
        if (org.fundingType !== params.fundingType) return false;
      }

      // Verification status filter
      if (params.verificationStatus) {
        if (org.verificationStatus !== params.verificationStatus) return false;
      }

      return true;
    });

    // Map to search results with alignment scores
    let searchResults: SearchResult[] = results.map((org, index) => ({
      ...org,
      alignmentScore: calculateAlignmentScore(
        mockOrganizations.indexOf(org),
        params,
      ),
    }));

    // Sort results
    switch (params.sortBy) {
      case "alignment":
        searchResults.sort((a, b) => b.alignmentScore - a.alignmentScore);
        break;
      case "confidence":
        searchResults.sort((a, b) => b.confidence - a.confidence);
        break;
      case "name":
        searchResults.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recency":
      default:
        // Assume later organizations are more recent
        break;
    }

    const response: SearchResponse = {
      organizations: searchResults,
      total: searchResults.length,
    };

    res.json(response);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Failed to search organizations" });
  }
};

export const handleGetOrganization: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const org = mockOrganizations.find((o) => o.id === id);

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Calculate alignment score with empty params (baseline)
    const alignmentScore = calculateAlignmentScore(
      mockOrganizations.indexOf(org),
      {},
    );

    const result: SearchResult = {
      ...org,
      alignmentScore,
    };

    res.json(result);
  } catch (error) {
    console.error("Get organization error:", error);
    res.status(500).json({ error: "Failed to fetch organization" });
  }
};
