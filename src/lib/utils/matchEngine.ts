/**
 * matchEngine.ts
 *
 * Pure, side-effect-free matching engine.
 * Takes a CSR project expectation + an NGO organization
 * and returns a structured MatchResult with scores, risk flags, and dimension breakdown.
 *
 * No API calls. No side effects.
 */

import { Organization } from "@shared/api";
import { ProjectExpectation } from "@/lib/services/projectExpectations";

// ============================================================
// TYPES
// ============================================================

export type DimensionStatus = "✅" | "⚠️" | "❌";
export type MatchLevel = "Strong match" | "Risky" | "Avoid";

export interface DimensionResult {
    status: DimensionStatus;
    label: string;
    detail: string;
}

export interface BudgetRealism {
    realisticRange: [number, number]; // [min, max] INR per beneficiary
    isBelowRange: boolean;
    isAboveRange: boolean;
    csrExpectedMin: number; // derived from beneficiary range midpoint × region factor
}

export interface MatchResult {
    fitScore: number;
    matchLevel: MatchLevel;
    dimensions: {
        capacity: DimensionResult;
        geography: DimensionResult;
        reporting: DimensionResult;
        program: DimensionResult;
        budget: DimensionResult;
    };
    riskFlags: string[];
    budgetRealism: BudgetRealism;
}

// ============================================================
// CONSTANTS / LOOKUP TABLES
// ============================================================

/**
 * Beneficiary range → approximate midpoint for budget math
 */
const BENEFICIARY_MIDPOINTS: Record<string, number> = {
    "100-500": 300,
    "500-2000": 1250,
    "2000-10000": 6000,
    "10000+": 15000,
};

/**
 * Beneficiary range → approximate max for capacity matching
 */
const BENEFICIARY_MAXES: Record<string, number> = {
    "100-500": 500,
    "500-2000": 2000,
    "2000-10000": 10000,
    "10000+": 20000,
};

/**
 * Geography type → market cost multiplier (tribal/remote areas cost more per beneficiary)
 */
const GEO_COST_MULTIPLIER: Record<string, number> = {
    urban: 1.0,
    rural: 1.2,
    tribal: 1.5,
    remote: 1.7,
};

/**
 * Reporting intensity ordering (higher = harder)
 */
const REPORTING_ORDER: Record<string, number> = {
    simple: 1,
    moderate: 2,
    heavy: 3,
};

/**
 * Program nature → relevant focus area keywords
 */
const PROGRAM_TO_FOCUS_AREAS: Record<string, string[]> = {
    education: ["Education"],
    health: ["Health"],
    livelihood: ["Livelihood", "Technology"],
    environment: ["Environment"],
    mixed: ["Education", "Health", "Livelihood", "Environment", "Governance", "Technology"],
};

// ============================================================
// DIMENSION SCORERS
// ============================================================

function scoreCapacity(
    expectation: ProjectExpectation,
    org: Organization
): DimensionResult & { score: number } {
    const maxNeeded = BENEFICIARY_MAXES[expectation.beneficiary_range] ?? 1000;
    const maxHandled = org.maxBeneficiaries;

    if (!maxHandled) {
        return {
            status: "⚠️",
            label: "Capacity unknown",
            detail: "No historical capacity data available for this organization.",
            score: 40,
        };
    }

    if (maxHandled >= maxNeeded * 1.1) {
        // Comfortably above requirement
        return {
            status: "✅",
            label: `Max ${maxHandled.toLocaleString()} handled`,
            detail: `CSR needs up to ${maxNeeded.toLocaleString()} — org has handled ${maxHandled.toLocaleString()} before.`,
            score: 100,
        };
    }

    if (maxHandled >= maxNeeded * 0.8) {
        // Within 20% — achievable stretch
        return {
            status: "⚠️",
            label: `Near capacity limit`,
            detail: `CSR needs up to ${maxNeeded.toLocaleString()} — org max is ${maxHandled.toLocaleString()}. Possible, but a stretch.`,
            score: 65,
        };
    }

    // Below requirement
    return {
        status: "❌",
        label: `Capacity gap: ${maxHandled.toLocaleString()} max`,
        detail: `CSR needs up to ${maxNeeded.toLocaleString()} beneficiaries, but org max is ${maxHandled.toLocaleString()}.`,
        score: 20,
    };
}

