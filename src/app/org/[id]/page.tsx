"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MatchExplanation from "@/components/MatchExplanation";
import AlignmentScoreBreakdown from "@/components/AlignmentScoreBreakdown";
import AuthPrompt from "@/components/AuthPrompt";
import { CollaborationOutcomeFeedback, CommunitySignals } from "@/components/feedback";
import PaymentModal from "@/components/PaymentModal";
import LockedContentOverlay from "@/components/LockedContentOverlay";
import { useAuth } from "@/hooks/useAuth";
import { useCsrProjectSetupGuard } from "@/hooks/useCsrProjectSetupGuard";
import { usePurchaseCheck } from "@/hooks/usePurchase";
import { SearchResult, Organization } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getFitScoreDisplay } from "@/lib/utils/fitScore";
import {
    Heart,
    ExternalLink,
    ArrowLeft,
    CheckCircle2,
    MapPin,
    Briefcase,
    Award,
    Lightbulb,
    Lock,
    Mail,
    StickyNote,
    ShieldAlert,
    ThumbsDown,
    Users,
    Globe,
    FileText,
    Target,
    Wallet,
} from "lucide-react";
import { getOrganizationById } from "@/lib/services/organizations";
import { computeMatch, MatchResult, getMatchLevelStyle, DimensionResult } from "@/lib/utils/matchEngine";
import { getProjectExpectation, ProjectExpectation } from "@/lib/services/projectExpectations";


// TODO: This page was moved from /organization/[id] to /org/[id]
// TODO: Add server-side auth gating in Phase 2

