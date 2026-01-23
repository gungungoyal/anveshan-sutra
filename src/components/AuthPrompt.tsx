"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

interface AuthPromptProps {
    /** The feature the user is trying to access */
    feature?: string;
    /** Custom message to display */
    message?: string;
    /** Whether to show as a card (default) or inline */
    variant?: "card" | "inline";
}

/**
 * AuthPrompt component (Next.js App Router version)
 * Displays when a user tries to access a gated feature without being logged in.
 * Provides clear messaging and CTAs to sign in or create an account.
 */
export default function AuthPrompt({
    feature = "full details",
    message,
    variant = "card"
}: AuthPromptProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const returnTo = encodeURIComponent(pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''));

    if (variant === "inline") {
        return (
            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <Lock className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-sm text-foreground/80 flex-1">
                    {message || `Sign in to view ${feature} and alignment insights.`}
                </p>
                <Link
                    href={`/login?returnTo=${returnTo}`}
                    className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
                >
                    Sign in
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-md mx-auto">
            {/* Icon */}
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <Lock className="w-7 h-7 text-primary" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-foreground mb-2">
                Sign in to continue
            </h3>

            {/* Message */}
            <p className="text-muted-foreground mb-6">
                {message || `Sign in to view ${feature} and alignment insights.`}
            </p>

            {/* CTAs */}
            <div className="space-y-3">
                <Link
                    href={`/login?returnTo=${returnTo}`}
                    className="block w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                    Sign In
                </Link>
                <Link
                    href={`/login?returnTo=${returnTo}`}
                    className="block w-full py-3 border border-border text-foreground rounded-xl font-medium hover:bg-muted/50 transition-colors"
                >
                    Create Account
                </Link>
            </div>

            {/* Trust message */}
            <p className="text-xs text-muted-foreground mt-5">
                No spam. No public profiles. Your data stays private.
            </p>
        </div>
    );
}
