"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, X, Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/drivya/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface OrgOption {
    id: string;
    name: string;
}

function LogOutcomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [selectedOrg, setSelectedOrg] = useState<string>(searchParams?.get("org") || "");
    const [didReply, setDidReply] = useState<boolean | null>(null);
    const [wasUseful, setWasUseful] = useState<boolean | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [organizations, setOrganizations] = useState<OrgOption[]>([]);
    const [loadingOrgs, setLoadingOrgs] = useState(true);

    // Fetch organizations for dropdown
    useEffect(() => {
        const fetchOrgs = async () => {
            if (!supabase) return;

            const { data, error } = await supabase
                .from("organizations")
                .select("id, name")
                .order("name");

            if (!error && data) {
                setOrganizations(data);
            }
            setLoadingOrgs(false);
        };
        fetchOrgs();
    }, []);

    const handleSubmit = async () => {
        if (!selectedOrg || didReply === null || wasUseful === null || !user || !supabase) {
            return;
        }

        setSubmitting(true);
        setError(null);

        const { error: insertError } = await supabase
            .from("outreach_logs")
            .insert({
                user_id: user.id,
                organization_id: selectedOrg,
                replied: didReply,
                useful: wasUseful,
            });

        if (insertError) {
            console.error("Error logging outcome:", insertError);
            setError("Failed to save outcome. Please try again.");
            setSubmitting(false);
            return;
        }

        setSubmitted(true);
        setSubmitting(false);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <header className="border-b border-border">
                    <div className="container mx-auto px-4 py-4">
                        <Link href="/" className="text-xl font-bold text-foreground">Drivya</Link>
                    </div>
                </header>
                <main className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-3">Outcome logged</h1>
                        <p className="text-muted-foreground mb-8">
                            This helps Drivya improve future recommendations for everyone.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/decide"
                                className="px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-colors"
                            >
                                Check more organizations
                            </Link>
                            <Link
                                href="/"
                                className="px-6 py-3 border border-border rounded-xl font-medium hover:bg-muted/50 transition-colors"
                            >
                                Back to home
                            </Link>
                        </div>
                    </div>
                </main>
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

            <div className="container mx-auto px-4 py-8 max-w-lg">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Log your outcome</h2>
                    <p className="text-muted-foreground">Help Drivya learn from real results.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Step 1: Select Organization */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <label className="block text-sm font-medium text-foreground mb-3">
                            Which organization did you contact?
                        </label>
                        {loadingOrgs ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <select
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                            >
                                <option value="">Select organization</option>
                                {organizations.map(org => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Step 2: Did they reply? */}
                    {selectedOrg && (
                        <div className="bg-card border border-border rounded-xl p-5">
                            <label className="block text-sm font-medium text-foreground mb-3">
                                Did they reply?
                            </label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDidReply(true)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${didReply === true
                                        ? "bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                                        : "border-border hover:bg-muted/50"
                                        }`}
                                >
                                    <Check className="w-5 h-5" />
                                    Yes
                                </button>
                                <button
                                    onClick={() => setDidReply(false)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${didReply === false
                                        ? "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                                        : "border-border hover:bg-muted/50"
                                        }`}
                                >
                                    <X className="w-5 h-5" />
                                    No
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Was it useful? */}
                    {didReply !== null && (
                        <div className="bg-card border border-border rounded-xl p-5">
                            <label className="block text-sm font-medium text-foreground mb-3">
                                Was the interaction useful?
                            </label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setWasUseful(true)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${wasUseful === true
                                        ? "bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                                        : "border-border hover:bg-muted/50"
                                        }`}
                                >
                                    <Check className="w-5 h-5" />
                                    Yes
                                </button>
                                <button
                                    onClick={() => setWasUseful(false)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${wasUseful === false
                                        ? "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                                        : "border-border hover:bg-muted/50"
                                        }`}
                                >
                                    <X className="w-5 h-5" />
                                    No
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    {wasUseful !== null && (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full px-6 py-4 bg-foreground text-background rounded-xl font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Submit outcome"
                            )}
                        </button>
                    )}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    Takes less than 10 seconds. Helps improve recommendations.
                </p>
            </div>
        </div>
    );
}

function LogOutcomePageInner() {
    return (
        <ProtectedRoute>
            <Suspense fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            }>
                <LogOutcomeContent />
            </Suspense>
        </ProtectedRoute>
    );
}

export default function LogOutcomePage() {
    return <LogOutcomePageInner />;
}
