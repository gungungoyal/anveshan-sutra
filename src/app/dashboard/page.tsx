"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Loader2,
    Target,
    Clock,
    Star,
    AlertCircle,
    Building2,
    Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { searchOrganizations } from "@/lib/services/organizations";
import { SearchResult } from "@shared/api";

// ============================================================================
// TYPES
// ============================================================================

interface DashboardOrg {
    id: string;
    name: string;
    type: string;
    region: string;
    fitScore: number;
    reason: string;
    addedAt?: string;
    isSaved?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getScoreColor(score: number): string {
    if (score >= 70) return "text-green-600 bg-green-100 dark:bg-green-900/30";
    if (score >= 50) return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
    return "text-red-600 bg-red-100 dark:bg-red-900/30";
}

function generateMatchReason(org: SearchResult): string {
    // Generate a contextual reason based on org attributes
    if (org.focusAreas && org.focusAreas.length > 0) {
        return `Focus area: ${org.focusAreas[0]}`;
    }
    if (org.region) {
        return `Active in ${org.region}`;
    }
    return `${org.type} organization`;
}

function mapToDisplayOrg(org: SearchResult): DashboardOrg {
    return {
        id: org.id,
        name: org.name,
        type: org.type,
        region: org.region || "India",
        fitScore: org.alignmentScore || org.confidence || 0,
        reason: generateMatchReason(org),
        isSaved: false, // TODO: Check against user's shortlist
    };
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Organization Card - Links to /org/[id]
 * @param variant - 'primary' for high-fit (full emphasis), 'secondary' for recently added (de-emphasized)
 */
function OrgCard({ org, variant = "primary" }: { org: DashboardOrg; variant?: "primary" | "secondary" }) {
    const isSecondary = variant === "secondary";

    return (
        <Link href={`/org/${org.id}`} className="block">
            <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer group ${isSecondary
                ? "border-border/60 bg-muted/30 hover:bg-muted/50"
                : "border-border hover:bg-muted/50"
                }`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Icon - slightly smaller for secondary */}
                    <div className={`rounded-lg flex items-center justify-center flex-shrink-0 ${isSecondary
                        ? "w-8 h-8 bg-muted"
                        : "w-9 h-9 bg-gradient-to-br from-primary/80 to-primary"
                        }`}>
                        <Building2 className={`${isSecondary
                            ? "w-4 h-4 text-muted-foreground"
                            : "w-4.5 h-4.5 text-primary-foreground"
                            }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                        {/* Name - reduced from font-medium to text-sm font-medium */}
                        <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-medium truncate transition-colors ${isSecondary
                                ? "text-foreground/80 group-hover:text-foreground"
                                : "text-foreground group-hover:text-primary"
                                }`}>
                                {org.name}
                            </h3>
                            {/* "New" indicator for secondary variant */}
                            {isSecondary && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 flex-shrink-0">
                                    New
                                </span>
                            )}
                        </div>
                        {/* Metadata - reduced contrast */}
                        <p className={`text-xs truncate ${isSecondary
                            ? "text-muted-foreground/60"
                            : "text-muted-foreground/80"
                            }`}>
                            {org.type} • {org.region}
                        </p>
                        {/* Reason - further reduced contrast */}
                        <p className={`text-xs mt-0.5 truncate ${isSecondary
                            ? "text-muted-foreground/50"
                            : "text-muted-foreground/70"
                            }`}>
                            {org.reason}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0 ml-2">
                    {/* Score badge - slightly smaller */}
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${isSecondary
                        ? "opacity-70 " + getScoreColor(org.fitScore)
                        : getScoreColor(org.fitScore)
                        }`}>
                        {org.fitScore}%
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 transition-colors ${isSecondary
                        ? "text-muted-foreground/50 group-hover:text-muted-foreground"
                        : "text-muted-foreground group-hover:text-primary"
                        }`} />
                </div>
            </div>
        </Link>
    );
}

/**
 * Empty State - Shown when no organizations in a section
 */
function EmptyState({
    icon: Icon,
    title,
    subtitle,
    action,
}: {
    icon: typeof Target;
    title: string;
    subtitle: string;
    action?: { label: string; href: string };
}) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Icon className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">{title}</p>
            <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
            {action && (
                <Link href={action.href}>
                    <Button variant="outline" size="sm">
                        {action.label}
                    </Button>
                </Link>
            )}
        </div>
    );
}

/**
 * Section - Wrapper for each decision category
 */
function Section({
    title,
    icon: Icon,
    iconColor,
    children,
}: {
    title: string;
    icon: typeof Target;
    iconColor: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <Icon className={`w-5 h-5 ${iconColor}`} />
                <h2 className="font-semibold text-foreground">{title}</h2>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================

/**
 * Dashboard - Decision Workspace
 *
 * Answers: "What should I look at today?"
 * Shows prioritized organization lists, NOT a navigation hub.
 */
export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();

    const [organizations, setOrganizations] = useState<DashboardOrg[]>([]);
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Redirect to auth if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/auth?returnTo=/dashboard");
        }
    }, [authLoading, isAuthenticated, router]);

    // Fetch organizations when authenticated
    const fetchOrgs = async () => {
        if (!isAuthenticated) return;

        try {
            setIsLoadingOrgs(true);
            setError(null);
            const result = await searchOrganizations({});

            if (result.success && result.results) {
                const mapped = result.results.map(mapToDisplayOrg);
                setOrganizations(mapped);
            } else {
                // Handle API error
                setError('Unable to load organizations. Please try again.');
            }
        } catch (error) {
            console.error("Failed to fetch organizations:", error);
            setError('An unexpected error occurred. Please check your connection and try again.');
        } finally {
            setIsLoadingOrgs(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrgs();
        }
    }, [isAuthenticated]);

    // Loading state
    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Derive High-fit Organizations: sort by fitScore (descending), take top 5
    const highFitOrgs = [...organizations]
        .sort((a, b) => b.fitScore - a.fitScore)
        .slice(0, 5);

    // Build a Set of high-fit org IDs for O(1) exclusion lookup
    const highFitIds = new Set(highFitOrgs.map((org) => org.id));

    // Derive Recently Added: exclude high-fit orgs, sort by addedAt (descending), take top 5
    // Note: If addedAt is unavailable, we preserve the original order (assumed to be by recency)
    const recentOrgs = [...organizations]
        .filter((org) => !highFitIds.has(org.id))
        .sort((a, b) => {
            // Sort by addedAt if available, otherwise preserve order
            if (a.addedAt && b.addedAt) {
                return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
            }
            return 0;
        })
        .slice(0, 5);
    const savedOrgs = organizations.filter((o) => o.isSaved).slice(0, 5);
    const lowPriorityOrgs = organizations.filter((o) => o.fitScore < 50).slice(0, 5);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        What should I look at today?
                    </h1>
                    <p className="text-muted-foreground">
                        Your prioritized list of organizations to review
                    </p>
                </div>

                {/* Error state */}
                {error && !isLoadingOrgs && (
                    <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium text-destructive mb-1">Failed to load organizations</p>
                                <p className="text-sm text-destructive/80">{error}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchOrgs}
                                className="flex-shrink-0"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}

                {/* Loading state for organizations */}
                {isLoadingOrgs ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="ml-3 text-muted-foreground">Loading organizations...</span>
                    </div>
                ) : !error && (
                    <>
                        {/* Dashboard Grid */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* High-fit Organizations */}
                            <Section title="High-fit Organizations" icon={Target} iconColor="text-green-600">
                                {highFitOrgs.length > 0 ? (
                                    <div className="space-y-3">
                                        {highFitOrgs.map((org) => (
                                            <OrgCard key={org.id} org={org} variant="primary" />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={Sparkles}
                                        title="No high-fit matches yet"
                                        subtitle="We're analyzing organizations for you"
                                        action={{ label: "Browse All", href: "/explore" }}
                                    />
                                )}
                            </Section>

                            {/* Recently Added */}
                            <Section title="Recently Added" icon={Clock} iconColor="text-blue-600">
                                {recentOrgs.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentOrgs.map((org) => (
                                            <OrgCard key={org.id} org={org} variant="secondary" />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={Clock}
                                        title="No recent opportunities"
                                        subtitle="Check back for newly added organizations"
                                    />
                                )}
                            </Section>

                            {/* Saved Organizations */}
                            <Section title="Saved Organizations" icon={Star} iconColor="text-amber-500">
                                {savedOrgs.length > 0 ? (
                                    <div className="space-y-3">
                                        {savedOrgs.map((org) => (
                                            <OrgCard key={org.id} org={org} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={Star}
                                        title="Nothing saved yet"
                                        subtitle="Save organizations you want to revisit"
                                        action={{ label: "Your Saved Organizations", href: "/explore" }}
                                    />
                                )}
                            </Section>

                            {/* Low Priority */}
                            <Section title="Low Priority" icon={AlertCircle} iconColor="text-muted-foreground">
                                {lowPriorityOrgs.length > 0 ? (
                                    <div className="space-y-3">
                                        {lowPriorityOrgs.map((org) => (
                                            <OrgCard key={org.id} org={org} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={AlertCircle}
                                        title="All caught up!"
                                        subtitle="No low-priority items to review"
                                    />
                                )}
                            </Section>
                        </div>

                        {/* See All Matches Link */}
                        <div className="mt-8 text-center">
                            <Link href="/explore">
                                <Button variant="outline" className="gap-2">
                                    See all matches
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
