import { MapPin, Target, Users, Handshake } from "lucide-react";

interface Organization {
    focusAreas: string[];
    region: string;
    targetBeneficiaries?: string[];
    fundingType?: string;
    type: string;
}

interface MatchExplanationProps {
    organization: Organization;
    compact?: boolean;
}

/**
 * Generates transparent matching reasons based on available organization data.
 * Uses only existing data fields - no AI, no scoring, no predictions.
 */
function generateMatchReasons(org: Organization): {
    icon: React.ReactNode;
    text: string;
    highlight: string;
}[] {
    const reasons: { icon: React.ReactNode; text: string; highlight: string }[] = [];

    // Focus areas alignment
    if (org.focusAreas && org.focusAreas.length > 0) {
        const areas = org.focusAreas.slice(0, 3).join(", ");
        reasons.push({
            icon: <Target className="w-4 h-4 text-primary flex-shrink-0" />,
            text: "Works in",
            highlight: areas,
        });
    }

    // Regional presence
    if (org.region) {
        reasons.push({
            icon: <MapPin className="w-4 h-4 text-primary flex-shrink-0" />,
            text: "Operates in",
            highlight: org.region,
        });
    }

    // Target beneficiaries
    if (org.targetBeneficiaries && org.targetBeneficiaries.length > 0) {
        const beneficiaries = org.targetBeneficiaries.slice(0, 2).join(" and ");
        reasons.push({
            icon: <Users className="w-4 h-4 text-primary flex-shrink-0" />,
            text: "Serves",
            highlight: beneficiaries,
        });
    }

    // Funding/partnership type
    if (org.fundingType) {
        const fundingLabels: Record<string, string> = {
            recipient: "Seeks funding partners",
            provider: "Provides funding support",
            mixed: "Open to funding partnerships",
            grant: "Focuses on grant programs",
        };
        const label = fundingLabels[org.fundingType] || org.fundingType;
        reasons.push({
            icon: <Handshake className="w-4 h-4 text-primary flex-shrink-0" />,
            text: "",
            highlight: label,
        });
    }

    return reasons;
}

export default function MatchExplanation({ organization, compact = false }: MatchExplanationProps) {
    const reasons = generateMatchReasons(organization);

    if (reasons.length === 0) {
        return null;
    }

    // Compact view for cards - show fewer items
    const displayReasons = compact ? reasons.slice(0, 2) : reasons;

    if (compact) {
        return (
            <div className="mt-4 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">
                    Why this match
                </p>
                <ul className="space-y-1.5">
                    {displayReasons.map((reason, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            {reason.icon}
                            <span>
                                {reason.text && <span>{reason.text} </span>}
                                <span className="font-medium text-foreground">{reason.highlight}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    // Full view for detail page
    return (
        <ul className="space-y-3">
            {displayReasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-3">
                    <div className="mt-0.5">{reason.icon}</div>
                    <span className="text-foreground">
                        {reason.text && <span className="text-muted-foreground">{reason.text} </span>}
                        <span className="font-semibold">{reason.highlight}</span>
                    </span>
                </li>
            ))}
        </ul>
    );
}
