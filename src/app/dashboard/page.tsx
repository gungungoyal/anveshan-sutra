"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
    ArrowRight, Loader2, Target, Clock, Star, AlertCircle,
    Building2, Sparkles, Search, Bookmark, TrendingUp, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { searchOrganizations } from "@/lib/services/organizations";
import { SearchResult } from "@shared/api";
import { getFitScoreDisplay, getScoreColor } from "@/lib/utils/fitScore";
import { getProjectExpectation } from "@/lib/services/projectExpectations";

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

function generateMatchReason(org: SearchResult): string {
    if (org.focusAreas && org.focusAreas.length > 0) return `Focus area: ${org.focusAreas[0]}`;
    if (org.region) return `Active in ${org.region}`;
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
        isSaved: false,
    };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FitScoreBadge({ score, isSecondary }: { score: number; isSecondary?: boolean }) {
    const { user } = useAuth();
    const isCSR = user?.role === "csr";

    if (isCSR) {
        const fitDisplay = getFitScoreDisplay(score);
        return (
            <span className={`pill text-[11px] ${isSecondary ? "opacity-70 " : ""}${fitDisplay.color} ${fitDisplay.bgColor}`}>
                {fitDisplay.label}
            </span>
        );
    }
    return (
        <span className={`pill text-[11px] ${isSecondary ? "opacity-70 " + getScoreColor(score) : getScoreColor(score)}`}>
            {score}%
        </span>
    );
}

