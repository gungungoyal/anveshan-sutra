"use client";

import Link from "next/link";
import { ArrowRight, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/services/auth";
import { useUserStore } from "@/lib/stores/userStore";

/**
 * Landing page - shows different content based on auth status.
 */
export default function DrivyaHome() {
    const { user, isLoading } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        useUserStore.getState().resetOnboarding();
        // Force full reload to clear all auth state
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header with auth-aware actions */}
            <header className="border-b border-border">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-foreground">
                        Drivya
                    </Link>

                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : user ? (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/explore"
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                Explore
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg font-medium transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth"
                            className="px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </header>

            {/* Hero - Decision Focused */}
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-2xl text-center">
                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
                        Stop chasing partnerships that go nowhere.
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                        Know which organizations are worth your team's time — before you reach out.
                    </p>

                    {/* CTA - Changes based on auth */}
                    {user ? (
                        <Link
                            href="/explore"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-xl font-semibold text-lg hover:bg-foreground/90 transition-colors"
                        >
                            Go to Explore
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    ) : (
                        <Link
                            href="/start"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-xl font-semibold text-lg hover:bg-foreground/90 transition-colors"
                        >
                            Get started
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    )}

                    {/* Supporting Line */}
                    <p className="mt-8 text-sm text-muted-foreground">
                        Drivya tells you who to pursue and who to skip — so you don't waste weeks on bad fits.
                    </p>
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="border-t border-border py-6">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    Drivya — A decision platform for NGOs, CSR teams, and Incubators.
                </div>
            </footer>
        </div>
    );
}
