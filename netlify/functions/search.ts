import Fuse from "fuse.js";
import * as fs from "fs";
import * as path from "path";

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

// Load organizations data
function loadOrganizations(): Organization[] {
    try {
        // In Netlify Functions, we need to read from the bundled path
        const dataPath = path.join(__dirname, "../../client/data/organizations.json");
        const data = fs.readFileSync(dataPath, "utf-8");
        return JSON.parse(data) as Organization[];
    } catch (error) {
        console.error("Failed to load organizations:", error);
        return [];
    }
}

// Extract unique focus areas from organizations
function extractFocusAreas(organizations: Organization[]): string[] {
    const areas = new Set<string>();
    organizations.forEach((org) => {
        org.focusAreas?.forEach((area) => areas.add(area));
    });
    return Array.from(areas).sort();
}

// Extract unique regions from organizations
function extractRegions(organizations: Organization[]): string[] {
    const regions = new Set<string>();
    organizations.forEach((org) => {
        if (org.region) regions.add(org.region);
    });
    return Array.from(regions).sort();
}

// Fuse.js configuration for fuzzy search
const fuseOptions: Fuse.IFuseOptions<Organization> = {
    keys: [
        { name: "name", weight: 0.35 },
        { name: "focusAreas", weight: 0.25 },
        { name: "region", weight: 0.15 },
        { name: "type", weight: 0.1 },
        { name: "mission", weight: 0.1 },
        { name: "description", weight: 0.05 },
    ],
    threshold: 0.4, // 0 = exact match, 1 = match anything
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
};

export async function handler(event: { queryStringParameters?: Record<string, string> }) {
    try {
        const organizations = loadOrganizations();

        if (organizations.length === 0) {
            return {
                statusCode: 500,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                    success: false,
                    error: "Failed to load organization data",
                } as SearchResponse),
            };
        }

        const params = event.queryStringParameters || {};
        const query = params.q || "";
        const focusAreaFilter = params.focusArea || "";
        const regionFilter = params.region || "";
        const sortBy = params.sortBy || "alignment";

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
                // Sort by most recent project year if available
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

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(response),
        };
    } catch (error) {
        console.error("Search error:", error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "An error occurred",
            } as SearchResponse),
        };
    }
}
