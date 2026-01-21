"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Filter, LogOut, User, Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/drivya/ProtectedRoute";
import DecisionCard from "@/components/drivya/DecisionCard";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/services/auth";
import { supabase } from "@/lib/supabase";
import type { DrivyaOrganization, Verdict, SignalLevel } from "@/data/drivya-data";

// Fetch organizations from Supabase and compute decision signals
async function fetchOrganizationsWithSignals(): Promise<DrivyaOrganization[]> {
    if (!supabase) {
        console.warn("Supabase not configured");
        return [];
    }

    const { data: orgs, error } = await supabase
        .from("organizations")
        .select(`
      id,
      name,
      type,
      region,
      mission,
      description,
      verification_status,
      confidence,
      alignment_score,
      created_at,
      updated_at,
      organization_focus_areas(focus_area)
    `)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching organizations:", error);
        return [];
    }

    if (!orgs) return [];

    // Transform to DrivyaOrganization format with computed signals
    return orgs.map((org) => {
        // Compute signals based on available data
        const confidence = org.confidence || 50;
        const alignmentScore = org.alignment_score || 50;
        const isVerified = org.verification_status === "verified";
        const daysSinceUpdate = Math.floor(
            (Date.now() - new Date(org.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Engagement confidence based on verification and recency
        const engagementConfidence: SignalLevel =
            isVerified && daysSinceUpdate < 30 ? "high" :
                daysSinceUpdate < 90 ? "medium" : "low";

        // Collaboration intent based on alignment score
        const collaborationIntent: SignalLevel =
            alignmentScore >= 70 ? "high" :
                alignmentScore >= 40 ? "medium" : "low";

        // Time-waste risk inverse of confidence
        const timeWasteRisk: SignalLevel =
            confidence >= 70 ? "low" :
                confidence >= 40 ? "medium" : "high";

        // Calculate verdict
        let verdict: Verdict;
        if (engagementConfidence === "high" && collaborationIntent === "high" && timeWasteRisk === "low") {
            verdict = "worth-it";
        } else if (engagementConfidence === "low" || collaborationIntent === "low" || timeWasteRisk === "high") {
            verdict = "avoid";
        } else {
            verdict = "risky";
        }

        // Generate reason
        let reason = "";
        if (verdict === "worth-it") {
            reason = `Verified organization with strong engagement signals. Good alignment potential.`;
        } else if (verdict === "avoid") {
            if (engagementConfidence === "low") {
                reason = `Low activity signals. Consider other organizations first.`;
            } else if (timeWasteRisk === "high") {
                reason = `Higher risk of stalled conversations based on available data.`;
            } else {
                reason = `Weak alignment signals for your criteria.`;
            }
        } else {
            reason = `Promising fit but mixed signals. Proceed with clear expectations.`;
        }

        // Get primary focus area
        const focusAreas = org.organization_focus_areas || [];
        const primaryFocus = focusAreas.length > 0 ? focusAreas[0].focus_area : "General";

        // Warning sign for risky orgs
        let warningSign: string | undefined;
        if (verdict === "risky" || verdict === "avoid") {
            if (daysSinceUpdate > 90) {
                warningSign = `Profile not updated in ${daysSinceUpdate} days.`;
            } else if (!isVerified) {
                warningSign = "Organization not yet verified.";
            }
        }

        // Last active
        const lastActive = daysSinceUpdate === 0 ? "Today" :
            daysSinceUpdate === 1 ? "Yesterday" :
                daysSinceUpdate < 7 ? `${daysSinceUpdate} days ago` :
                    daysSinceUpdate < 30 ? `${Math.floor(daysSinceUpdate / 7)} weeks ago` :
                        `${Math.floor(daysSinceUpdate / 30)} months ago`;

        return {
            id: org.id,
            name: org.name,
            type: org.type as "NGO" | "CSR" | "Incubator" | "Foundation",
            region: org.region,
            focusArea: primaryFocus,
            verdict,
            signals: {
                engagementConfidence,
                collaborationIntent,
                timeWasteRisk,
            },
            reason,
            warningSign,
            summary: org.mission?.substring(0, 100) + "..." || org.description?.substring(0, 100) + "...",
            lastActive,
        };
    });
}

function DecidePageContent() {
    const router = useRouter();
    const { user } = useAuth();
    const [userType, setUserType] = useState<string>("");
    const [goal, setGoal] = useState<string>("");
    const [region, setRegion] = useState<string>("");
    const [showFilters, setShowFilters] = useState(true);
    const [organizations, setOrganizations] = useState<DrivyaOrganization[]>([]);
    const [loading, setLoading] = useState(true);
    const [allRegions, setAllRegions] = useState<string[]>([]);
    const [allFocusAreas, setAllFocusAreas] = useState<string[]>([]);

    // Fetch organizations on mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const orgs = await fetchOrganizationsWithSignals();
            setOrganizations(orgs);

            // Extract unique regions and focus areas
            const regions = [...new Set(orgs.map(o => o.region))].filter(Boolean);
            const focusAreas = [...new Set(orgs.map(o => o.focusArea))].filter(Boolean);
            setAllRegions(regions);
            setAllFocusAreas(focusAreas);
            setLoading(false);
        };
        loadData();
    }, []);

    // Filter organizations
    const filteredOrgs = useMemo(() => {
        if (!userType) return [];
        return organizations.filter(org => {
            // Filter by region if specified
            if (region && org.region !== region) return false;
            // Filter by focus area if specified
            if (goal && org.focusArea !== goal) return false;
            // For user type, show complementary org types
            if (userType === "ngo" && org.type === "NGO") return false;
            if (userType === "csr" && org.type === "CSR") return false;
            return true;
        });
    }, [organizations, userType, goal, region]);

    // Sort by verdict priority
    const sortedOrgs = useMemo(() => {
        const priority = { "worth-it": 0, "risky": 1, "avoid": 2 };
        return [...filteredOrgs].sort((a, b) => priority[a.verdict] - priority[b.verdict]);
    }, [filteredOrgs]);

    const verdictCounts = useMemo(() => ({
        worthIt: sortedOrgs.filter(o => o.verdict === "worth-it").length,
        risky: sortedOrgs.filter(o => o.verdict === "risky").length,
        avoid: sortedOrgs.filter(o => o.verdict === "avoid").length,
    }), [sortedOrgs]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border sticky top-0 bg-background z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold text-foreground">Drivya</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted/50 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                        {user && (
                            <div className="flex items-center gap-2 pl-4 border-l border-border">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                                    title="Sign out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                {/* Filters */}
                {showFilters && (
                    <div className="mb-8 p-5 bg-muted/30 rounded-xl border border-border">
                        <h2 className="text-sm font-medium text-foreground mb-4">Tell us about you</h2>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {/* User Type */}
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1.5">I am a...</label>
                                <select
                                    value={userType}
                                    onChange={(e) => setUserType(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                >
                                    <option value="">Select your type</option>
                                    <option value="ngo">NGO / Non-Profit</option>
                                    <option value="csr">CSR Team / Foundation</option>
                                    <option value="incubator">Incubator / Accelerator</option>
                                </select>
                            </div>

                            {/* Goal / Focus Area */}
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1.5">Looking for partners in...</label>
                                <select
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                >
                                    <option value="">All focus areas</option>
                                    {allFocusAreas.map(area => (
                                        <option key={area} value={area}>{area}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Region */}
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1.5">Operating in...</label>
                                <select
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                >
                                    <option value="">All regions</option>
                                    {allRegions.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading organizations...</p>
                    </div>
                ) : !userType ? (
                    <div className="text-center py-16">
                        <p className="text-lg text-muted-foreground">
                            Select your organization type to see decision recommendations.
                        </p>
                    </div>
                ) : sortedOrgs.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-lg text-muted-foreground mb-2">
                            No organizations match your current filters.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Try adjusting your filters or check back later.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Summary */}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Showing {sortedOrgs.length} organizations
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-xs">
                                    <span className="text-green-600 dark:text-green-400">
                                        ✓ {verdictCounts.worthIt} worth pursuing
                                    </span>
                                    <span className="text-amber-600 dark:text-amber-400">
                                        ⚠ {verdictCounts.risky} risky
                                    </span>
                                    <span className="text-red-600 dark:text-red-400">
                                        ✕ {verdictCounts.avoid} avoid
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Decision Cards */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {sortedOrgs.map(org => (
                                <DecisionCard key={org.id} organization={org} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function DecidePage() {
    return (
        <ProtectedRoute>
            <DecidePageContent />
        </ProtectedRoute>
    );
}
