"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Clock, Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/drivya/ProtectedRoute";
import VerdictBadge from "@/components/drivya/VerdictBadge";
import SignalIndicator from "@/components/drivya/SignalIndicator";
import { supabase } from "@/lib/supabase";
import type { DrivyaOrganization, Verdict, SignalLevel } from "@/data/drivya-data";

function OrganizationDetailContent() {
    const params = useParams();
    const id = params?.id as string | undefined;
    const [org, setOrg] = useState<DrivyaOrganization | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrganization = async () => {
            if (!id) {
                setError("Invalid organization ID");
                setLoading(false);
                return;
            }

            if (!supabase) {
                setError("Database not configured");
                setLoading(false);
                return;
            }

            const { data, error: fetchError } = await supabase
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
                .eq("id", id)
                .single();

            if (fetchError || !data) {
                setError("Organization not found");
                setLoading(false);
                return;
            }

            // Compute signals
            const confidence = data.confidence || 50;
            const alignmentScore = data.alignment_score || 50;
            const isVerified = data.verification_status === "verified";
            const daysSinceUpdate = Math.floor(
                (Date.now() - new Date(data.updated_at).getTime()) / (1000 * 60 * 60 * 24)
            );

            const engagementConfidence: SignalLevel =
                isVerified && daysSinceUpdate < 30 ? "high" :
                    daysSinceUpdate < 90 ? "medium" : "low";

            const collaborationIntent: SignalLevel =
                alignmentScore >= 70 ? "high" :
                    alignmentScore >= 40 ? "medium" : "low";

            const timeWasteRisk: SignalLevel =
                confidence >= 70 ? "low" :
                    confidence >= 40 ? "medium" : "high";

            let verdict: Verdict;
            if (engagementConfidence === "high" && collaborationIntent === "high" && timeWasteRisk === "low") {
                verdict = "worth-it";
            } else if (engagementConfidence === "low" || collaborationIntent === "low" || timeWasteRisk === "high") {
                verdict = "avoid";
            } else {
                verdict = "risky";
            }

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

            const focusAreas = data.organization_focus_areas || [];
            const primaryFocus = focusAreas.length > 0 ? focusAreas[0].focus_area : "General";

            let warningSign: string | undefined;
            if (verdict === "risky" || verdict === "avoid") {
                if (daysSinceUpdate > 90) {
                    warningSign = `Profile not updated in ${daysSinceUpdate} days.`;
                } else if (!isVerified) {
                    warningSign = "Organization not yet verified.";
                }
            }

            const lastActive = daysSinceUpdate === 0 ? "Today" :
                daysSinceUpdate === 1 ? "Yesterday" :
                    daysSinceUpdate < 7 ? `${daysSinceUpdate} days ago` :
                        daysSinceUpdate < 30 ? `${Math.floor(daysSinceUpdate / 7)} weeks ago` :
                            `${Math.floor(daysSinceUpdate / 30)} months ago`;

            setOrg({
                id: data.id,
                name: data.name,
                type: data.type as "NGO" | "CSR" | "Incubator" | "Foundation",
                region: data.region,
                focusArea: primaryFocus,
                verdict,
                signals: {
                    engagementConfidence,
                    collaborationIntent,
                    timeWasteRisk,
                },
                reason,
                warningSign,
                summary: data.mission?.substring(0, 150) || data.description?.substring(0, 150) || "",
                lastActive,
            });
            setLoading(false);
        };

        fetchOrganization();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !org) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-muted-foreground mb-4">{error || "Organization not found."}</p>
                    <Link href="/decide" className="text-foreground underline">
                        Back to decisions
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/decide" className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-foreground">Drivya</h1>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Large Verdict */}
                <div className="text-center mb-8">
                    <VerdictBadge verdict={org.verdict} size="lg" className="text-lg px-6 py-3" />
                </div>

                {/* Organization Name */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">{org.name}</h2>
                    <p className="text-muted-foreground">{org.type} • {org.region} • {org.focusArea}</p>
                </div>

                {/* Why Drivya Reached This Decision */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-foreground mb-4">Why this verdict?</h3>
                    <p className="text-foreground/80 leading-relaxed mb-6">
                        {org.reason}
                    </p>

                    {/* Signals */}
                    <div className="space-y-3 pt-4 border-t border-border">
                        <SignalIndicator
                            label="Engagement Confidence"
                            level={org.signals.engagementConfidence}
                        />
                        <SignalIndicator
                            label="Collaboration Intent"
                            level={org.signals.collaborationIntent}
                        />
                        <SignalIndicator
                            label="Time-Waste Risk"
                            level={org.signals.timeWasteRisk === "low" ? "high" : org.signals.timeWasteRisk === "high" ? "low" : "medium"}
                        />
                    </div>
                </div>

                {/* Warning Signs */}
                {org.warningSign && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Warning Sign</h3>
                                <p className="text-amber-700 dark:text-amber-400 text-sm">
                                    {org.warningSign}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Brief Factual Summary */}
                <div className="bg-muted/30 rounded-xl p-5 mb-8">
                    <p className="text-sm text-foreground/70">{org.summary}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        Last active: {org.lastActive}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {org.verdict !== "avoid" && (
                        <Link
                            href={`/log-outcome?org=${org.id}`}
                            className="flex-1 text-center px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-colors"
                        >
                            I reached out → Log outcome
                        </Link>
                    )}
                    <Link
                        href="/decide"
                        className="flex-1 text-center px-6 py-3 border border-border rounded-xl font-medium hover:bg-muted/50 transition-colors"
                    >
                        Back to decisions
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function OrganizationDetailPage() {
    return (
        <ProtectedRoute>
            <OrganizationDetailContent />
        </ProtectedRoute>
    );
}
