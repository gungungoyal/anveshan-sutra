import { Organization } from "@shared/api";

/**
 * Calculate alignment score between two organizations
 * Score ranges from 0-100 based on:
 * - Focus area overlap (0-30 points)
 * - Region match (0-15 points)
 * - Organization type compatibility (0-5 points)
 * - Verification status boost (0-10 points)
 * Base score: 40 points
 */
export function calculateAlignmentScore(
  org1: Organization,
  org2: Organization
): { score: number; reason: string } {
  let score = 40; // Base score

  // Focus Area Overlap (0-30 points)
  const focusOverlap = org1.focusAreas.filter((fa) =>
    org2.focusAreas.includes(fa)
  ).length;

  if (focusOverlap === 0) {
    score += 0;
  } else if (focusOverlap === 1) {
    score += 10;
  } else if (focusOverlap === 2 || focusOverlap === 3) {
    score += 20;
  } else {
    score += 30;
  }

  // Region Match (0-15 points)
  if (org1.region === org2.region) {
    score += 15;
  }

  // Organization Type Compatibility (0-5 points)
  // NGOs and Foundations pair well together
  // Incubators/CSRs pair well with social enterprises or NGOs
  const type1 = org1.type;
  const type2 = org2.type;

  const compatibleTypes = new Set([
    ["NGO", "Foundation"],
    ["NGO", "CSR"],
    ["NGO", "Incubator"],
    ["Foundation", "NGO"],
    ["CSR", "NGO"],
    ["Incubator", "NGO"],
    ["Social Enterprise", "Incubator"],
    ["Social Enterprise", "Foundation"],
  ]);

  const typeKey = [type1, type2].join(",");
  const reverseTypeKey = [type2, type1].join(",");

  if (
    compatibleTypes.has(typeKey as [string, string]) ||
    compatibleTypes.has(reverseTypeKey as [string, string])
  ) {
    score += 5;
  }

  // Verification Status Boost (0-10 points)
  const verificationBoost =
    (org1.verificationStatus === "verified" ? 5 : 0) +
    (org2.verificationStatus === "verified" ? 5 : 0);
  score += Math.min(verificationBoost, 10);

  // Confidence score impact (small adjustment)
  const minConfidence = Math.min(org1.confidence, org2.confidence);
  if (minConfidence < 70) {
    score = Math.max(score - 5, 0);
  }

  // Ensure score is between 0 and 100
  score = Math.min(Math.max(score, 0), 100);

  // Generate reason
  const reasons: string[] = [];

  if (focusOverlap > 0) {
    reasons.push(`${focusOverlap} focus area match`);
  }

  if (org1.region === org2.region) {
    reasons.push("Same region");
  }

  if (org1.verificationStatus === "verified" && org2.verificationStatus === "verified") {
    reasons.push("Both verified");
  }

  const reason =
    reasons.length > 0 ? reasons.join(", ") : "Complementary missions";

  return { score, reason };
}

/**
 * Calculate alignment score between organization and user preferences
 * Simpler than org-to-org matching
 */
export function calculatePreferenceAlignment(
  org: Organization,
  userFocusAreas: string[],
  userRegions: string[],
  userTypes: string[]
): number {
  let score = 40;

  // Focus area overlap
  const focusOverlap = org.focusAreas.filter((fa) =>
    userFocusAreas.includes(fa)
  ).length;

  if (focusOverlap > 0) {
    score += Math.min(focusOverlap * 10, 30);
  }

  // Region match
  if (userRegions.includes(org.region)) {
    score += 15;
  }

  // Type match
  if (userTypes.includes(org.type)) {
    score += 5;
  }

  // Verification boost
  if (org.verificationStatus === "verified") {
    score += 10;
  }

  return Math.min(Math.max(score, 0), 100);
}
