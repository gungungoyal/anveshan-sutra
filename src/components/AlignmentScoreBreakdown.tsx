import { SearchResult } from "@shared/api";

interface AlignmentScoreBreakdownProps {
    organization: SearchResult;
    compact?: boolean;
}

/**
 * Calculate deterministic score breakdown based on organization data
 * Returns consistent values based on data present (no randomness)
 */
function calculateBreakdown(org: SearchResult): {
    focusArea: number;
    region: number;
    orgType: number;
} {
    // Focus Area: based on number of focus areas (max 40)
    const focusAreaScore = org.focusAreas && org.focusAreas.length > 0
        ? Math.min(40, 15 + org.focusAreas.length * 8)
        : 10;

    // Region: based on region presence and specificity (max 30)
    const regionScore = org.region
        ? (org.region.includes("India") ? 28 : 22)
        : 8;

    // Org Type: based on type compatibility (max 30)
    const orgTypeScores: Record<string, number> = {
        "NGO": 28,
        "Foundation": 26,
        "Social Enterprise": 24,
        "CSR": 22,
        "Incubator": 20,
    };
    const orgTypeScore = orgTypeScores[org.type] || 18;

    return {
        focusArea: focusAreaScore,
        region: regionScore,
        orgType: orgTypeScore,
    };
}

/**
 * Get strength label based on alignment score
 * Match score color logic:
 * - <50%: #EF4444 (red-500) - Low
 * - 50-69%: #F59E0B (amber-500) - Moderate
 * - ≥70%: #16A34A (green-600) - High
 */
function getStrengthLabel(score: number): {
    label: string;
    color: string;
    bgColor: string;
} {
    if (score >= 70) {
        return {
            label: "High alignment",
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-50 dark:bg-green-900/20",
        };
    }
    if (score >= 50) {
        return {
            label: "Moderate alignment",
            color: "text-amber-500 dark:text-amber-400",
            bgColor: "bg-amber-50 dark:bg-amber-900/20",
        };
    }
    return {
        label: "Low alignment",
        color: "text-red-500 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-900/20",
    };
}

/**
 * Get collaboration context based on score
 */
function getCollaborationContext(score: number): string {
    if (score >= 80) {
        return "Well suited for strategic partnership";
    }
    if (score >= 60) {
        return "Good fit for collaborative projects";
    }
    if (score >= 40) {
        return "Best suited for exploratory collaboration";
    }
    return "Consider for initial outreach";
}

export default function AlignmentScoreBreakdown({
    organization,
    compact = false,
}: AlignmentScoreBreakdownProps) {
    const score = organization.alignmentScore || 0;
    const breakdown = calculateBreakdown(organization);
    const strength = getStrengthLabel(score);
    const context = getCollaborationContext(score);

    // Calculate total for percentage display
    const total = breakdown.focusArea + breakdown.region + breakdown.orgType;

    if (compact) {
        // Compact view for search cards
        return (
            <div className={`${strength.bgColor} rounded-lg p-4 min-w-[180px]`}>
                {/* Score and Label */}
                <div className="text-center mb-3">
                    <div className={`text-3xl font-bold mb-1 ${strength.color}`}>
                        {score}
                    </div>
                    <div className={`text-sm font-medium ${strength.color}`}>
                        {strength.label}
                    </div>
                </div>

                {/* Segmented Progress Bar */}
                <div className="mb-3">
                    <div className="flex h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                        <div
                            className="bg-emerald-500 transition-all"
                            style={{ width: `${(breakdown.focusArea / total) * 100}%` }}
                            title="Focus Area Match"
                        />
                        <div
                            className="bg-blue-500 transition-all"
                            style={{ width: `${(breakdown.region / total) * 100}%` }}
                            title="Region Match"
                        />
                        <div
                            className="bg-amber-500 transition-all"
                            style={{ width: `${(breakdown.orgType / total) * 100}%` }}
                            title="Organization Type"
                        />
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Focus
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Region
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Type
                        </span>
                    </div>
                </div>

                {/* Context Line */}
                <p className="text-xs text-muted-foreground text-center">
                    {context}
                </p>
            </div>
        );
    }

    // Expanded view for detail page
    return (
        <div className={`${strength.bgColor} rounded-xl p-6`}>
            {/* Score and Label */}
            <div className="text-center mb-4">
                <div className={`text-5xl font-bold mb-2 ${strength.color}`}>
                    {score}
                </div>
                <div className={`text-lg font-semibold ${strength.color}`}>
                    {strength.label}
                </div>
            </div>

            {/* Explanation */}
            <p className="text-sm text-muted-foreground text-center mb-4">
                This score is calculated based on how closely your organization aligns across key factors.
            </p>

            {/* Detailed Breakdown */}
            <div className="space-y-3">
                {/* Focus Area */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground font-medium">Focus Area Match</span>
                        <span className="text-muted-foreground">{breakdown.focusArea}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${(breakdown.focusArea / 40) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Region */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground font-medium">Region Match</span>
                        <span className="text-muted-foreground">{breakdown.region}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${(breakdown.region / 30) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Org Type */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground font-medium">Organization Type</span>
                        <span className="text-muted-foreground">{breakdown.orgType}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${(breakdown.orgType / 30) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Context Line */}
            <p className="text-sm text-muted-foreground text-center mt-4 pt-4 border-t border-border/50">
                {context}
            </p>
        </div>
    );
}
