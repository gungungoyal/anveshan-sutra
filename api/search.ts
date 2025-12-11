import type { VercelRequest, VercelResponse } from "@vercel/node";
import Fuse from "fuse.js";

// Import organizations data directly (Vercel bundles this at build time)
import organizationsData from "../client/data/organizations.json";

// Organization type based on organizations.json structure
interface Organization {
    id: string;
    name: string;
    type: string;
    website?: string;
    headquarters?: string;
    region: string;
    focusAreas: string[];
    mission: string;
    description?: string;
    verificationStatus?: string;
    projects?: Array<{
        title: string;
        year: number;
        description: string;
    }>;
    fundingType?: string;
    targetBeneficiaries?: string[];
    partnerHistory?: string[];
    confidence?: number;
    alignmentScore?: number;
}

interface SearchResponse {
    success: boolean;
    results?: Organization[];
    total?: number;
    focusAreas?: string[];
    regions?: string[];
    error?: string;
}

// Type cast the imported data
const organizations: Organization[] = organizationsData as Organization[];

// Extract unique focus areas from organizations
function extractFocusAreas(orgs: Organization[]): string[] {
    const areas = new Set<string>();
    orgs.forEach((org) => {
        org.focusAreas?.forEach((area) => areas.add(area));
    });
    return Array.from(areas).sort();
}

// Extract unique regions from organizations
function extractRegions(orgs: Organization[]): string[] {
    const regions = new Set<string>();
    orgs.forEach((org) => {
        if (org.region) regions.add(org.region);
    });
    return Array.from(regions).sort();
}

// Fuse.js configuration for fuzzy search
const fuseOptions = {
    keys: [
        { name: "name", weight: 0.35 },
        { name: "focusAreas", weight: 0.25 },
        { name: "region", weight: 0.15 },
        { name: "type", weight: 0.1 },
        { name: "mission", weight: 0.1 },
        { name: "description", weight: 0.05 },
    ],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
};

export default function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        if (organizations.length === 0) {
            return res.status(500).json({
                success: false,
                error: "No organization data available",
            } as SearchResponse);
        }

        const query = (req.query.q as string) || "";
        const focusAreaFilter = (req.query.focusArea as string) || "";
        const regionFilter = (req.query.region as string) || "";
        const sortBy = (req.query.sortBy as string) || "alignment";

        let results: Organization[] = [];

        // If there's a search query, use Fuse.js for fuzzy search
        if (query.trim()) {
            const fuse = new Fuse(organizations, fuseOptions);
            const searchResults = fuse.search(query);
            results = searchResults.map((result) => result.item);
        } else {
            // No query - return all organizations
            results = [...organizations];
        }

        // Apply filters
        if (focusAreaFilter) {
            results = results.filter((org) =>
                org.focusAreas?.some(
                    (area) => area.toLowerCase() === focusAreaFilter.toLowerCase()
                )
            );
        }

        if (regionFilter) {
            results = results.filter(
                (org) => org.region?.toLowerCase() === regionFilter.toLowerCase()
            );
        }

        // Apply sorting
        switch (sortBy) {
            case "name":
                results.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "recency":
                results.sort((a, b) => {
                    const aYear = a.projects?.[0]?.year || 0;
                    const bYear = b.projects?.[0]?.year || 0;
                    return bYear - aYear;
                });
                break;
            case "alignment":
            default:
                results.sort((a, b) => (b.alignmentScore || 0) - (a.alignmentScore || 0));
                break;
        }

        const response: SearchResponse = {
            success: true,
            results,
            total: results.length,
            focusAreas: extractFocusAreas(organizations),
            regions: extractRegions(organizations),
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "An error occurred",
        } as SearchResponse);
    }
}
