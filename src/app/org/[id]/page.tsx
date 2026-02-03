"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UpgradeRequired } from "@/components/UpgradeRequired";
import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/lib/stores/userStore";
import { trackUpgradePromptShown, trackUpgradeClicked } from "@/lib/analytics/paymentAnalytics";
import { initiateUnlock } from "@/lib/services/paymentTriggers";
import { SearchResult } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    ArrowLeft,
    CheckCircle2,
    MapPin,
    Target,
    AlertTriangle,
    XCircle,
    Lock,
    Heart,
    Ban,
    Send,
    Loader2,
    Share2,
    Download,
} from "lucide-react";
import { getOrganizationById } from "@/lib/services/organizations";

// =============================================================================
// VERDICT LOGIC
// =============================================================================

type Verdict = "worth-it" | "risky" | "avoid";

interface VerdictInfo {
    verdict: Verdict;
    label: string;
    description: string;
    icon: typeof CheckCircle2;
    colorClass: string;
    bgClass: string;
}

function getVerdict(alignmentScore: number): VerdictInfo {
    if (alignmentScore >= 75) {
        return {
            verdict: "worth-it",
            label: "Worth It",
            description: "Strong alignment signals suggest this is a good fit for outreach",
            icon: CheckCircle2,
            colorClass: "text-green-600 dark:text-green-400",
            bgClass: "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800",
        };
    }

    if (alignmentScore >= 55) {
        return {
            verdict: "risky",
            label: "Risky",
            description: "Mixed signals - proceed with research before reaching out",
            icon: AlertTriangle,
            colorClass: "text-amber-600 dark:text-amber-400",
            bgClass: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
        };
    }

    return {
        verdict: "avoid",
        label: "Avoid",
        description: "Low alignment - likely not a good use of your time",
        icon: XCircle,
        colorClass: "text-red-600 dark:text-red-400",
        bgClass: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800",
    };
}

function getVerdictReasons(org: SearchResult, verdict: Verdict): string[] {
    const reasons: string[] = [];

    if (org.region) {
        reasons.push(`Operates in ${org.region}`);
    }

    if (org.focusAreas && org.focusAreas.length > 0) {
        reasons.push(`Focus areas include ${org.focusAreas.slice(0, 2).join(" and ")}`);
    }

    if (org.verificationStatus === "verified") {
        reasons.push("Verified organization with confirmed details");
    } else {
        reasons.push("Organization details pending verification");
    }

    if (org.partnerHistory && org.partnerHistory.length > 0) {
        reasons.push(`Has prior partnerships with ${org.partnerHistory.length}+ organizations`);
    } else if (verdict === "worth-it") {
        reasons.push("Open to new partnership opportunities");
    }

    if (org.confidence && org.confidence >= 80) {
        reasons.push("High data confidence from multiple sources");
    }

    return reasons.slice(0, 4);
}

function getRisks(org: SearchResult): string[] {
    const risks: string[] = [];

    if (org.verificationStatus !== "verified") {
        risks.push("Organization details not yet verified");
    }

    if (!org.confidence || org.confidence < 70) {
        risks.push("Limited public information available");
    }

    if (!org.partnerHistory || org.partnerHistory.length === 0) {
        risks.push("No prior partnership history found");
    }

    if (!org.projects || org.projects.length === 0) {
        risks.push("No recent project activity documented");
    }

    if (risks.length < 2) {
        risks.push("Response time and engagement level unknown");
    }

    if (risks.length < 3) {
        risks.push("Contact preferences not publicly available");
    }

    return risks.slice(0, 4);
}

// =============================================================================
// LOCKED SECTION COMPONENT (Clickable)
// =============================================================================

interface LockedSectionProps {
    title: string;
    previewText?: string;
    onClick: () => void;
    isUnlocked: boolean;
}

