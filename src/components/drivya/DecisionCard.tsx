"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import VerdictBadge from "./VerdictBadge";
import SignalIndicator from "./SignalIndicator";
import type { DrivyaOrganization } from "@/data/drivya-data";

interface DecisionCardProps {
    organization: DrivyaOrganization;
    className?: string;
}

export default function DecisionCard({ organization, className }: DecisionCardProps) {
    const { id, name, type, region, verdict, signals, reason } = organization;

    return (
        <Link
            href={`/decide/${id}`}
            className={cn(
                "block p-5 rounded-xl border bg-card hover:shadow-lg transition-all duration-200",
                verdict === "worth-it" && "border-green-200 dark:border-green-800 hover:border-green-300",
                verdict === "risky" && "border-amber-200 dark:border-amber-800 hover:border-amber-300",
                verdict === "avoid" && "border-red-200 dark:border-red-800 hover:border-red-300",
                className
            )}
        >
            {/* Header: Name + Verdict */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <h3 className="font-semibold text-foreground text-lg">{name}</h3>
                    <p className="text-sm text-muted-foreground">{type} • {region}</p>
                </div>
                <VerdictBadge verdict={verdict} size="lg" />
            </div>

            {/* Signals */}
            <div className="space-y-2 mb-4 py-3 border-t border-b border-border">
                <SignalIndicator
                    label="Engagement Confidence"
                    level={signals.engagementConfidence}
                />
                <SignalIndicator
                    label="Collaboration Intent"
                    level={signals.collaborationIntent}
                />
                <SignalIndicator
                    label="Time-Waste Risk"
                    level={signals.timeWasteRisk === "low" ? "high" : signals.timeWasteRisk === "high" ? "low" : "medium"}
                />
            </div>

            {/* Reason */}
            <p className="text-sm text-foreground/80 leading-relaxed">
                {reason}
            </p>
        </Link>
    );
}