function scoreGeography(
    expectation: ProjectExpectation,
    org: Organization
): DimensionResult & { score: number } {
    const csrGeoType = expectation.geography_type as string; // e.g. "tribal"
    const orgGeoTypes = org.geographyTypes ?? [];

    if (orgGeoTypes.length === 0) {
        return {
            status: "⚠️",
            label: "Geography data unavailable",
            detail: "No geography experience data for this organization.",
            score: 40,
        };
    }

    const exactMatch = orgGeoTypes.includes(csrGeoType as "urban" | "rural" | "tribal" | "remote");

    if (exactMatch) {
        return {
            status: "✅",
            label: `Experienced in ${csrGeoType} areas`,
            detail: `Organization has prior work in ${csrGeoType} geography.`,
            score: 100,
        };
    }

    // Partial credit: rural → tribal adjacent, urban ≠ tribal
    const partialMatches: Record<string, string[]> = {
        tribal: ["rural", "remote"],
        remote: ["rural", "tribal"],
        rural: ["tribal", "remote"],
        urban: [],
    };

    const partials = partialMatches[csrGeoType] ?? [];
    const hasPartial = orgGeoTypes.some((g) => partials.includes(g));

    if (hasPartial) {
        return {
            status: "⚠️",
            label: `Limited ${csrGeoType} experience`,
            detail: `Organization works in adjacent areas but has no documented work in ${csrGeoType} geography. Higher ground risk.`,
            score: 50,
        };
    }

    return {
        status: "❌",
        label: `No ${csrGeoType} geography experience`,
        detail: `Organization only works in ${orgGeoTypes.join(", ")} areas. ${csrGeoType} work is unproven.`,
        score: 10,
    };
}

function scoreReporting(
    expectation: ProjectExpectation,
    org: Organization
): DimensionResult & { score: number } {
    const csrLevel = expectation.reporting_intensity; // "simple" | "moderate" | "heavy"
    const orgLevel = org.reportingCapability;

    if (!orgLevel) {
        return {
            status: "⚠️",
            label: "Reporting capability unknown",
            detail: "No reporting capability data for this organization.",
            score: 40,
        };
    }

    const csrOrder = REPORTING_ORDER[csrLevel] ?? 2;
    const orgOrder = REPORTING_ORDER[orgLevel] ?? 1;

    if (orgOrder >= csrOrder) {
        // Org can meet or exceed requirement
        return {
            status: "✅",
            label: `${capitalize(orgLevel)} reporting supported`,
            detail: `CSR needs ${csrLevel} reporting. Organization supports ${orgLevel} reporting.`,
            score: 100,
        };
    }

    if (orgOrder === csrOrder - 1) {
        // One level below — friction possible
        return {
            status: "⚠️",
            label: `Reporting mismatch: ${capitalize(orgLevel)} only`,
            detail: `CSR needs ${csrLevel} reporting but org operates at ${orgLevel} level. Upgrade friction likely.`,
            score: 50,
        };
    }

    // Two levels below
    return {
        status: "❌",
        label: `Reporting gap: ${capitalize(orgLevel)} only`,
        detail: `CSR needs ${csrLevel} reporting but org only supports ${orgLevel}. Significant compliance risk.`,
        score: 10,
    };
}

function scoreProgram(
    expectation: ProjectExpectation,
    org: Organization
): DimensionResult & { score: number } {
    const programNature = expectation.program_nature; // "education" | "health" | "livelihood" | "environment" | "mixed"
    const wantedFocusAreas = PROGRAM_TO_FOCUS_AREAS[programNature] ?? [];
    const orgFocusAreas = (org.focusAreas ?? []).map((f) => f.toLowerCase());
    const wantedLower = wantedFocusAreas.map((f) => f.toLowerCase());

    const matchCount = wantedLower.filter((w) => orgFocusAreas.includes(w)).length;

    if (programNature === "mixed") {
        // Mixed = any overlap is fine
        if (matchCount >= 2) {
            return {
                status: "✅",
                label: "Multi-domain alignment",
                detail: `CSR needs mixed programs. Org covers ${org.focusAreas.join(", ")}.`,
                score: 90,
            };
        }
        return {
            status: "⚠️",
            label: "Partial domain coverage",
            detail: `CSR needs mixed programs. Org specializes in ${org.focusAreas.join(", ")}.`,
            score: 60,
        };
    }

    if (matchCount > 0) {
        return {
            status: "✅",
            label: `${capitalize(programNature)} aligned`,
            detail: `Org works in ${org.focusAreas.join(", ")}, matching CSR's ${programNature} focus.`,
            score: 100,
        };
    }

    return {
        status: "❌",
        label: "Program mismatch",
        detail: `CSR needs ${programNature} programs but org focuses on ${org.focusAreas.join(", ")}.`,
        score: 0,
    };
}

function scoreBudget(
    expectation: ProjectExpectation,
    org: Organization
): DimensionResult & { score: number } {
    const geoType = expectation.geography_type;
    const multiplier = GEO_COST_MULTIPLIER[geoType] ?? 1.0;
    const orgRange = org.costPerBeneficiaryRange;

    // Estimate a realistic range for this geography if org doesn't have data
    const fallbackRange: [number, number] = [
        Math.round(1000 * multiplier),
        Math.round(2000 * multiplier),
    ];
    const realisticRange: [number, number] = orgRange
        ? [Math.round(orgRange[0] * multiplier), Math.round(orgRange[1] * multiplier)]
        : fallbackRange;

    // CSR expected cost: derive from beneficiary midpoint × 1500 INR as typical CSR implied budget
    // (We don't have a CSR budget field yet, so we derive "expected" as 75% of realistic min)
    const csrExpectedMin = Math.round(realisticRange[0] * 0.75);

    const isBelowRange = csrExpectedMin < realisticRange[0];
    const isAboveRange = csrExpectedMin > realisticRange[1];

    if (!isBelowRange && !isAboveRange) {
        return {
            status: "✅",
            label: `₹${realisticRange[0].toLocaleString()}–₹${realisticRange[1].toLocaleString()} per beneficiary`,
            detail: `Realistic cost range for ${geoType} geography. Budget appears aligned.`,
            score: 100,
        };
    }

    if (isBelowRange) {
        return {
            status: "⚠️",
            label: `Market rate: ₹${realisticRange[0].toLocaleString()}–₹${realisticRange[1].toLocaleString()}/ben`,
            detail: `For ${geoType} geography, realistic cost is ₹${realisticRange[0].toLocaleString()}–₹${realisticRange[1].toLocaleString()} per beneficiary. Budget may be below market rate — negotiation friction likely.`,
            score: 40,
        };
    }

    return {
        status: "⚠️",
        label: `High cost: ₹${realisticRange[0].toLocaleString()}–₹${realisticRange[1].toLocaleString()}/ben`,
        detail: `This organization's cost range appears higher than typical for this geography.`,
        score: 60,
    };
}

