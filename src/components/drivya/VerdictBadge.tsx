"use client";

import { cn } from "@/lib/utils";
import type { Verdict } from "@/data/drivya-data";

interface VerdictBadgeProps {
    verdict: Verdict;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const verdictConfig = {
    "worth-it": {
        label: "Worth it",
        bg: "bg-green-100 dark:bg-green-900/40",
        text: "text-green-700 dark:text-green-300",
        border: "border-green-300 dark:border-green-700",
        icon: "✓"
    },
    "risky": {
        label: "Risky",
        bg: "bg-amber-100 dark:bg-amber-900/40",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-300 dark:border-amber-700",
        icon: "⚠"
    },
    "avoid": {
        label: "Avoid",
        bg: "bg-red-100 dark:bg-red-900/40",
        text: "text-red-700 dark:text-red-300",
        border: "border-red-300 dark:border-red-700",
        icon: "✕"
    }
};

const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base font-semibold"
};

export default function VerdictBadge({ verdict, size = "md", className }: VerdictBadgeProps) {
    const config = verdictConfig[verdict];

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border font-medium",
                config.bg,
                config.text,
                config.border,
                sizeClasses[size],
                className
            )}
        >
            <span className="text-current">{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
}
