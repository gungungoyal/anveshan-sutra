"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

/**
 * Dashboard - Optimized for first-time users
 * 
 * Simple, calm design that answers: "What should I look at today?"
 * Primary CTA leads to Explore page.
 */
export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuth();

    // Redirect to auth if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth?returnTo=/dashboard');
        }
    }, [isLoading, isAuthenticated, router]);

    // Loading state
    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const userName = user?.name?.split(' ')[0] || 'there';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-xl w-full text-center">
                    {/* Welcome */}
                    <h1 className="text-3xl font-bold text-foreground mb-3">
                        Welcome, {userName}!
                    </h1>
                    <p className="text-lg text-muted-foreground mb-10">
                        What would you like to do today?
                    </p>

                    {/* Primary CTA - Explore */}
                    <div className="space-y-4">
                        <Link href="/explore" className="block">
                            <div className="p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all cursor-pointer group">
                                <div className="flex items-center justify-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <Search className="w-6 h-6 text-primary" />
                                    </div>
                                </div>
                                <h2 className="text-xl font-semibold text-foreground mb-1">
                                    Explore Organizations
                                </h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Discover partners aligned with your goals
                                </p>
                                <Button className="gap-2">
                                    Start exploring
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </Link>

                        {/* Secondary CTA - AI Suggestions (subtle) */}
                        <Link href="/explore?filter=high-fit" className="block">
                            <div className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                                <div className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <Sparkles className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-medium">
                                        View AI-matched organizations
                                    </span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Subtle tip */}
                    <p className="text-xs text-muted-foreground/70 mt-8">
                        Tip: Save organizations you like to review them later
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
