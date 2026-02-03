"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * PremiumContent - Displays content based on unlock status
 * 
 * - Shows full content if unlocked (NGO or paid user)
 * - Shows redacted preview + unlock CTA if locked
 */

interface PremiumContentProps {
    isUnlocked: boolean;
    children: React.ReactNode;
    previewLines?: number;  // How many lines to show as preview (default: 2)
    onUnlockRequest: () => void;
    title?: string;
}

export function PremiumContent({
    isUnlocked,
    children,
    previewLines = 2,
    onUnlockRequest,
    title,
}: PremiumContentProps) {
    if (isUnlocked) {
        return <>{children}</>;
    }

    return (
        <div className="relative">
            {/* Blurred preview */}
            <div className="blur-sm select-none pointer-events-none">
                {children}
            </div>

            {/* Overlay with unlock CTA */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background flex items-center justify-center">
                <div className="text-center space-y-3 px-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    {title && (
                        <p className="font-medium text-foreground">{title}</p>
                    )}
                    <Button onClick={onUnlockRequest} size="sm" className="gap-2">
                        <Lock className="w-4 h-4" />
                        Unlock This Content
                    </Button>
                </div>
            </div>
        </div>
    );
}