function LockedSection({ title, previewText, onClick, isUnlocked }: LockedSectionProps) {
    if (isUnlocked) {
        // NGO users see unlocked placeholder content
        return (
            <div className="border border-border rounded-xl p-5 bg-card">
                <h3 className="font-semibold text-foreground mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground">
                    Full analysis available. Content coming soon.
                </p>
            </div>
        );
    }

    return (
        <button
            onClick={onClick}
            className="relative border border-border rounded-xl p-5 bg-muted/20 w-full text-left hover:bg-muted/30 transition-colors cursor-pointer group"
        >
            {/* Blur overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background rounded-xl flex flex-col items-center justify-center z-10 gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Click to unlock</span>
                <span className="text-xs text-muted-foreground">Premium content</span>
            </div>
            {/* Preview content */}
            <h3 className="font-semibold text-foreground mb-3">{title}</h3>
            {previewText ? (
                <p className="text-sm text-muted-foreground blur-[2px] select-none">
                    {previewText}
                </p>
            ) : (
                <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
            )}
        </button>
    );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function OrgDecisionPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();

    // User store - capability flags
    const canViewDeepAnalysis = useUserStore((s) => s.canViewDeepAnalysis());
    const canExportData = useUserStore((s) => s.canExportData());
    const isNGO = useUserStore((s) => s.isNGO());
    const canViewPremiumContent = useUserStore((s) => s.canViewPremiumContent(id));
    const unlockOrganization = useUserStore((s) => s.unlockOrganization);

    const [org, setOrg] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [isIgnored, setIsIgnored] = useState(false);

    // Upgrade modal state
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeModalConfig, setUpgradeModalConfig] = useState({
        title: "",
        description: "",
    });

    useEffect(() => {
        if (!id) return;

        const fetchOrganization = async () => {
            try {
                setLoading(true);
                const organization = await getOrganizationById(id);

                if (!organization) {
                    throw new Error("Organization not found");
                }

                setOrg(organization);
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load organization"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrganization();
    }, [id]);

    // ==========================================================================
    // PAYMENT TRIGGER: Locked Section Click
    // ==========================================================================
    const handleLockedSectionClick = () => {
        if (canViewDeepAnalysis) return; // NGO users bypass

        trackUpgradePromptShown('org_locked_section');
        setUpgradeModalConfig({
            title: "Unlock full decision confidence",
            description: "Get access to partnership history, engagement scores, and detailed reasoning to make better decisions.",
        });
        setShowUpgradeModal(true);
    };

    // ==========================================================================
    // PAYMENT TRIGGER: Export/Share
    // ==========================================================================
    const handleExportClick = () => {
        if (canExportData) {
            toast.success("Export feature coming soon!");
            return;
        }

        trackUpgradePromptShown('export_attempt');
        setUpgradeModalConfig({
            title: "Unlock export features",
            description: "Export organization data and analysis to share with your team.",
        });
        setShowUpgradeModal(true);
    };

    const handleShareClick = () => {
        if (canExportData) {
            toast.success("Share feature coming soon!");
            return;
        }

        trackUpgradePromptShown('share_attempt');
        setUpgradeModalConfig({
            title: "Unlock sharing features",
            description: "Share organization insights with your team members.",
        });
        setShowUpgradeModal(true);
    };

    const handleUpgradeClick = async () => {
        trackUpgradeClicked('org_locked_section');

        if (!user) {
            toast.error("Please sign in to unlock content");
            return;
        }

        // Attempt unlock (currently stub)
        const result = await initiateUnlock({
            type: 'single_org',
            orgId: id,
            userId: user.id,
        });

        if (result.success) {
            unlockOrganization(id);
            toast.success("Organization unlocked!");
            setShowUpgradeModal(false);
        } else {
            toast.info(result.message);
        }
    };

    // Action handlers
    const handleReachOut = () => {
        if (!isAuthenticated) {
            toast.info("Sign in to start outreach", {
                action: {
                    label: "Sign In",
                    onClick: () => router.push(`/auth?returnTo=${encodeURIComponent(window.location.pathname)}`),
                },
            });
            return;
        }
        toast.success("Outreach initiated! Check your email for next steps.");
    };

    const handleSave = () => {
        if (!isAuthenticated) {
            toast.info("Sign in to save organizations", {
                action: {
                    label: "Sign In",
                    onClick: () => router.push(`/auth?returnTo=${encodeURIComponent(window.location.pathname)}`),
                },
            });
            return;
        }
        setIsSaved(!isSaved);
        setIsIgnored(false);
        toast.success(isSaved ? "Removed from saved" : "Saved for later");
    };

    const handleIgnore = () => {
        if (!isAuthenticated) {
            toast.info("Sign in to manage organizations", {
                action: {
                    label: "Sign In",
                    onClick: () => router.push(`/auth?returnTo=${encodeURIComponent(window.location.pathname)}`),
                },
            });
            return;
        }
        setIsIgnored(!isIgnored);
        setIsSaved(false);
        toast.success(isIgnored ? "Removed from ignored" : "Added to ignored list");
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <Footer />
            </div>
        );
    }

    // Error state
    if (error || !org) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 container mx-auto px-4 py-20 text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                        {error || "Organization not found"}
                    </h1>
                    <Button onClick={() => router.push("/explore")}>
                        Back to Explore
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    const verdictInfo = getVerdict(org.alignmentScore || 0);
    const verdictReasons = getVerdictReasons(org, verdictInfo.verdict);
    const risks = getRisks(org);
    const VerdictIcon = verdictInfo.icon;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-6"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                {/* SECTION 1: TOP SUMMARY */}
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                {org.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="default">{org.type}</Badge>
                                <Badge variant="outline" className="gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {org.region}
                                </Badge>
                                {org.focusAreas.slice(0, 2).map((area) => (
                                    <Badge key={area} variant="secondary">
                                        {area}
                                    </Badge>
                                ))}
                                {org.focusAreas.length > 2 && (
                                    <Badge variant="outline">+{org.focusAreas.length - 2}</Badge>
                                )}
                            </div>
                        </div>
                        {/* Export/Share buttons */}
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={handleShareClick}>
                                <Share2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleExportClick}>
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Verdict Badge */}
                    <div className={`rounded-xl p-5 border-2 ${verdictInfo.bgClass}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-white dark:bg-background/50`}>
                                <VerdictIcon className={`w-6 h-6 ${verdictInfo.colorClass}`} />
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold ${verdictInfo.colorClass}`}>
                                    {verdictInfo.label}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {verdictInfo.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: WHY THIS VERDICT */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">
                            Why this verdict
                        </h2>
                    </div>
                    <ul className="space-y-2">
                        {verdictReasons.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {idx + 1}
                                </span>
                                <span className="text-foreground">{reason}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* SECTION 3: RISKS & UNKNOWNS */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg font-semibold text-foreground">
                            Risks & Unknowns
                        </h2>
                    </div>
                    <div className="border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 bg-amber-50/50 dark:bg-amber-900/10">
                        <ul className="space-y-2">
                            {risks.map((risk, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm">
                                    <span className="text-amber-500 mt-0.5">•</span>
                                    <span className="text-foreground/80">{risk}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* SECTION 4: LOCKED SECTIONS (with payment trigger) */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold text-foreground">
                            Deep Analysis
                        </h2>
                        {!isNGO && <Badge variant="outline" className="text-xs">Premium</Badge>}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <LockedSection
                            title="Past CSR / Partnership History"
                            previewText="Detailed partnership records with major funders including UNICEF, UNDP, and corporate CSR programs. Track record of successful collaborations and funding received."
                            onClick={handleLockedSectionClick}
                            isUnlocked={canViewDeepAnalysis}
                        />
                        <LockedSection
                            title="Engagement Confidence Score"
                            previewText="AI-powered engagement score (0-100) based on response time, communication quality, and past collaboration success rates. Includes engagement patterns and best contact times."
                            onClick={handleLockedSectionClick}
                            isUnlocked={canViewDeepAnalysis}
                        />
                        <LockedSection
                            title="Why This Score? (Deep Reasoning)"
                            previewText="Comprehensive breakdown of alignment factors including mission overlap, geographic synergy, capacity match, and strategic fit. Detailed reasoning behind the match score."
                            onClick={handleLockedSectionClick}
                            isUnlocked={canViewDeepAnalysis}
                        />
                        <LockedSection
                            title="Suggested Outreach Strategy"
                            previewText="Personalized outreach recommendations including best contact methods, optimal timing, key talking points, and proposal structure based on past successful partnerships."
                            onClick={handleLockedSectionClick}
                            isUnlocked={canViewDeepAnalysis}
                        />
                    </div>
                </div>

                {/* SECTION 5: NEXT ACTIONS */}
                <div className="border-t border-border pt-8">
                    {/* Unlock CTA for non-NGO users */}
                    {!isNGO && !canViewPremiumContent && (
                        <div className="mb-6 p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Lock className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground mb-1">
                                        Unlock full organization details
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Get access to partnership history, engagement scores, detailed reasoning, and outreach strategies
                                    </p>
                                    <Button onClick={() => {
                                        handleLockedSectionClick();
                                    }} className="gap-2">
                                        <Lock className="w-4 h-4" />
                                        Unlock This Organization
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <h2 className="text-lg font-semibold text-foreground mb-4">
                        What would you like to do?
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        <Button size="lg" onClick={handleReachOut} className="gap-2">
                            <Send className="w-4 h-4" />
                            Reach Out
                        </Button>
                        <Button
                            size="lg"
                            variant={isSaved ? "default" : "outline"}
                            onClick={handleSave}
                            className="gap-2"
                        >
                            <Heart
                                className="w-4 h-4"
                                fill={isSaved ? "currentColor" : "none"}
                            />
                            {isSaved ? "Saved" : "Save"}
                        </Button>
                        <Button
                            size="lg"
                            variant={isIgnored ? "destructive" : "outline"}
                            onClick={handleIgnore}
                            className="gap-2"
                        >
                            <Ban className="w-4 h-4" />
                            {isIgnored ? "Ignored" : "Ignore"}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Your decision helps improve recommendations for everyone.
                    </p>
                </div>
            </main>

            <Footer />

            {/* Upgrade Required Modal */}
            <UpgradeRequired
                open={showUpgradeModal}
                onOpenChange={setShowUpgradeModal}
                title={upgradeModalConfig.title}
                description={upgradeModalConfig.description}
                onUpgradeClick={handleUpgradeClick}
            />
        </div>
    );
}
