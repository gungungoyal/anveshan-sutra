"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DrivyaHome() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Minimal Header - Logo Only */}
            <header className="border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/" className="text-xl font-bold text-foreground">
                        Drivya
                    </Link>
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