// ============================================================
// COMPOSITE SCORER
// ============================================================

function computeMatchLevel(score: number): MatchLevel {
    if (score >= 72) return "Strong match";
    if (score >= 45) return "Risky";
    return "Avoid";
}

// ============================================================
// MAIN EXPORT
// ============================================================

/**
 * Compute a structured match result between a CSR project expectation and an NGO.
 *
 * @param expectation - CSR's stored project expectation from Supabase
 * @param org - NGO organization profile
 * @returns MatchResult — scores, risk flags, dimension breakdown
 */
export function computeMatch(
    expectation: ProjectExpectation,
    org: Organization
): MatchResult {
    const capResult = scoreCapacity(expectation, org);
    const geoResult = scoreGeography(expectation, org);
    const repResult = scoreReporting(expectation, org);
    const progResult = scoreProgram(expectation, org);
    const budResult = scoreBudget(expectation, org);

    // Weighted composite score
    // Capacity: 25%, Geography: 25%, Reporting: 20%, Program: 20%, Budget: 10%
    const fitScore = Math.round(
        capResult.score * 0.25 +
        geoResult.score * 0.25 +
        repResult.score * 0.20 +
        progResult.score * 0.20 +
        budResult.score * 0.10
    );

    // Collect risk flags from all warning/error dimensions
    const riskFlags: string[] = [];

    if (capResult.status !== "✅") {
        riskFlags.push(capResult.detail);
    }
    if (geoResult.status !== "✅") {
        riskFlags.push(geoResult.detail);
    }
    if (repResult.status !== "✅") {
        riskFlags.push(repResult.detail);
    }
    if (progResult.status !== "✅") {
        riskFlags.push(progResult.detail);
    }
    if (budResult.status !== "✅") {
        riskFlags.push(budResult.detail);
    }

    // Budget realism object
    const geoType = expectation.geography_type;
    const multiplier = GEO_COST_MULTIPLIER[geoType] ?? 1.0;
    const orgRange = org.costPerBeneficiaryRange;
    const realisticRange: [number, number] = orgRange
        ? [Math.round(orgRange[0] * multiplier), Math.round(orgRange[1] * multiplier)]
        : [Math.round(1000 * multiplier), Math.round(2000 * multiplier)];
    const csrExpectedMin = Math.round(realisticRange[0] * 0.75);

    return {
        fitScore,
        matchLevel: computeMatchLevel(fitScore),
        dimensions: {
            capacity: { status: capResult.status, label: capResult.label, detail: capResult.detail },
            geography: { status: geoResult.status, label: geoResult.label, detail: geoResult.detail },
            reporting: { status: repResult.status, label: repResult.label, detail: repResult.detail },
            program: { status: progResult.status, label: progResult.label, detail: progResult.detail },
            budget: { status: budResult.status, label: budResult.label, detail: budResult.detail },
        },
        riskFlags,
        budgetRealism: {
            realisticRange,
            isBelowRange: csrExpectedMin < realisticRange[0],
            isAboveRange: csrExpectedMin > realisticRange[1],
            csrExpectedMin,
        },
    };
}

// ============================================================
// UTILS
// ============================================================

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Sort a list of orgs by their computed fit score (highest first)
 */
export function sortByFitScore<T extends { fitScore: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => b.fitScore - a.fitScore);
}

/**
 * Get badge color class from MatchLevel
 */
export function getMatchLevelStyle(level: MatchLevel): {
    badge: string;
    text: string;
    bg: string;
    border: string;
} {
    switch (level) {
        case "Strong match":
            return {
                badge: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
                text: "text-green-700 dark:text-green-400",
                bg: "bg-green-50 dark:bg-green-900/20",
                border: "border-green-200 dark:border-green-800",
            };
        case "Risky":
            return {
                badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
                text: "text-amber-700 dark:text-amber-400",
                bg: "bg-amber-50 dark:bg-amber-900/20",
                border: "border-amber-200 dark:border-amber-800",
            };
        case "Avoid":
            return {
                badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
                text: "text-red-700 dark:text-red-400",
                bg: "bg-red-50 dark:bg-red-900/20",
                border: "border-red-200 dark:border-red-800",
            };
    }
}
