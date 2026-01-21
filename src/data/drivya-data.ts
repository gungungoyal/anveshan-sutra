/**
 * Drivya Decision Platform - Mock Data
 * Organizations with decision signals for MVP
 */

export type Verdict = "worth-it" | "risky" | "avoid";
export type SignalLevel = "high" | "medium" | "low";

export interface DecisionSignals {
    engagementConfidence: SignalLevel;
    collaborationIntent: SignalLevel;
    timeWasteRisk: SignalLevel;
}

export interface DrivyaOrganization {
    id: string;
    name: string;
    type: "NGO" | "CSR" | "Incubator" | "Foundation";
    region: string;
    focusArea: string;
    verdict: Verdict;
    signals: DecisionSignals;
    reason: string;
    warningSign?: string;
    summary: string;
    lastActive: string;
}

// Verdict calculation logic (rule-based)
export function calculateVerdict(signals: DecisionSignals): Verdict {
    const { engagementConfidence, collaborationIntent, timeWasteRisk } = signals;

    // Worth it: High engagement, Strong intent, Low risk
    if (engagementConfidence === "high" && collaborationIntent === "high" && timeWasteRisk === "low") {
        return "worth-it";
    }

    // Avoid: Low engagement OR weak intent OR high risk
    if (engagementConfidence === "low" || collaborationIntent === "low" || timeWasteRisk === "high") {
        return "avoid";
    }

    // Everything else is risky
    return "risky";
}

// Generate human-readable reason based on signals
export function generateReason(org: DrivyaOrganization): string {
    const { signals, verdict } = org;

    if (verdict === "worth-it") {
        return `Strong engagement history and clear collaboration intent. Low chance of wasted effort.`;
    }

    if (verdict === "avoid") {
        if (signals.engagementConfidence === "low") {
            return `Low response rate to outreach attempts. Your time is better spent elsewhere.`;
        }
        if (signals.timeWasteRisk === "high") {
            return `High risk of stalled conversations. Past collaborators report delays.`;
        }
        return `Weak signals of active collaboration interest.`;
    }

    // Risky
    if (signals.timeWasteRisk === "medium") {
        return `Promising fit but mixed signals. Proceed with clear expectations.`;
    }
    return `Good potential but approach with a specific ask.`;
}

