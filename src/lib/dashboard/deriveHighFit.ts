/**
 * Dashboard List Derivation Logic
 * 
 * Pure functions to derive display lists from mock organizations.
 * No side effects, no API calls.
 */

import { DashboardOrganization } from "@/data/mockDashboardOrgs";

/**
 * High-fit Organizations
 * 
 * Logic:
 * 1. Sort all organizations by fitScore (descending)
 * 2. Use createdAt as tiebreaker (newer first) when fitScore is equal
 * 3. Return top N organizations (default: 5)
 * 
 * This is purely relevance-based — ignores recency except for ties.
 */
export function getHighFitOrganizations(
    orgs: DashboardOrganization[],
    limit: number = 5
): DashboardOrganization[] {
    return [...orgs]
        .sort((a, b) => {
            // Primary: fitScore descending
            if (b.fitScore !== a.fitScore) {
                return b.fitScore - a.fitScore;
            }
            // Tiebreaker: createdAt descending (newer first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, limit);
}

/**
 * Recently Added Organizations
 * 
 * Logic:
 * 1. Exclude organizations already shown in High-fit (by ID)
 * 2. Sort remaining by createdAt (descending - newest first)
 * 3. Return top N organizations (default: 5)
 * 
 * Duplicates are avoided by passing the high-fit IDs as an exclusion set.
 */
export function getRecentlyAddedOrganizations(
    orgs: DashboardOrganization[],
    excludeIds: Set<string>,
    limit: number = 5
): DashboardOrganization[] {
    return [...orgs]
        .filter((org) => !excludeIds.has(org.id)) // Exclude high-fit orgs
        .sort((a, b) => {
            // Primary: createdAt descending (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, limit);
}

