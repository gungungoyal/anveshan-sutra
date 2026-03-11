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
    const [activeTab, setActiveTab] = useState<'public' | 'full'>('public');

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

                {/* Organization Header - Redesigned */}
                <div className="bg-white rounded-sm p-10 mb-8 border border-navy/5 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-sm flex items-center justify-center text-4xl font-bold shrink-0"
                                style={{ background: "#0D1B2A", color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif" }}>
                                {org.name.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl font-bold" style={{ color: "#0D1B2A", fontFamily: "'Cormorant Garamond', serif" }}>
                                        {org.name}
                                    </h1>
                                    {org.verificationStatus === "verified" && (
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                            ✓ Verified Partner
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="border-navy/10 text-navy bg-navy/5">
                                        {org.type === 'CSR' ? 'CSR Partner' : org.type === 'NGO' ? 'NGO' : org.type}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2 text-sm font-bold" style={{ color: "rgba(13,27,42,0.6)" }}>
                                    {org.focusAreas.slice(0, 4).map(fa => (
                                        <span key={fa} className="px-3 py-1 bg-gray-50 rounded-sm border border-gray-100">{fa}</span>
                                    ))}
                                    <span className="px-3 py-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {org.region}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-center md:text-right shrink-0">
                            <div className="text-5xl font-bold mb-1" style={{ color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif" }}>
                                {org.alignmentScore}% 
                            </div>
                            <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "rgba(13,27,42,0.4)" }}>Match Score</div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 pt-6 border-t border-navy/5">
                        <Button
                            onClick={handleSaveClick}
                            className="rounded-sm font-bold tracking-widest uppercase text-[11px] px-8 h-12"
                            style={{ 
                                background: isShortlisted ? "#C9A84C" : "#0D1B2A", 
                                color: isShortlisted ? "#0D1B2A" : "#FFFFFF" 
                            }}
                        >
                            <Heart className={`w-4 h-4 mr-2 ${isShortlisted ? "fill-navy" : ""}`} />
                            {isShortlisted ? "Saved Partner" : "Save Partner"}
                            {!isAuthenticated && <Lock className="w-3 h-3 ml-2 opacity-50" />}
                        </Button>
                        
                        {org.website && (
                             <Button variant="outline" asChild className="rounded-sm font-bold tracking-widest uppercase text-[11px] px-6 h-12 border-navy/20 hover:bg-navy/5">
                                 <a href={org.website} target="_blank" rel="noopener noreferrer">
                                     <ExternalLink className="w-4 h-4 mr-2" />
                                     Visit Website
                                 </a>
                             </Button>
                        )}
                        
                        <Button asChild onClick={handlePPTClick} className="rounded-sm font-bold tracking-widest uppercase text-[11px] px-6 h-12 bg-gray-100 text-navy hover:bg-gray-200">
                            <Link href={isAuthenticated ? `/ppt/${org.id}` : "#"} className="flex items-center gap-2">
                                <Award className="w-4 h-4 mr-2" />
                                Generate PPT
                                {!isAuthenticated && <Lock className="w-3 h-3 ml-1 opacity-50" />}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* PUBLIC PROFILE CONTENT */}
                <div className="space-y-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-sm p-10 border border-navy/5 shadow-sm">
                        <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#0D1B2A" }}>About Us / Mission</h3>
                        <div className="space-y-4 text-[15px] leading-relaxed" style={{ color: "rgba(13,27,42,0.7)" }}>
                            <p>{org.mission || org.description || "Information about this organization's mission is not available."}</p>
                            {org.mission && org.description && <p>{org.description}</p>}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-sm border border-navy/5 shadow-sm text-center transition-all hover:-translate-y-1 hover:border-gold/30 hover:shadow-md">
                            <div className="text-4xl font-bold mb-2" style={{ color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif" }}>
                                {org.confidence}%
                            </div>
                            <div className="text-[10px] uppercase font-bold tracking-widest" style={{ color: "rgba(13,27,42,0.5)" }}>Data Confidence</div>
                        </div>
                        <div className="bg-white p-8 rounded-sm border border-navy/5 shadow-sm text-center transition-all hover:-translate-y-1 hover:border-gold/30 hover:shadow-md">
                            <div className="text-4xl font-bold mb-2" style={{ color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif" }}>
                                {org.projects?.length || 0}
                            </div>
                            <div className="text-[10px] uppercase font-bold tracking-widest" style={{ color: "rgba(13,27,42,0.5)" }}>Known Projects</div>
                        </div>
                        <div className="bg-white p-8 rounded-sm border border-navy/5 shadow-sm text-center transition-all hover:-translate-y-1 hover:border-gold/30 hover:shadow-md">
                            <div className="text-4xl font-bold mb-2" style={{ color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif" }}>
                                {org.fundingType || "Recipient"}
                            </div>
                            <div className="text-[10px] uppercase font-bold tracking-widest" style={{ color: "rgba(13,27,42,0.5)" }}>Primary Role</div>
                        </div>
                    </div>
                </div>

                {/* FULL DETAILS (LOCKED/UNLOCKED) */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3" style={{ color: "#0D1B2A", fontFamily: "'Cormorant Garamond', serif" }}>
                        Full Details {(!isAuthenticated || !isPurchased) && <Lock className="w-5 h-5 text-gold" style={{ color: "#C9A84C" }} />}
                    </h2>
                    
                    {isAuthenticated && isPurchased ? (
                        <div className="grid md:grid-cols-3 gap-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Main Content */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Mission & Vision */}
                                <Card className="rounded-sm border-navy/5 shadow-sm">
                                    <CardHeader>
                                        <CardTitle style={{ fontFamily: "'Cormorant Garamond', serif" }}>Mission & Vision</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h3 className="font-bold mb-2" style={{ color: "#0D1B2A" }}>Mission</h3>
                                            <p className="leading-relaxed" style={{ color: "rgba(13,27,42,0.7)" }}>
                                                {org.mission}
                                            </p>
                                        </div>
                                        <div className="border-t pt-4">
                                            <h3 className="font-bold mb-2" style={{ color: "#0D1B2A" }}>Vision</h3>
                                            <p className="leading-relaxed" style={{ color: "rgba(13,27,42,0.7)" }}>
                                                {org.description}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Focus Areas */}
                                <Card className="rounded-sm border-navy/5 shadow-sm">
                                    <CardHeader>
                                        <CardTitle style={{ fontFamily: "'Cormorant Garamond', serif" }}>Focus Areas</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {org.focusAreas.map((area) => (
                                                <Badge key={area} variant="secondary" className="text-base bg-navy/5 text-navy hover:bg-navy/10 rounded-sm">
                                                    {area}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Projects & Impact */}
                                {org.projects && org.projects.length > 0 && (
                                    <Card className="rounded-sm border-navy/5 shadow-sm">
                                        <CardHeader>
                                            <CardTitle style={{ fontFamily: "'Cormorant Garamond', serif" }}>Key Projects & Impact</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {org.projects.slice(0, 3).map((project, idx) => (
                                                <div
                                                    key={idx}
                                                    className="border-l-4 pl-4 py-2"
                                                    style={{ borderColor: "#C9A84C" }}
                                                >
                                                    <h4 className="font-bold mb-1" style={{ color: "#0D1B2A" }}>
                                                        {project.title}
                                                    </h4>
                                                    <p className="text-sm mb-1" style={{ color: "rgba(13,27,42,0.5)" }}>
                                                        {project.year}
                                                    </p>
                                                    <p style={{ color: "rgba(13,27,42,0.7)" }}>{project.description}</p>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Partners */}
                                {org.partnerHistory && org.partnerHistory.length > 0 && (
                                    <Card className="rounded-sm border-navy/5 shadow-sm">
                                        <CardHeader>
                                            <CardTitle style={{ fontFamily: "'Cormorant Garamond', serif" }}>Known Partners</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {org.partnerHistory.map((partner, idx) => (
                                                    <Badge key={idx} variant="outline" className="rounded-sm border-navy/10 text-navy">
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
                                <Card className="rounded-sm border-navy/5 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Detailed Info</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="border-t pt-4">
                                            <p className="text-[10px] uppercase tracking-widest mb-1 font-bold" style={{ color: "rgba(13,27,42,0.4)" }}>
                                                Headquarters
                                            </p>
                                            <p className="font-semibold" style={{ color: "#0D1B2A" }}>
                                                {org.headquarters}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Target Beneficiaries */}
                                {org.targetBeneficiaries && org.targetBeneficiaries.length > 0 && (
                                    <Card className="rounded-sm border-navy/5 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                                Target Beneficiaries
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {org.targetBeneficiaries.map((beneficiary, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="text-sm text-foreground flex items-start gap-2"
                                                        style={{ color: "rgba(13,27,42,0.8)" }}
                                                    >
                                                        <span className="mt-1" style={{ color: "#C9A84C" }}>•</span>
                                                        {beneficiary}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Why This Match Card */}
                                <Card className="rounded-sm shadow-sm" style={{ background: "rgba(201,168,76,0.05)", borderColor: "rgba(201,168,76,0.2)" }}>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#0D1B2A" }}>
                                            <Lightbulb className="w-5 h-5" style={{ color: "#C9A84C" }} />
                                            Why this matches you
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <MatchExplanation organization={org} />
                                    </CardContent>
                                </Card>

                                {/* Community Signals */}
                                <CommunitySignals organizationId={org.id} />
                            </div>
                        </div>
                    ) : (
                        /* LOCKED CONTENT: For authenticated/unpurchased OR unauthenticated users */
                        <div className="relative bg-white rounded-sm border border-navy/5 shadow-sm overflow-hidden p-10 min-h-[600px] flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="absolute inset-0 pointer-events-none opacity-20 blur-md grayscale transition-all text-navy/10 flex flex-col justify-between p-12">
                                <div className="space-y-6">
                                    <div className="h-8 w-1/3 bg-current rounded" />
                                    <div className="space-y-4 pt-4">
                                        <div className="h-4 w-full bg-current rounded" />
                                        <div className="h-4 w-5/6 bg-current rounded" />
                                        <div className="h-4 w-4/5 bg-current rounded" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-8 mt-12">
                                    <div className="h-48 bg-current rounded" />
                                    <div className="h-48 bg-current rounded" />
                                </div>
                            </div>
                            
                            <div className="relative z-10 w-full max-w-lg bg-white p-12 rounded-sm shadow-2xl text-center border-t-4" style={{ borderColor: "#C9A84C" }}>
                                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(201,168,76,0.1)" }}>
                                    <Lock className="w-8 h-8" style={{ color: "#C9A84C" }} />
                                </div>
                                <h3 className="text-3xl font-bold mb-4" style={{ color: "#0D1B2A", fontFamily: "'Cormorant Garamond', serif" }}>
                                    {isAuthenticated ? "Unlock Full Profile" : "Sign in to Unlock"}
                                </h3>
                                <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(13,27,42,0.6)" }}>
                                    {isAuthenticated 
                                        ? <>Get full access to financial data, past projects, impact reports and direct messaging for <span className="font-bold text-navy">{org.name}</span>.</>
                                        : <>Join Drivya to access full financial data, past projects, impact reports and direct messaging for <span className="font-bold text-navy">{org.name}</span>.</>
                                    }
                                </p>
                                
                                {isAuthenticated ? (
                                    <>
                                        <Button onClick={() => setShowPaymentModal(true)} className="w-full h-14 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded-sm"
                                            style={{ background: "#C9A84C", color: "#0D1B2A", boxShadow: "0 8px 24px rgba(201,168,76,0.2)" }}>
                                            View Upgrade Plans
                                        </Button>
                                        <p className="text-[10px] uppercase tracking-widest mt-6 font-bold" style={{ color: "rgba(13,27,42,0.3)" }}>One-time purchase • Lifetime access</p>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <Link href={`/auth?returnTo=/org/${org.id}`}>
                                            <Button className="w-full h-14 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded-sm"
                                                style={{ background: "#0D1B2A", color: "#FAF7F2", boxShadow: "0 8px 24px rgba(13,27,42,0.2)" }}>
                                                Sign In to Continue
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
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
