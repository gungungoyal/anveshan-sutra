"use client";

import { cn } from "@/lib/utils";
import type { SignalLevel } from "@/data/drivya-data";

interface SignalIndicatorProps {
    label: string;
    level: SignalLevel;
    className?: string;
}

const levelConfig = {
    high: {
        bars: 3,
        color: "bg-green-500",
        label: "Strong"
    },
    medium: {
        bars: 2,
        color: "bg-amber-500",
        label: "Moderate"
    },
    low: {
        bars: 1,
        color: "bg-red-500",
        label: "Weak"
    }
};

export default function SignalIndicator({ label, level, className }: SignalIndicatorProps) {
    const config = levelConfig[level];

    return (
        <div className={cn("flex items-center justify-between", className)}>
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <div className="flex items-end gap-0.5 h-4">
                    {[1, 2, 3].map((bar) => (
                        <div
                            key={bar}
                            className={cn(
                                "w-1.5 rounded-sm transition-colors",
                                bar <= config.bars ? config.color : "bg-gray-200 dark:bg-gray-700"
                            )}
                            style={{ height: `${bar * 5}px` }}
                        />
                    ))}
                </div>
                <span className={cn(
                    "text-xs font-medium",
                    level === "high" && "text-green-600 dark:text-green-400",
                    level === "medium" && "text-amber-600 dark:text-amber-400",
                    level === "low" && "text-red-600 dark:text-red-400"
                )}>
                    {config.label}
                </span>
            </div>
        </div>
    );
}
