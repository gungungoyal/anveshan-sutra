"use client";

import { useState, useEffect, useCallback, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/lib/stores/userStore";
import { useAccessCheck } from "@/components/RequireAuth";
import { useCsrProjectSetupGuard } from "@/hooks/useCsrProjectSetupGuard";
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
import { Heart, ExternalLink, CheckCircle2, Search as SearchIcon, HelpCircle, AlertTriangle, X, Loader2, Lock, ShieldAlert, MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { searchOrganizations } from "@/lib/services/organizations";
import { SearchResult } from "@shared/api";
import { useQuery } from "@tanstack/react-query";
import AlignmentScoreBreakdown from "@/components/AlignmentScoreBreakdown";
import { toast } from "sonner";
import { usePurchasedOrgs } from "@/hooks/usePurchase";
import { computeMatch, MatchResult, getMatchLevelStyle } from "@/lib/utils/matchEngine";
import { getProjectExpectation, ProjectExpectation } from "@/lib/services/projectExpectations";

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
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    const { role, hasOrganization, interestAreas } = useUserStore();
    const { needsSetup, showSetupPrompt } = useAccessCheck();

    // ===== CSR PROJECT SETUP GUARD =====
    // Redirect CSR users to /project/setup if they haven't defined project expectations
    const { isCheckingSetup, needsProjectSetup } = useCsrProjectSetupGuard();

    const [shortlist, setShortlist] = useState<Set<string>>(new Set());
    const [savingOrgs, setSavingOrgs] = useState<Set<string>>(new Set()); // Track in-progress saves

    // Track purchased organizations
    const { purchasedIds, isLoading: purchasedLoading } = usePurchasedOrgs();

    // Incubator setup prompt - dismissible (defer localStorage to useEffect)
    const [dismissedSetupPrompt, setDismissedSetupPrompt] = useState(false);

    // Guided intro state - persisted to localStorage
    const [showGuidedIntro, setShowGuidedIntro] = useState(true);

    // ===== CSR MATCHING STATE =====
    const [csrExpectation, setCsrExpectation] = useState<ProjectExpectation | null>(null);
    const isCSR = user?.role === "csr";

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

    // ===== Load CSR Project Expectations =====
    useEffect(() => {
        if (!isAuthenticated || !user?.id || !isCSR) return;
        getProjectExpectation(user.id)
            .then((exp) => setCsrExpectation(exp))
            .catch(() => setCsrExpectation(null));
    }, [isAuthenticated, user?.id, isCSR]);

    // Load saved organizations on mount
    useEffect(() => {
        const loadSavedOrgs = async () => {
            if (!isAuthenticated || !user) return;

            const { getSavedOrganizationIds } = await import('@/lib/services/shortlist');
            const result = await getSavedOrganizationIds(user.id);

            if (result.success) {
                setShortlist(new Set(result.organizationIds));
            }
        };

        loadSavedOrgs();
    }, [isAuthenticated, user]);

    // ===== STRICT AUTH PROTECTION =====
    // Redirect unauthenticated users to login
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth?returnTo=/explore');
        }
    }, [authLoading, isAuthenticated, router]);

    // ✅ PERFORMANCE FIX: Use React Query for automatic caching
    const { data: searchData, isLoading, error: queryError } = useQuery({
        queryKey: ['organizations', query, selectedFocusArea, selectedRegion, sortBy, interestAreas],
        queryFn: async () => {
            // Debounce is handled by React Query's staleTime
            return searchOrganizations({
                query: query.trim() || undefined,
                focusArea: selectedFocusArea || undefined,
                region: selectedRegion || undefined,
                sortBy: sortBy,
                limit: 20,
            }, interestAreas);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: isAuthenticated, // Only fetch when authenticated
    });

    // Extract filter metadata from React Query result
    const focusAreas = searchData?.focusAreas || [];
    const regions = searchData?.regions || [];
    const loading = isLoading;
    const error = queryError ? (queryError instanceof Error ? queryError.message : "Search failed") : null;

    // ===== Compute match results for ALL visible orgs (CSR only) =====
    // matchMap: orgId -> MatchResult  — must be AFTER searchData is declared
    type Organisation = import("@shared/api").Organization;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const matchMap = useMemo<Map<string, MatchResult>>(() => {
        const map = new Map<string, MatchResult>();
        if (!isCSR || !csrExpectation) return map;
        const rawResults = searchData?.results ?? [];
        for (const org of rawResults) {
            try {
                map.set(org.id, computeMatch(csrExpectation, org as Organisation));
            } catch {
                // skip orgs that error
            }
        }
        return map;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCSR, csrExpectation, searchData]);

    // For CSR with expectations: sort results by fit score (highest first)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const results = useMemo(() => {
        const raw = searchData?.results ?? [];
        if (!isCSR || matchMap.size === 0) return raw;
        return [...raw].sort((a, b) => {
            const aScore = matchMap.get(a.id)?.fitScore ?? 0;
            const bScore = matchMap.get(b.id)?.fitScore ?? 0;
            return bScore - aScore;
        });
    }, [isCSR, matchMap, searchData]);

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

    // Show loading while checking auth or CSR project setup
    if (authLoading || isCheckingSetup) {
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

    // Block CSR users who haven't completed project setup (hook handles redirect)
    if (needsProjectSetup) {
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

    const toggleShortlist = async (orgId: string) => {
        // Gate behind auth
        if (!isAuthenticated || !user) {
            toast.info("Sign in to save organizations", {
                action: {
                    label: "Sign In",
                    onClick: () => router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`),
                },
            });
            return;
        }

        // Prevent double-clicking
        if (savingOrgs.has(orgId)) return;

        // Optimistic update
        const newShortlist = new Set(shortlist);
        const isSaving = !newShortlist.has(orgId);

        if (isSaving) {
            newShortlist.add(orgId);
        } else {
            newShortlist.delete(orgId);
        }
        setShortlist(newShortlist);
        setSavingOrgs(prev => new Set(prev).add(orgId));

        try {
            const { saveOrganization, removeSavedOrganization } = await import('@/lib/services/shortlist');

            const result = isSaving
                ? await saveOrganization(user.id, orgId)
                : await removeSavedOrganization(user.id, orgId);

            if (!result.success) {
                // Revert on error
                const revertedShortlist = new Set(shortlist);
                if (isSaving) {
                    revertedShortlist.delete(orgId);
                } else {
                    revertedShortlist.add(orgId);
                }
                setShortlist(revertedShortlist);
                toast.error(result.error || "Failed to update saved organizations");
            } else {
                toast.success(isSaving ? "Organization saved!" : "Organization removed from saved");
            }
        } catch (err) {
            // Revert on error
            const revertedShortlist = new Set(shortlist);
            if (isSaving) {
                revertedShortlist.delete(orgId);
            } else {
                revertedShortlist.add(orgId);
            }
            setShortlist(revertedShortlist);
            toast.error("An error occurred");
        } finally {
            setSavingOrgs(prev => {
                const updated = new Set(prev);
                updated.delete(orgId);
                return updated;
            });
        }
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
        <div className="min-h-screen bg-cream font-sans text-navy">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="font-serif text-3xl md:text-4xl text-navy mb-2 lg:mb-4">
                        {roleContext.title}
                    </h1>
                    <p className="text-base text-navy/70">
                        {roleContext.subtitle}
                    </p>
                </div>

                {/* NGO BLOCKING BANNER - Must complete setup */}
                {needsSetup && (
                    <div className="mb-6 drivya-card p-6 border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-center">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <h2 className="text-base font-bold text-foreground mb-1">Set up your NGO profile to find partners</h2>
                        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                            Tell us about your organization so we can show you relevant CSR partners and incubators.
                        </p>
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => router.push("/org-submit")}>
                            Complete Setup
                        </Button>
                    </div>
                )}

                {/* INCUBATOR SETUP PROMPT - Dismissible */}
                {showSetupPrompt && !dismissedSetupPrompt && (
                    <div className="mb-5 drivya-card p-4 border-l-4 border-l-sky-500">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-sky-100 dark:bg-sky-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-4 h-4 text-sky-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Complete your Incubator profile to unlock insights</p>
                                    <p className="text-xs text-muted-foreground">Save orgs, download PPTs, and see match scores.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white text-xs" onClick={() => router.push("/org-submit")}>Set Up</Button>
                                <Button size="sm" variant="ghost" className="p-1.5" onClick={() => { setDismissedSetupPrompt(true); localStorage.setItem("dismissedIncubatorSetup", "true"); }}>
                                    <X className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Guided First Match Intro - shows for first-time users */}
                {showGuidedIntro && (
                    <div className="mb-5 drivya-card p-5 border-primary/20 bg-primary/3">
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

                {/* Search and Filters - Horizontal Layout */}
                <div className="flex flex-col gap-4 mb-10">
                    <div className="relative group">
                        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gold group-focus-within:text-navy transition-colors opacity-70" />
                        <Input
                            placeholder="Search NGOs, CSRs, or Incubators..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-14 pr-4 py-8 rounded-xl border-none bg-white shadow-sm ring-1 ring-gold/20 focus-visible:ring-2 focus-visible:ring-gold outline-none transition-all placeholder:text-muted-foreground text-base"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={selectedFocusArea || "__all__"} onValueChange={(val) => setSelectedFocusArea(val === "__all__" ? "" : val)}>
                            <SelectTrigger className="w-fit gap-2 rounded-full border border-gold/20 bg-white hover:border-gold transition-colors px-5 py-2.5 h-auto text-sm font-medium focus:ring-0 shadow-sm text-navy">
                                <SelectValue placeholder="Focus Area" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">All Focus Areas</SelectItem>
                                {focusAreas.map(area => <SelectItem key={area} value={area}>{area}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedRegion || "__all__"} onValueChange={(val) => setSelectedRegion(val === "__all__" ? "" : val)}>
                            <SelectTrigger className="w-fit gap-2 rounded-full border border-gold/20 bg-white hover:border-gold transition-colors px-5 py-2.5 h-auto text-sm font-medium focus:ring-0 shadow-sm text-navy">
                                <SelectValue placeholder="Region" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">All Regions</SelectItem>
                                {regions.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as "alignment" | "name" | "recency")}>
                            <SelectTrigger className="w-fit gap-2 rounded-full border border-gold/20 bg-white hover:border-gold transition-colors px-5 py-2.5 h-auto text-sm font-medium lg:ml-auto focus:ring-0 shadow-sm text-navy">
                                <span className="text-navy/60 font-normal">Sort By:</span> <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="alignment">Alignment Score</SelectItem>
                                <SelectItem value="name">Name (A-Z)</SelectItem>
                                <SelectItem value="recency">Recently Added</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        {(query || selectedFocusArea || selectedRegion || sortBy !== "alignment") && (
                            <Button onClick={handleClearFilters} variant="ghost" size="sm" className="rounded-full text-navy hover:bg-gold/10 font-medium px-4">
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>

                {/* Results Grid */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl mb-6 shadow-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
                    </div>
                ) : results.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-xl border border-gold/20 border-dashed shadow-sm">
                        <div className="text-5xl mb-4 opacity-70">🔍</div>
                        <h3 className="text-xl font-serif font-bold text-navy mb-2">No organizations found</h3>
                        <p className="text-sm text-navy/70 mb-6 max-w-md mx-auto">
                            Try adjusting your search terms or clearing some filters to see more verified organizations.
                        </p>
                        <Button onClick={handleClearFilters} variant="outline" className="rounded-full border-gold/30 text-navy hover:bg-gold/10 px-6 font-medium">
                            Clear All Filters
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex justify-between items-end px-1">
                            <p className="text-sm text-navy/60 font-medium tracking-wide text-transform: uppercase">
                                Showing <span className="text-navy font-bold">{results.length}</span> Verified Partner{results.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
                            {results.map((org) => {
                                const matchResult = matchMap.get(org.id);
                                return (
                                    <div key={org.id} className="bg-white rounded-xl p-6 shadow-sm border border-gold/20 hover:shadow-lg hover:border-gold/40 transition-all duration-300 relative overflow-hidden flex flex-col group translate-y-0 hover:-translate-y-1">
                                        {/* Badge top right - Using drivya-demo gold accents */}
                                        {matchResult ? (
                                            <div className="absolute top-0 right-0 p-3 z-10">
                                                <span className="bg-gold/10 text-gold text-xs font-bold px-3 py-1.5 rounded-full border border-gold/30 flex items-center gap-1 shadow-sm backdrop-blur-md">
                                                    Match {matchResult.fitScore}%
                                                </span>
                                            </div>
                                        ) : org.alignmentScore >= 80 ? (
                                            <div className="absolute top-0 right-0 p-3 z-10">
                                                <span className="bg-gold text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                                                    ✨ Best Match
                                                </span>
                                            </div>
                                        ) : null}

                                        {/* Card Header & Logo */}
                                        <div className="flex items-start gap-4 mb-4 mt-2">
                                            <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center overflow-hidden border border-gold/20 flex-shrink-0 shadow-sm">
                                                <span className="font-serif text-2xl font-bold text-gold">{org.name.charAt(0)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0 pr-28 mt-1">
                                                <h3 className="font-bold text-navy text-lg mb-1 group-hover:text-gold transition-colors flex items-start gap-2">
                                                    <span className="line-clamp-2 break-words">
                                                        {org.name}
                                                    </span>
                                                    {org.verificationStatus === "verified" && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />}
                                                </h3>
                                                <div className="flex items-center gap-1 text-navy/60 text-xs font-medium">
                                                    <MapPin className="w-3.5 h-3.5 text-gold/80" />
                                                    <span className="truncate">{org.region}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Type & Lock Badge */}
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            <span className="px-2 py-0.5 bg-background border border-border rounded-md text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{org.type}</span>
                                            {!purchasedIds.has(org.id) && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-800 uppercase tracking-widest">
                                                    <Lock className="w-2.5 h-2.5" /> Locked
                                                </span>
                                             )}
                                        </div>

                                        <p className="text-sm text-navy/70 mb-5 line-clamp-3 leading-relaxed min-h-[60px]">
                                            {org.mission}
                                        </p>

                                        {/* Focus Area Tags */}
                                        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                                            {org.focusAreas?.slice(0, 3).map((area) => (
                                                <span key={area} className="px-3 py-1 bg-cream text-[10px] font-bold uppercase tracking-widest text-navy/80 rounded border border-gold/20 truncate max-w-full transition-colors hover:bg-gold/10">
                                                    {area}
                                                </span>
                                            ))}
                                            {org.focusAreas && org.focusAreas.length > 3 && (
                                                <span className="px-2 py-1 bg-cream text-[10px] font-bold uppercase tracking-widest text-navy/80 rounded border border-gold/10">
                                                    +{org.focusAreas.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        {/* Match Reasons Highlight */}
                                        {(() => {
                                            const matchReasons = generateMatchReasons(org, selectedFocusArea, selectedRegion);
                                            return matchReasons.length > 0 ? (
                                                <div className="bg-cream/50 rounded-lg p-3.5 mb-5 text-left border border-gold/10">
                                                    <h4 className="text-[10px] font-bold text-navy/60 mb-2 uppercase tracking-widest">Why it matches</h4>
                                                    <ul className="space-y-1.5">
                                                        {matchReasons.map((reason, idx) => (
                                                            <li key={idx} className="text-xs text-navy/80 flex items-start gap-2">
                                                                <span className="text-gold mt-0.5 flex-shrink-0 text-[10px]">◆</span>
                                                                <span className="line-clamp-1">{reason}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null;
                                        })()}

                                        {/* Action Buttons */}
                                        <div className="mt-auto flex flex-col gap-2.5 pt-4 border-t border-gold/10">
                                            <Button variant="default" className="w-full py-5 rounded-lg border-0 bg-navy hover:bg-navy/90 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 group/btn" asChild>
                                                <Link href={`/org/${org.id}`}>
                                                    View Full Profile
                                                    {!purchasedIds.has(org.id) ? (
                                                        <Lock className="w-4 h-4 opacity-50 ml-1" />
                                                    ) : (
                                                        <span className="opacity-0 -ml-5 group-hover/btn:opacity-100 group-hover/btn:ml-1 transition-all duration-300">→</span>
                                                    )}
                                                </Link>
                                            </Button>
                                            <div className="grid grid-cols-2 gap-2.5">
                                                <Button
                                                    variant={shortlist.has(org.id) ? "secondary" : "outline"}
                                                    className={`w-full py-4 rounded-lg font-bold text-xs transition-all shadow-sm ${shortlist.has(org.id) ? 'bg-gold border-gold text-white hover:bg-gold/90 hover:text-white' : 'bg-transparent border-gold/30 text-navy hover:bg-gold/10 hover:border-gold/50 hover:text-navy'}`}
                                                    onClick={() => toggleShortlist(org.id)}
                                                >
                                                    <Heart className="w-3.5 h-3.5 mr-1.5" fill={shortlist.has(org.id) ? "currentColor" : "none"} />
                                                    {shortlist.has(org.id) ? "Saved" : "Save"}
                                                </Button>
                                                <Button variant="outline" className="w-full py-4 rounded-lg bg-transparent border-gold/30 text-navy font-bold text-xs hover:bg-gold/10 hover:border-gold/50 transition-all shadow-sm group/site" asChild>
                                                    {org.website ? (
                                                        <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                                                            <ExternalLink className="w-3.5 h-3.5 mr-1.5 opacity-70 group-hover/site:opacity-100 transition-opacity" /> Website
                                                        </a>
                                                    ) : (
                                                        <button disabled className="opacity-50 cursor-not-allowed flex items-center justify-center">
                                                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Website
                                                        </button>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
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