// ============================================================
// DECISION SCREEN COMPONENT (inline — CSR only)
// ============================================================
function DecisionScreen({
    matchResult,
    onShortlist,
    onDismiss,
    isShortlisted,
}: {
    matchResult: MatchResult;
    onShortlist: () => void;
    onDismiss: () => void;
    isShortlisted: boolean;
}) {
    const style = getMatchLevelStyle(matchResult.matchLevel);

    const dimensionRows: { icon: React.ReactNode; label: string; result: DimensionResult }[] = [
        { icon: <Users className="w-4 h-4" />, label: "Capacity", result: matchResult.dimensions.capacity },
        { icon: <Globe className="w-4 h-4" />, label: "Geography", result: matchResult.dimensions.geography },
        { icon: <FileText className="w-4 h-4" />, label: "Reporting", result: matchResult.dimensions.reporting },
        { icon: <Target className="w-4 h-4" />, label: "Program Fit", result: matchResult.dimensions.program },
        { icon: <Wallet className="w-4 h-4" />, label: "Budget Realism", result: matchResult.dimensions.budget },
    ];

    return (
        <Card className={`mb-8 border-2 ${style.border} ${style.bg}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Decision Analysis — vs Your Project</CardTitle>
                    <div className="flex items-center gap-3">
                        <span className={`text-3xl font-bold ${style.text}`}>{matchResult.fitScore}%</span>
                        <Badge className={style.badge}>{matchResult.matchLevel}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Dimension rows */}
                <div className="space-y-2">
                    {dimensionRows.map(({ icon, label, result }) => (
                        <div key={label} className="flex items-start gap-3">
                            <span className="text-muted-foreground mt-0.5">{icon}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground w-[100px] shrink-0">{label}</span>
                                    <span className="text-base">{result.status}</span>
                                    <span className="text-sm text-foreground font-medium truncate">{result.label}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 ml-[112px]">{result.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Risk flags */}
                {matchResult.riskFlags.length > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldAlert className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                {matchResult.riskFlags.length} risk{matchResult.riskFlags.length > 1 ? "s" : ""} flagged
                            </span>
                        </div>
                        <ul className="space-y-1">
                            {matchResult.riskFlags.map((flag, i) => (
                                <li key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                                    <span className="mt-0.5">•</span>
                                    <span>{flag}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Budget realism call-out */}
                {matchResult.budgetRealism.isBelowRange && (
                    <div className="mt-2 text-xs text-muted-foreground bg-background/80 rounded px-3 py-2 border border-border">
                        <span className="font-semibold">Budget note:</span> Estimated cost ₹{matchResult.budgetRealism.realisticRange[0].toLocaleString()}–₹{matchResult.budgetRealism.realisticRange[1].toLocaleString()} per beneficiary for this geography. Consider increasing your per-beneficiary budget before engaging.
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        className="flex-1"
                        variant={isShortlisted ? "default" : "outline"}
                        onClick={onShortlist}
                    >
                        <Heart className="w-4 h-4 mr-2" fill={isShortlisted ? "currentColor" : "none"} />
                        {isShortlisted ? "Shortlisted" : "Shortlist"}
                    </Button>
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 text-muted-foreground"
                        onClick={onDismiss}
                    >
                        <ThumbsDown className="w-4 h-4" />
                        Not a fit
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function OrgProfileDetail() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    const isCSR = user?.role === 'csr';

    // ===== CSR PROJECT SETUP GUARD =====
    // Redirect CSR users to /project/setup if they haven't defined project expectations
    const { isCheckingSetup, needsProjectSetup } = useCsrProjectSetupGuard();

    const [org, setOrg] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isShortlisted, setIsShortlisted] = useState(false);
    const [showOutcomeFeedback, setShowOutcomeFeedback] = useState(false);
    const [feedbackTrigger, setFeedbackTrigger] = useState<"view_profile" | "download_ppt" | "shortlist">("view_profile");
    const [privateNotes, setPrivateNotes] = useState("");
    const [notesLoading, setNotesLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // ===== CSR MATCHING STATE =====
    const [csrExpectation, setCsrExpectation] = useState<ProjectExpectation | null>(null);

    // Check if user has purchased this organization
    const { isPurchased, isLoading: isPurchaseLoading } = usePurchaseCheck(id || "");

    useEffect(() => {
        if (!id) return;

        const fetchOrganization = async () => {
            try {
                setLoading(true);
                const org = await getOrganizationById(id);

                if (!org) {
                    throw new Error("Organization not found");
                }

                setOrg(org);
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load organization details"
                );
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganization();
    }, [id]);

    // ===== Load CSR Project Expectations =====
    useEffect(() => {
        if (!isAuthenticated || !user?.id || !isCSR) return;
        getProjectExpectation(user.id)
            .then((exp) => setCsrExpectation(exp))
            .catch(() => setCsrExpectation(null));
    }, [isAuthenticated, user?.id, isCSR]);

    // ===== Compute match result (CSR + org loaded) =====
    const matchResult: MatchResult | null = useMemo(() => {
        if (!isCSR || !csrExpectation || !org) return null;
        try {
            return computeMatch(csrExpectation, org as unknown as Organization);
        } catch {
            return null;
        }
    }, [isCSR, csrExpectation, org]);

    // Handle auth-gated actions
    const handleSaveClick = () => {
        if (!isAuthenticated) {
            toast.info("Sign in to save organizations", {
                action: {
                    label: "Sign In",
                    onClick: () => router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`),
                },
            });
            return;
        }
        const wasShortlisted = isShortlisted;
        setIsShortlisted(!isShortlisted);

        // Trigger outcome feedback when user shortlists (not unshortlists)
        if (!wasShortlisted) {
            setFeedbackTrigger("shortlist");
            setTimeout(() => setShowOutcomeFeedback(true), 500);
        }
    };

    const handlePPTClick = (e: React.MouseEvent) => {
        if (!isAuthenticated) {
            e.preventDefault();
            toast.info("Sign in to download PPT", {
                action: {
                    label: "Sign In",
                    onClick: () => router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`),
                },
            });
        }
    };

    // Show loading while checking auth or CSR project setup
    if (loading || isPurchaseLoading || authLoading || isCheckingSetup) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
                <Footer />
            </div>
        );
    }

    // Block CSR users who haven't completed project setup (hook handles redirect)
    if (needsProjectSetup) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !org) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                        {error || "Organization not found"}
                    </h1>
                    <Button onClick={() => router.push("/explore")}>Back to Explore</Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="mb-6"
                    onClick={() => router.push("/explore")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Explore
                </Button>

                {/* ===== CSR DECISION SCREEN ===== */}
                {isCSR && isAuthenticated && matchResult && (
                    <DecisionScreen
                        matchResult={matchResult}
                        isShortlisted={isShortlisted}
                        onShortlist={handleSaveClick}
                        onDismiss={() => {
                            toast.info("Marked as not a fit");
                            router.push("/explore");
                        }}
                    />
                )}

                {/* Organization Header - Always Visible (Public Info) */}
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 mb-8">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <h1 className="text-4xl font-bold text-foreground">
                                    {org.name}
                                </h1>
                                {org.verificationStatus === "verified" && (
                                    <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="default" className="text-base">
                                    {org.type}
                                </Badge>
                                <Badge variant="outline" className="text-base">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {org.region}
                                </Badge>
                                {org.verificationStatus && (
                                    <Badge
                                        variant={
                                            org.verificationStatus === "verified"
                                                ? "default"
                                                : "secondary"
                                        }
                                        className="text-base"
                                    >
                                        {org.verificationStatus === "verified"
                                            ? "✔ Verified"
                                            : "Pending Verification"}
                                    </Badge>
                                )}
                            </div>

                            {/* Focus Areas - Public */}
                            <div className="flex flex-wrap gap-2">
                                {org.focusAreas.slice(0, 4).map((area) => (
                                    <Badge key={area} variant="secondary">
                                        {area}
                                    </Badge>
                                ))}
                                {org.focusAreas.length > 4 && (
                                    <Badge variant="outline">+{org.focusAreas.length - 4} more</Badge>
                                )}
                            </div>
                        </div>

                        {/* Alignment Score - Visible but gated explanation */}
                        {isAuthenticated ? (
                            <AlignmentScoreBreakdown organization={org} />
                        ) : (
                            <div className="text-center bg-card border border-border rounded-xl p-4 min-w-[120px]">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                    Alignment
                                </p>
                                {isCSR ? (
                                    <span className={`text-3xl font-bold ${getFitScoreDisplay(org.alignmentScore).color}`}>
                                        {getFitScoreDisplay(org.alignmentScore).label}
                                    </span>
                                ) : (
                                    <span className="text-3xl font-bold text-primary">{org.alignmentScore}%</span>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">Sign in for details</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Go Back
                        </Button>
                        <Button
                            variant={isShortlisted ? "default" : "outline"}
                            onClick={handleSaveClick}
                            className="flex items-center gap-2"
                        >
                            <Heart
                                className="w-5 h-5"
                                fill={isShortlisted ? "currentColor" : "none"}
                            />
                            {isShortlisted ? "Saved" : "Save to Shortlist"}
                            {!isAuthenticated && <Lock className="w-3 h-3 ml-1" />}
                        </Button>

                        {org.website && (
                            <Button variant="outline" asChild>
                                <a
                                    href={org.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    Visit Website
                                </a>
                            </Button>
                        )}

                        <Button asChild onClick={handlePPTClick}>
                            <Link href={isAuthenticated ? `/ppt/${org.id}` : "#"} className="flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Generate PPT
                                {!isAuthenticated && <Lock className="w-3 h-3 ml-1" />}
                            </Link>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => {
                                if (!isAuthenticated) {
                                    toast.info("Sign in to draft emails", {
                                        action: {
                                            label: "Sign In",
                                            onClick: () => router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`),
                                        },
                                    });
                                    return;
                                }
                                toast.success("Email draft feature coming soon!");
                            }}
                            className="flex items-center gap-2"
                        >
                            <Mail className="w-5 h-5" />
                            Draft Email
                            {!isAuthenticated && <Lock className="w-3 h-3 ml-1" />}
                        </Button>
                    </div>
                </div>

                {/* PURCHASE GATE: Full Profile Details */}
                {isAuthenticated && isPurchased ? (
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Mission & Vision */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Mission & Vision</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="font-bold text-foreground mb-2">Mission</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {org.mission}
                                        </p>
                                    </div>
                                    <div className="border-t pt-4">
                                        <h3 className="font-bold text-foreground mb-2">Vision</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {org.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Focus Areas */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Focus Areas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {org.focusAreas.map((area) => (
                                            <Badge key={area} variant="secondary" className="text-base">
                                                {area}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Projects & Impact */}
                            {org.projects && org.projects.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Key Projects & Impact</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {org.projects.slice(0, 3).map((project, idx) => (
                                            <div
                                                key={idx}
                                                className="border-l-4 border-primary pl-4 py-2"
                                            >
                                                <h4 className="font-bold text-foreground mb-1">
                                                    {project.title}
                                                </h4>
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    {project.year}
                                                </p>
                                                <p className="text-foreground">{project.description}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Partners */}
                            {org.partnerHistory && org.partnerHistory.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Known Partners</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {org.partnerHistory.map((partner, idx) => (
                                                <Badge key={idx} variant="outline">
                                                    {partner}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Key Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Organization Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                            Type
                                        </p>
                                        <p className="font-semibold text-foreground">{org.type}</p>
                                    </div>
                                    <div className="border-t pt-4">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                            Region
                                        </p>
                                        <p className="font-semibold text-foreground">{org.region}</p>
                                    </div>
                                    <div className="border-t pt-4">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                            Headquarters
                                        </p>
                                        <p className="font-semibold text-foreground">
                                            {org.headquarters}
                                        </p>
                                    </div>
                                    <div className="border-t pt-4">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                            Funding Type
                                        </p>
                                        <p className="font-semibold text-foreground">
                                            {org.fundingType}
                                        </p>
                                    </div>
                                    <div className="border-t pt-4">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                            Data Confidence
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-secondary rounded-full h-2">
                                                <div
                                                    className="bg-primary h-full rounded-full"
                                                    style={{ width: `${org.confidence}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-semibold text-foreground">
                                                {org.confidence}%
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Private Notes - Your internal notes */}
                            <Card className="border-amber-500/30 bg-amber-500/5">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <StickyNote className="w-5 h-5 text-amber-600" />
                                        Your Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Private notes only visible to you. Why is this a good fit?
                                    </p>
                                    <textarea
                                        value={privateNotes}
                                        onChange={(e) => setPrivateNotes(e.target.value)}
                                        placeholder="e.g., 'Aligned on rural education. Good for pilot proposal. Contact after March funding cycle.'"
                                        rows={4}
                                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs"
                                            onClick={() => {
                                                // TODO: Save to Supabase shortlist.notes
                                                toast.success("Notes saved!");
                                            }}
                                        >
                                            Save Notes
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Target Beneficiaries */}
                            {org.targetBeneficiaries && org.targetBeneficiaries.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            Target Beneficiaries
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {org.targetBeneficiaries.map((beneficiary, idx) => (
                                                <li
                                                    key={idx}
                                                    className="text-sm text-foreground flex items-start gap-2"
                                                >
                                                    <span className="text-primary mt-1">•</span>
                                                    {beneficiary}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Why This Match Card */}
                            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5 text-primary" />
                                        Why this organization matches you
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MatchExplanation organization={org} />
                                    <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/50">
                                        Based on publicly available organization information
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Community Signals */}
                            <CommunitySignals organizationId={org.id} />
                        </div>
                    </div>
                ) : isAuthenticated && !isPurchased ? (
                    /* LOCKED CONTENT: For authenticated users who haven't purchased */
                    <div className="mt-8">
                        <LockedContentOverlay
                            organizationName={org.name}
                            price={99}
                            onUnlock={() => setShowPaymentModal(true)}
                        />
                    </div>
                ) : (
                    /* AUTH PROMPT: For unauthenticated users */
                    <div className="mt-8">
                        <AuthPrompt
                            feature="full organization details"
                            message="Sign in to access full organization details, alignment insights, and collaboration tools."
                        />
                    </div>
                )}
            </main>

            <Footer />

            {/* Collaboration Outcome Feedback Modal */}
            {org && (
                <CollaborationOutcomeFeedback
                    open={showOutcomeFeedback}
                    onOpenChange={setShowOutcomeFeedback}
                    organizationId={org.id}
                    organizationName={org.name}
                    triggerAction={feedbackTrigger}
                />
            )}

            {/* Payment Modal */}
            {org && (
                <PaymentModal
                    open={showPaymentModal}
                    onOpenChange={setShowPaymentModal}
                    organization={org}
                    onSuccess={() => {
                        // Reload page to show unlocked content
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}