function OrgCard({ org, variant = "primary" }: { org: DashboardOrg; variant?: "primary" | "secondary" }) {
    const isSecondary = variant === "secondary";
    return (
        <Link href={`/org/${org.id}`} className="block group">
            <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${isSecondary
                    ? "border-border/50 hover:border-border hover:bg-secondary/30"
                    : "border-border hover:border-primary/30 hover:bg-primary/3 hover:shadow-card"
                }`}>
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isSecondary ? "bg-secondary" : "gradient-bg shadow-blue"
                    }`}>
                    <Building2 className={`w-4 h-4 ${isSecondary ? "text-muted-foreground" : "text-white"}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-semibold truncate transition-colors ${isSecondary ? "text-foreground/80 group-hover:text-foreground" : "text-foreground group-hover:text-primary"
                            }`}>
                            {org.name}
                        </h3>
                        {isSecondary && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 flex-shrink-0 uppercase tracking-wide">
                                New
                            </span>
                        )}
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${isSecondary ? "text-muted-foreground/60" : "text-muted-foreground/80"}`}>
                        {org.type} · {org.region}
                    </p>
                    <p className={`text-xs truncate mt-0.5 ${isSecondary ? "text-muted-foreground/45" : "text-muted-foreground/60"}`}>
                        {org.reason}
                    </p>
                </div>

                {/* Score + arrow */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <FitScoreBadge score={org.fitScore} isSecondary={isSecondary} />
                    <ChevronRight className={`w-3.5 h-3.5 transition-all ${isSecondary ? "text-muted-foreground/40 group-hover:text-muted-foreground" : "text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5"
                        }`} />
                </div>
            </div>
        </Link>
    );
}

function EmptyState({ icon: Icon, title, subtitle, action }: {
    icon: React.ElementType; title: string; subtitle: string; action?: { label: string; href: string };
}) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
                <Icon className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground text-sm mb-1">{title}</p>
            <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>
            {action && (
                <Link href={action.href}>
                    <Button variant="outline" size="sm" className="text-xs">{action.label}</Button>
                </Link>
            )}
        </div>
    );
}

function Section({ title, icon: Icon, iconBg, children, action }: {
    title: string; icon: React.ElementType; iconBg: string; children: React.ReactNode;
    action?: { label: string; href: string };
}) {
    return (
        <div className="drivya-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
                <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h2 className="font-bold text-foreground text-sm">{title}</h2>
                </div>
                {action && (
                    <Link href={action.href} className="text-xs text-primary hover:underline font-medium flex items-center gap-0.5">
                        See all <ChevronRight className="w-3 h-3" />
                    </Link>
                )}
            </div>
            <div className="p-3 space-y-2">{children}</div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();

    const [organizations, setOrganizations] = useState<DashboardOrg[]>([]);
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasProjectExpectations, setHasProjectExpectations] = useState<boolean | null>(null);

    const isCSR = user?.role === "csr";

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/auth?returnTo=/dashboard");
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        const checkProjectExpectations = async () => {
            if (!isAuthenticated || !user) return;
            if (isCSR) {
                try {
                    const expectation = await getProjectExpectation(user.id);
                    setHasProjectExpectations(!!expectation);
                } catch {
                    setHasProjectExpectations(false);
                }
            } else {
                setHasProjectExpectations(true);
            }
        };
        checkProjectExpectations();
    }, [isAuthenticated, isCSR, user]);

    const fetchOrgs = async () => {
        if (!isAuthenticated || (isCSR && hasProjectExpectations === false)) return;
        try {
            setIsLoadingOrgs(true);
            setError(null);
            const result = await searchOrganizations({});
            if (result.success && result.results) {
                setOrganizations(result.results.map(mapToDisplayOrg));
            } else {
                setError("Unable to load organizations. Please try again.");
            }
        } catch {
            setError("An unexpected error occurred. Please check your connection.");
        } finally {
            setIsLoadingOrgs(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && hasProjectExpectations) fetchOrgs();
        else if (isAuthenticated && hasProjectExpectations === false) setIsLoadingOrgs(false);
    }, [isAuthenticated, hasProjectExpectations]);

    // ── Loading / Auth gates ──
    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isCSR && hasProjectExpectations === null) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // CSR gate
    if (isCSR && hasProjectExpectations === false) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="drivya-card max-w-md w-full p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-5 shadow-blue">
                            <Target className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-foreground mb-2">
                            Start with your project expectations
                        </h1>
                        <p className="text-sm text-muted-foreground mb-6">
                            We need this to evaluate NGOs realistically and rank them by actual fit.
                        </p>
                        <Link href="/project/setup">
                            <Button size="lg" className="gradient-bg border-0 text-white shadow-blue hover:shadow-blue-lg gap-2 w-full">
                                Define Project Expectations <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Derived org lists
    const highFitOrgs = [...organizations].sort((a, b) => b.fitScore - a.fitScore).slice(0, 5);
    const highFitIds = new Set(highFitOrgs.map((o) => o.id));
    const recentOrgs = [...organizations]
        .filter((o) => !highFitIds.has(o.id))
        .sort((a, b) => (a.addedAt && b.addedAt ? new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime() : 0))
        .slice(0, 5);
    const savedOrgs = organizations.filter((o) => o.isSaved).slice(0, 5);
    const lowPriorityOrgs = organizations.filter((o) => o.fitScore < 50).slice(0, 5);

    // Quick stat values
    const totalOrgs = organizations.length;
    const highFitCount = organizations.filter((o) => o.fitScore >= 70).length;
    const savedCount = savedOrgs.length;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">

                {/* ── Welcome Banner ── */}
                <div className="relative overflow-hidden rounded-2xl gradient-bg p-6 mb-6 shadow-blue-lg">
                    {/* Decorative blobs */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-16 -translate-y-10" />
                    <div className="absolute bottom-0 right-20 w-24 h-24 bg-white/5 rounded-full translate-y-8" />

                    <div className="relative">
                        <p className="text-white/70 text-sm font-medium mb-0.5">Welcome back 👋</p>
                        <h1 className="text-2xl font-extrabold text-white mb-1">
                            {user?.organization_name || user?.name || "Your Workspace"}
                        </h1>
                        <p className="text-white/75 text-sm">
                            Here&apos;s what you should look at today.
                        </p>
                    </div>
                </div>

                {/* ── Quick Stats ── */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: "Total Orgs", value: totalOrgs, icon: Building2, color: "bg-blue-500" },
                        { label: "High-fit", value: highFitCount, icon: TrendingUp, color: "bg-green-500" },
                        { label: "Saved", value: savedCount, icon: Bookmark, color: "bg-amber-500" },
                    ].map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="drivya-card p-3.5 flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-lg font-extrabold text-foreground leading-none">{stat.value}</p>
                                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Quick Actions ── */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <Link href="/explore" className="drivya-card p-4 flex items-center gap-3 group hover:border-primary/40">
                        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0 shadow-blue group-hover:shadow-blue-lg transition-shadow">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-foreground text-sm">Explore Partners</p>
                            <p className="text-xs text-muted-foreground">Find & filter organizations</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                    </Link>
                    <Link href="/shortlist" className="drivya-card p-4 flex items-center gap-3 group hover:border-amber-300">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Bookmark className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-foreground text-sm">Saved</p>
                            <p className="text-xs text-muted-foreground">Review your shortlist</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-amber-500 transition-colors" />
                    </Link>
                </div>

                {/* ── Error Banner ── */}
                {error && !isLoadingOrgs && (
                    <div className="mb-5 p-4 rounded-xl border border-destructive/40 bg-destructive/8 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-semibold text-destructive text-sm mb-1">Failed to load organizations</p>
                            <p className="text-xs text-destructive/80">{error}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchOrgs} className="flex-shrink-0 text-xs">
                            Retry
                        </Button>
                    </div>
                )}

                {/* ── Content Area ── */}
                {isLoadingOrgs ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="w-7 h-7 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
                    </div>
                ) : !error && (
                    <>
                        {/* Dashboard Grid */}
                        <div className="grid gap-4 lg:grid-cols-2">
                            <Section
                                title="High-fit Organizations"
                                icon={Target}
                                iconBg="bg-green-500"
                                action={{ label: "See all", href: "/explore" }}
                            >
                                {highFitOrgs.length > 0 ? (
                                    highFitOrgs.map((org) => <OrgCard key={org.id} org={org} variant="primary" />)
                                ) : (
                                    <EmptyState icon={Sparkles} title="No high-fit matches yet" subtitle="We're analyzing organizations for you" action={{ label: "Browse All", href: "/explore" }} />
                                )}
                            </Section>

                            <Section
                                title="Recently Added"
                                icon={Clock}
                                iconBg="bg-primary"
                                action={{ label: "See all", href: "/explore?sort=recency" }}
                            >
                                {recentOrgs.length > 0 ? (
                                    recentOrgs.map((org) => <OrgCard key={org.id} org={org} variant="secondary" />)
                                ) : (
                                    <EmptyState icon={Clock} title="No recent opportunities" subtitle="Check back for newly added organizations" />
                                )}
                            </Section>

                            <Section
                                title="Saved Organizations"
                                icon={Star}
                                iconBg="bg-amber-500"
                                action={{ label: "View saved", href: "/shortlist" }}
                            >
                                {savedOrgs.length > 0 ? (
                                    savedOrgs.map((org) => <OrgCard key={org.id} org={org} />)
                                ) : (
                                    <EmptyState icon={Star} title="Nothing saved yet" subtitle="Save organizations you want to revisit" action={{ label: "Find Organizations", href: "/explore" }} />
                                )}
                            </Section>

                            <Section
                                title="Low Priority"
                                icon={AlertCircle}
                                iconBg="bg-slate-400"
                            >
                                {lowPriorityOrgs.length > 0 ? (
                                    lowPriorityOrgs.map((org) => <OrgCard key={org.id} org={org} variant="secondary" />)
                                ) : (
                                    <EmptyState icon={AlertCircle} title="All caught up!" subtitle="No low-priority items to review" />
                                )}
                            </Section>
                        </div>

                        {/* Bottom CTA */}
                        <div className="mt-6 text-center">
                            <Link href="/explore">
                                <Button variant="outline" className="gap-2 rounded-xl font-semibold">
                                    See all matches <ArrowRight className="w-4 h-4" />
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
