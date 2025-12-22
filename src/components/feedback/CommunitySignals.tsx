import { useState, useEffect } from "react";
import { MessageCircle, Calendar, FileText, Handshake, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CommunitySignalsProps {
    organizationId: string;
    compact?: boolean;
}

interface SignalCounts {
    conversationsStarted: number;
    meetingsConducted: number;
    proposalsShared: number;
    partnershipsInitiated: number;
}

/**
 * Community Signals Display
 * 
 * Shows aggregated collaboration outcomes for an organization.
 * No individual comments, no negative language, no star ratings.
 * Example: "23 conversations started • 9 proposals shared • 4 partnerships initiated"
 */
export default function CommunitySignals({ organizationId, compact = false }: CommunitySignalsProps) {
    const [signals, setSignals] = useState<SignalCounts>({
        conversationsStarted: 0,
        meetingsConducted: 0,
        proposalsShared: 0,
        partnershipsInitiated: 0,
    });
    const [totalInteractions, setTotalInteractions] = useState(0);

    useEffect(() => {
        // Load aggregated signals from localStorage (would be API in production)
        const feedback = JSON.parse(localStorage.getItem("collaboration_feedback") || "[]");

        // Filter for this organization
        const orgFeedback = feedback.filter((f: any) => f.organizationId === organizationId);

        // Aggregate counts
        const counts: SignalCounts = {
            conversationsStarted: 0,
            meetingsConducted: 0,
            proposalsShared: 0,
            partnershipsInitiated: 0,
        };

        orgFeedback.forEach((f: any) => {
            switch (f.outcome) {
                case "conversation_started":
                    counts.conversationsStarted++;
                    break;
                case "meeting_conducted":
                    counts.meetingsConducted++;
                    break;
                case "proposal_shared":
                    counts.proposalsShared++;
                    break;
                case "partnership_initiated":
                    counts.partnershipsInitiated++;
                    break;
            }
        });

        setSignals(counts);
        setTotalInteractions(orgFeedback.length);
    }, [organizationId]);

    // Don't render if no meaningful signals
    const hasSignals =
        signals.conversationsStarted > 0 ||
        signals.meetingsConducted > 0 ||
        signals.proposalsShared > 0 ||
        signals.partnershipsInitiated > 0;

    if (!hasSignals) {
        return null;
    }

    const signalItems = [
        {
            count: signals.conversationsStarted,
            label: "conversations started",
            icon: MessageCircle,
            color: "text-blue-600"
        },
        {
            count: signals.meetingsConducted,
            label: "meetings conducted",
            icon: Calendar,
            color: "text-purple-600"
        },
        {
            count: signals.proposalsShared,
            label: "proposals shared",
            icon: FileText,
            color: "text-amber-600"
        },
        {
            count: signals.partnershipsInitiated,
            label: "partnerships initiated",
            icon: Handshake,
            color: "text-green-600"
        },
    ].filter(item => item.count > 0);

    if (compact) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-help">
                            <Users className="w-3.5 h-3.5" />
                            <span>{totalInteractions} interactions</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        <p className="font-medium text-sm mb-2">Community signals</p>
                        <ul className="space-y-1">
                            {signalItems.map((item, idx) => (
                                <li key={idx} className="text-xs flex items-center gap-2">
                                    <item.icon className={`w-3 h-3 ${item.color}`} />
                                    <span>{item.count} {item.label}</span>
                                </li>
                            ))}
                        </ul>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Community signals</h4>
            </div>

            <ul className="space-y-2">
                {signalItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                            <Icon className={`w-4 h-4 ${item.color}`} />
                            <span className="text-foreground">
                                <span className="font-medium">{item.count}</span>{" "}
                                <span className="text-muted-foreground">{item.label}</span>
                            </span>
                        </li>
                    );
                })}
            </ul>

            <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/50">
                Based on aggregated user interactions
            </p>
        </div>
    );
}
