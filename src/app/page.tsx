"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut, User, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/services/auth";

export default function DrivyaHome() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header with Auth */}
            <header className="border-b border-border">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-foreground">
                        Drivya
                    </Link>
                    <nav className="flex items-center gap-4">
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : isAuthenticated && user ? (
                            <>
                                <Link
                                    href="/decide"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Decisions
                                </Link>
                                <Link
                                    href="/log-outcome"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Log Outcome
                                </Link>
                                <div className="flex items-center gap-2 pl-4 border-l border-border">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <span className="text-sm text-foreground hidden sm:block">
                                        {user.name || user.email?.split('@')[0]}
                                    </span>
                                    <button
                                        onClick={handleSignOut}
                                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                                        title="Sign out"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/auth?mode=signup"
                                    className="text-sm px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </nav>
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

                    {/* CTA - Different based on auth state */}
                    {isAuthenticated ? (
                        <Link
                            href="/decide"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-xl font-semibold text-lg hover:bg-foreground/90 transition-colors"
                        >
                            Check collaboration confidence
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    ) : (
                        <Link
                            href="/auth"
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