// Mock organizations with pre-computed signals
export const drivyaOrganizations: DrivyaOrganization[] = [
    {
        id: "d-001",
        name: "Future Educators Foundation",
        type: "NGO",
        region: "Northern India",
        focusArea: "Education",
        verdict: "worth-it",
        signals: {
            engagementConfidence: "high",
            collaborationIntent: "high",
            timeWasteRisk: "low"
        },
        reason: "Actively seeking CSR partners. Responded to 8 of 10 recent inquiries within 48 hours.",
        summary: "Education-focused NGO in UP. Has partnered with 12 organizations in 2024.",
        lastActive: "2 days ago"
    },
    {
        id: "d-002",
        name: "Tech Skills Academy",
        type: "Incubator",
        region: "Southern India",
        focusArea: "Technology",
        verdict: "worth-it",
        signals: {
            engagementConfidence: "high",
            collaborationIntent: "high",
            timeWasteRisk: "low"
        },
        reason: "Strong track record with 85% partnership success rate. Currently expanding programs.",
        summary: "Bangalore-based tech incubator. Runs coding bootcamps for underserved youth.",
        lastActive: "1 day ago"
    },
    {
        id: "d-003",
        name: "Health for All Initiative",
        type: "Foundation",
        region: "Western India",
        focusArea: "Healthcare",
        verdict: "risky",
        signals: {
            engagementConfidence: "medium",
            collaborationIntent: "high",
            timeWasteRisk: "medium"
        },
        reason: "Interested in partnerships but slow decision-making. Average response time: 2 weeks.",
        warningSign: "Leadership transition in progress — decisions may be delayed.",
        summary: "Healthcare foundation running mobile clinics in rural Maharashtra.",
        lastActive: "1 week ago"
    },
    {
        id: "d-004",
        name: "Green Earth Collective",
        type: "NGO",
        region: "Southern India",
        focusArea: "Environment",
        verdict: "risky",
        signals: {
            engagementConfidence: "medium",
            collaborationIntent: "medium",
            timeWasteRisk: "medium"
        },
        reason: "Good alignment potential but unclear bandwidth for new partnerships this quarter.",
        warningSign: "Currently managing 5 active partnerships — capacity may be limited.",
        summary: "Environmental NGO focused on reforestation in Western Ghats.",
        lastActive: "5 days ago"
    },
    {
        id: "d-005",
        name: "Women Empowerment Network",
        type: "NGO",
        region: "Western India",
        focusArea: "Livelihood",
        verdict: "worth-it",
        signals: {
            engagementConfidence: "high",
            collaborationIntent: "high",
            timeWasteRisk: "low"
        },
        reason: "Actively looking for CSR funding. Clear partnership criteria published on website.",
        summary: "Supports 5000+ women through SHGs in Rajasthan. Microfinance focus.",
        lastActive: "Today"
    },
    {
        id: "d-006",
        name: "Rural Development Trust",
        type: "NGO",
        region: "Central India",
        focusArea: "Livelihood",
        verdict: "avoid",
        signals: {
            engagementConfidence: "low",
            collaborationIntent: "medium",
            timeWasteRisk: "high"
        },
        reason: "Only 2 of 15 outreach attempts received responses in the past year.",
        warningSign: "Website last updated 8 months ago. Social media inactive.",
        summary: "Works on rural employment programs in Madhya Pradesh.",
        lastActive: "3 months ago"
    },
    {
        id: "d-007",
        name: "Clean Water Foundation",
        type: "Foundation",
        region: "Eastern India",
        focusArea: "Healthcare",
        verdict: "worth-it",
        signals: {
            engagementConfidence: "high",
            collaborationIntent: "high",
            timeWasteRisk: "low"
        },
        reason: "Published RFP for new partners. Responds to all inquiries with structured process.",
        summary: "Builds water systems in Bihar. Benefited 50,000+ people.",
        lastActive: "Today"
    },
    {
        id: "d-008",
        name: "Youth Leadership Foundation",
        type: "Foundation",
        region: "Southern India",
        focusArea: "Education",
        verdict: "risky",
        signals: {
            engagementConfidence: "high",
            collaborationIntent: "medium",
            timeWasteRisk: "medium"
        },
        reason: "Engaged but selective. Only partners with organizations meeting specific criteria.",
        warningSign: "Requires 6-month pilot before formal partnership.",
        summary: "Runs leadership programs in Tamil Nadu schools and colleges.",
        lastActive: "3 days ago"
    },
    {
        id: "d-009",
        name: "Sunrise CSR Initiative",
        type: "CSR",
        region: "Northern India",
        focusArea: "Education",
        verdict: "avoid",
        signals: {
            engagementConfidence: "low",
            collaborationIntent: "low",
            timeWasteRisk: "high"
        },
        reason: "Budget already committed for FY 2025-26. Not accepting new proposals.",
        warningSign: "Internal sources indicate 18-month backlog of approved projects.",
        summary: "Corporate CSR arm of a manufacturing conglomerate.",
        lastActive: "2 months ago"
    },
    {
        id: "d-010",
        name: "Digital India Foundation",
        type: "Foundation",
        region: "Northern India",
        focusArea: "Technology",
        verdict: "worth-it",
        signals: {
            engagementConfidence: "high",
            collaborationIntent: "high",
            timeWasteRisk: "low"
        },
        reason: "Actively funding digital literacy programs. Open application window until March.",
        summary: "Provides grants for tech education in rural areas.",
        lastActive: "Today"
    }
];

// Filter organizations by criteria
export function filterOrganizations(
    orgs: DrivyaOrganization[],
    filters: {
        userType?: string;
        goal?: string;
        region?: string;
    }
): DrivyaOrganization[] {
    return orgs.filter(org => {
        // Filter by region if specified
        if (filters.region && filters.region !== "all" && org.region !== filters.region) {
            return false;
        }

        // Filter by focus area (goal) if specified
        if (filters.goal && filters.goal !== "all" && org.focusArea !== filters.goal) {
            return false;
        }

        // For user type, we show complementary org types
        if (filters.userType) {
            if (filters.userType === "ngo" && org.type === "NGO") {
                return false; // NGOs look for CSR/Incubators, not other NGOs
            }
            if (filters.userType === "csr" && org.type === "CSR") {
                return false; // CSRs look for NGOs, not other CSRs
            }
        }

        return true;
    });
}

// Get unique values for filters
export const regions = ["Northern India", "Southern India", "Western India", "Eastern India", "Central India"];
export const focusAreas = ["Education", "Healthcare", "Environment", "Technology", "Livelihood"];
export const orgTypes = ["ngo", "csr", "incubator"] as const;
