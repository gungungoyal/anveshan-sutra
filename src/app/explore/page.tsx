"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/lib/stores/userStore";
import { useAccessCheck } from "@/components/RequireAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ExternalLink, CheckCircle2, Search as SearchIcon, HelpCircle, AlertTriangle, X, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { searchOrganizations } from "@/lib/services/organizations";
import { SearchResult } from "@shared/api";
import AlignmentScoreBreakdown from "@/components/AlignmentScoreBreakdown";
import { toast } from "sonner";

// Use SearchResult from shared API
type Organization = SearchResult;

/**
 * Generate match reasons based on organization data and search filters
 * Returns 2-3 bullet points explaining why this org matches
 */
function generateMatchReasons(
    org: Organization,
    selectedFocusArea: string,
    selectedRegion: string
): string[] {
    const reasons: string[] = [];

    // Check for shared focus areas
    if (org.focusAreas && org.focusAreas.length > 0) {
        if (selectedFocusArea && org.focusAreas.some(
            area => area.toLowerCase() === selectedFocusArea.toLowerCase()
        )) {
            // Matching focus area with filter
            reasons.push(`Shared focus area: ${selectedFocusArea}`);
        } else if (org.focusAreas.length >= 2) {
            // Show top focus areas
            reasons.push(`Works in ${org.focusAreas.slice(0, 2).join(" & ")}`);
        } else {
            reasons.push(`Focus area: ${org.focusAreas[0]}`);
        }
    }

    // Check for regional overlap
    if (org.region) {
        if (selectedRegion && org.region.toLowerCase().includes(selectedRegion.toLowerCase())) {
            reasons.push(`Active in ${org.region}`);
        } else {
            reasons.push(`Based in ${org.region}`);
        }
    }

    // Extract mission highlight
    if (org.mission) {
        const missionLower = org.mission.toLowerCase();
        if (missionLower.includes("early-stage") || missionLower.includes("startup")) {
            reasons.push("Works with early-stage social enterprises");
        } else if (missionLower.includes("rural") || missionLower.includes("village")) {
            reasons.push("Focuses on rural communities");
        } else if (missionLower.includes("women") || missionLower.includes("gender")) {
            reasons.push("Supports women-led initiatives");
        } else if (missionLower.includes("youth") || missionLower.includes("education")) {
            reasons.push("Engaged in youth and education");
        } else if (missionLower.includes("health") || missionLower.includes("healthcare")) {
            reasons.push("Active in healthcare initiatives");
        } else if (missionLower.includes("environment") || missionLower.includes("climate")) {
            reasons.push("Focused on environmental impact");
        } else if (org.fundingType === "provider" || org.fundingType === "grant") {
            reasons.push("Provides funding support");
        } else if (org.fundingType === "recipient") {
            reasons.push("Seeking partnership opportunities");
        }
    }

    // Return up to 3 reasons, or fallback if none
    return reasons.slice(0, 3);
}

function ExploreContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { role, hasOrganization, interestAreas } = useUserStore();
    const { needsSetup, showSetupPrompt } = useAccessCheck();
    const [results, setResults] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [focusAreas, setFocusAreas] = useState<string[]>([]);
    const [regions, setRegions] = useState<string[]>([]);
    const [shortlist, setShortlist] = useState<Set<string>>(new Set());

    // Incubator setup prompt - dismissible (defer localStorage to useEffect)
    const [dismissedSetupPrompt, setDismissedSetupPrompt] = useState(false);

    // Guided intro state - persisted to localStorage
    const [showGuidedIntro, setShowGuidedIntro] = useState(true);

    // Filter state
    const [query, setQuery] = useState(searchParams?.get("q") || "");
    const [selectedFocusArea, setSelectedFocusArea] = useState(
        searchParams?.get("focus") || ""
    );
    const [selectedRegion, setSelectedRegion] = useState(
        searchParams?.get("region") || ""
    );
    const [sortBy, setSortBy] = useState<"alignment" | "name" | "recency">(
        (searchParams?.get("sort") as "alignment" | "name" | "recency") || "alignment"
    );

    // Hydrate localStorage values after mount
    useEffect(() => {
        setDismissedSetupPrompt(localStorage.getItem("dismissedIncubatorSetup") === "true");
        setShowGuidedIntro(localStorage.getItem("dismissedGuidedIntro") !== "true");
    }, []);

    // ===== STRICT AUTH PROTECTION =====
    // Redirect unauthenticated users to login
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth?returnTo=/explore');
        }
    }, [authLoading, isAuthenticated, router]);

    // Search function using service layer
    const fetchResults = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Pass user interests for personalized alignment scoring
            const data = await searchOrganizations({
                query: query.trim() || undefined,
                focusArea: selectedFocusArea || undefined,
                region: selectedRegion || undefined,
                sortBy: sortBy,
            }, interestAreas);

            if (!data.success) {
                throw new Error("Search failed");
            }

            setResults(data.results || []);

            // Update filter options from the response
            if (data.focusAreas && data.focusAreas.length > 0) {
                setFocusAreas(data.focusAreas);
            }
            if (data.regions && data.regions.length > 0) {
                setRegions(data.regions);
            }
        } catch (err) {
            console.error("Search error:", err);
            setError(err instanceof Error ? err.message : "Search failed");
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [query, selectedFocusArea, selectedRegion, sortBy, interestAreas]);

    // Debounced search effect
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchResults();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [fetchResults]);

    // Update URL params (preserve role param for contextual experience)
    useEffect(() => {
        const params = new URLSearchParams();
        const currentRole = searchParams?.get("role");
        if (currentRole) params.append("role", currentRole);
        if (query) params.append("q", query);
        if (selectedFocusArea) params.append("focus", selectedFocusArea);
        if (selectedRegion) params.append("region", selectedRegion);
        if (sortBy !== "alignment") params.append("sort", sortBy);

        window.history.replaceState(null, "", `?${params.toString()}`);
    }, [query, selectedFocusArea, selectedRegion, sortBy, searchParams]);

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Don't render content if not authenticated (will redirect)
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const dismissGuidedIntro = () => {
        setShowGuidedIntro(false);
        localStorage.setItem("dismissedGuidedIntro", "true");
    };

    const toggleShortlist = (orgId: string) => {
        // Gate behind auth
        if (!isAuthenticated) {
            toast.info("Sign in to save organizations", {
                action: {
                    label: "Sign In",
                    onClick: () => router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`),
                },
            });
            return;
        }

        const newShortlist = new Set(shortlist);
        if (newShortlist.has(orgId)) {
            newShortlist.delete(orgId);
        } else {
            newShortlist.add(orgId);
        }
        setShortlist(newShortlist);
    };

    const handleClearFilters = () => {
        setQuery("");
        setSelectedFocusArea("");
        setSelectedRegion("");
        setSortBy("alignment");
    };

    // Get role context from URL for personalized messaging
    const userRole = searchParams?.get("role");
    const roleContext = {
        ngo: {
            title: "Find CSR & Incubator Partners",
            subtitle: "Discover funding opportunities and collaborations aligned with your mission",
        },
        incubator: {
            title: "Discover NGOs & CSR Partners",
            subtitle: "Find organizations to support and corporate partners for scale",
        },
        csr: {
            title: "Explore Verified NGOs",
            subtitle: "Find credible organizations aligned with your CSR themes",
        },
    }[userRole as string] || {
        title: "Find Your Perfect Partner",
        subtitle: "Search and filter organizations by focus area, region, and more",
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        {roleContext.title}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {roleContext.subtitle}
                    </p>
                </div>

                {/* NGO BLOCKING BANNER - Must complete setup */}
                {needsSetup && (
                    <div className="mb-8 p-8 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-2xl text-center">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">
                            Set up your NGO profile to find partners
                        </h2>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Tell us about your organization so we can show you relevant CSR partners and incubators that align with your mission.
                        </p>
                        <Button
                            size="lg"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => router.push("/org-submit")}
                        >
                            Complete Setup
                        </Button>
                    </div>
                )}

                {/* INCUBATOR SETUP PROMPT - Dismissible */}
                {showSetupPrompt && !dismissedSetupPrompt && (
                    <div className="mb-8 p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-sky-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">
                                        Complete your Incubator profile to unlock alignment insights
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Save organizations, download PPTs, and see detailed matching scores.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                    size="sm"
                                    className="bg-sky-500 hover:bg-sky-600"
                                    onClick={() => router.push("/org-submit")}
                                >
                                    Set Up Now
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setDismissedSetupPrompt(true);
                                        localStorage.setItem("dismissedIncubatorSetup", "true");
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Guided First Match Intro - shows for first-time users */}
                {showGuidedIntro && (
                    <div className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                                {/* Title */}
                                <h2 className="text-lg font-semibold text-foreground mb-1">
                                    Here are organizations aligned with your mission
                                </h2>
                                {/* Subtext */}
                                <p className="text-sm text-muted-foreground mb-4">
                                    These matches are based on your focus areas, region, and goals.
                                </p>

                                {/* Context chips */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {selectedFocusArea && (
                                        <span className="px-3 py-1 bg-background border border-border rounded-full text-xs font-medium text-foreground">
                                            {selectedFocusArea}
                                        </span>
                                    )}
                                    {selectedRegion && (
                                        <span className="px-3 py-1 bg-background border border-border rounded-full text-xs font-medium text-foreground">
                                            {selectedRegion}
                                        </span>
                                    )}
                                    {!selectedFocusArea && !selectedRegion && (
                                        <>
                                            <span className="px-3 py-1 bg-background border border-border rounded-full text-xs font-medium text-foreground">
                                                All focus areas
                                            </span>
                                            <span className="px-3 py-1 bg-background border border-border rounded-full text-xs font-medium text-foreground">
                                                All regions
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Guidance text */}
                                <p className="text-xs text-muted-foreground">
                                    Start by opening any organization to see alignment details.
                                </p>
                            </div>

                            {/* Dismiss button */}
                            <button
                                onClick={dismissGuidedIntro}
                                className="text-sm text-primary hover:underline font-medium whitespace-nowrap"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 space-y-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <h3 className="font-bold text-lg mb-4">Filters</h3>

                                    {/* Search Query */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium mb-2">
                                            Search
                                        </label>
                                        <div className="relative">
                                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search organizations..."
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                className="w-full pl-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Focus Area Filter */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium mb-2">
                                            Focus Area
                                        </label>
                                        <Select
                                            value={selectedFocusArea || "__all__"}
                                            onValueChange={(val) => setSelectedFocusArea(val === "__all__" ? "" : val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All areas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__all__">All Areas</SelectItem>
                                                {focusAreas.map((area) => (
                                                    <SelectItem key={area} value={area}>
                                                        {area}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Region Filter */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium mb-2">
                                            Region
                                        </label>
                                        <Select
                                            value={selectedRegion || "__all__"}
                                            onValueChange={(val) => setSelectedRegion(val === "__all__" ? "" : val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All regions" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__all__">All Regions</SelectItem>
                                                {regions.map((region) => (
                                                    <SelectItem key={region} value={region}>
                                                        {region}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Sort By */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium mb-2">
                                            Sort By
                                        </label>
                                        <Select
                                            value={sortBy}
                                            onValueChange={(value) =>
                                                setSortBy(value as "alignment" | "name" | "recency")
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="alignment">Alignment Score</SelectItem>
                                                <SelectItem value="name">Name (A-Z)</SelectItem>
                                                <SelectItem value="recency">Recently Added</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Clear Filters */}
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleClearFilters}
                                    >
                                        Clear Filters
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="lg:col-span-3">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <div className="text-5xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">
                                    No matches yet
                                </h3>
                                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                    Try different keywords or filters — we're searching across hundreds of organizations!
                                </p>
                                <Button onClick={handleClearFilters} variant="outline">
                                    Clear All Filters
                                </Button>

                                {/* DEBUG INFO - Remove in production */}
                                <div className="mt-8 p-4 bg-gray-100 rounded text-left text-xs font-mono overflow-auto max-w-lg mx-auto">
                                    <p className="font-bold text-red-500 mb-2">DEBUG INFO:</p>
                                    <p>Loading: {loading ? 'true' : 'false'}</p>
                                    <p>Results: {results.length}</p>
                                    <p>Error: {error || 'None'}</p>
                                    <p>Supabase Url Configured: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Yes ' + process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10) + '...' : 'No'}</p>
                                    <p>Supabase Key Configured: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</p>
                                    <p>Auth Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {results.length} relevant organization{results.length !== 1 ? "s" : ""}
                                    </p>
                                    {results.length > 0 && (
                                        <>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-sm text-muted-foreground">
                                                    Estimated time saved: ~48 minutes (per search)
                                                </span>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button className="text-muted-foreground hover:text-foreground transition-colors">
                                                                <HelpCircle className="w-3.5 h-3.5" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs">
                                                            <p className="text-sm">
                                                                Manual research typically takes ~60 minutes. Drivya's matching reduces this to ~12 minutes by consolidating verified data in one place.
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <p className="text-xs text-muted-foreground/70 mt-0.5">
                                                Compared to manual research across multiple websites
                                            </p>
                                        </>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {results.map((org) => (
                                        <Card key={org.id} className="hover:border-primary transition-colors">
                                            <CardContent className="pt-6">
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                    {/* Org Info */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="text-xl font-bold text-foreground">
                                                                {org.name}
                                                            </h3>
                                                            {org.verificationStatus === "verified" && (
                                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                            )}
                                                        </div>

                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            <Badge variant="secondary">{org.type}</Badge>
                                                            <Badge variant="outline">{org.region}</Badge>
                                                            {/* Best Match badge for 80%+ alignment */}
                                                            {org.alignmentScore >= 80 && (
                                                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                                                                    ✨ Best Match
                                                                </Badge>
                                                            )}
                                                            {org.verificationStatus && (
                                                                <Badge
                                                                    variant={
                                                                        org.verificationStatus === "verified"
                                                                            ? "default"
                                                                            : "secondary"
                                                                    }
                                                                >
                                                                    {org.verificationStatus}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <p className="text-sm text-muted-foreground mb-3">
                                                            {org.mission}
                                                        </p>

                                                        <div className="flex flex-wrap gap-1 mb-3">
                                                            {org.focusAreas?.map((area) => (
                                                                <Badge key={area} variant="outline" className="text-xs">
                                                                    {area}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Alignment Score with Breakdown */}
                                                    <div className="md:text-right">
                                                        <AlignmentScoreBreakdown organization={org} compact />

                                                        {/* Why this matches you */}
                                                        {(() => {
                                                            const matchReasons = generateMatchReasons(org, selectedFocusArea, selectedRegion);
                                                            return (
                                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mb-4">
                                                                    <h4 className="text-sm font-medium text-foreground mb-2">
                                                                        Why this matches you
                                                                    </h4>
                                                                    {matchReasons.length > 0 ? (
                                                                        <ul className="space-y-1">
                                                                            {matchReasons.map((reason, idx) => (
                                                                                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                                                                    <span className="text-primary mt-0.5">•</span>
                                                                                    <span>{reason}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    ) : (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            This organization partially matches your criteria.
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}

                                                        {/* Actions */}
                                                        <div className="flex gap-2 flex-col">
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                className="w-full"
                                                                asChild
                                                            >
                                                                <Link href={`/org/${org.id}`}>View Details</Link>
                                                            </Button>
                                                            {org.description && (
                                                                <p className="text-sm text-muted-foreground mb-3">
                                                                    {org.description.length > 160
                                                                        ? org.description.slice(0, 157) + "..."
                                                                        : org.description}
                                                                </p>
                                                            )}
                                                            <Button
                                                                variant={shortlist.has(org.id) ? "default" : "outline"}
                                                                size="sm"
                                                                className="w-full"
                                                                onClick={() => toggleShortlist(org.id)}
                                                            >
                                                                <Heart
                                                                    className="w-4 h-4 mr-2"
                                                                    fill={shortlist.has(org.id) ? "currentColor" : "none"}
                                                                />
                                                                {shortlist.has(org.id) ? "Saved" : "Save"}
                                                            </Button>

                                                            {org.website && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="w-full"
                                                                    asChild
                                                                >
                                                                    <a
                                                                        href={org.website}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <ExternalLink className="w-4 h-4 mr-2" />
                                                                        Website
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <ExploreContent />
        </Suspense>
    );
}
