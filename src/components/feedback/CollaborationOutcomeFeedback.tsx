import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { X, Check, MessageCircle, Calendar, FileText, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface CollaborationOutcomeFeedbackProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organizationId: string;
    organizationName: string;
    triggerAction: "view_profile" | "download_ppt" | "shortlist";
}

type OutcomeType =
    | "no_response"
    | "conversation_started"
    | "meeting_conducted"
    | "proposal_shared"
    | "partnership_initiated";

const outcomeOptions: { value: OutcomeType; label: string; icon: typeof MessageCircle }[] = [
    { value: "no_response", label: "No response yet", icon: MessageCircle },
    { value: "conversation_started", label: "Initial conversation started", icon: MessageCircle },
    { value: "meeting_conducted", label: "Meeting conducted", icon: Calendar },
    { value: "proposal_shared", label: "Proposal shared", icon: FileText },
    { value: "partnership_initiated", label: "Partnership / funding initiated", icon: Handshake },
];

/**
 * LAYER 2 — Collaboration Outcome Feedback (Structured)
 * 
 * Triggered after user views full profile, downloads PPT, or saves/shortlists.
 * Asks ONE structured question about collaboration outcomes.
 * Aggregated display only — no individual comments, no negative wording.
 */
export default function CollaborationOutcomeFeedback({
    open,
    onOpenChange,
    organizationId,
    organizationName,
    triggerAction
}: CollaborationOutcomeFeedbackProps) {
    const { isAuthenticated, user } = useAuth();
    const [selectedOutcome, setSelectedOutcome] = useState<OutcomeType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [hasExistingFeedback, setHasExistingFeedback] = useState(false);

    // Check for existing feedback (one per user per org)
    useEffect(() => {
        if (!user?.id || !organizationId) return;

        const existingFeedback = JSON.parse(localStorage.getItem("collaboration_feedback") || "[]");
        const existing = existingFeedback.find(
            (f: any) => f.userId === user.id && f.organizationId === organizationId
        );

        if (existing) {
            setHasExistingFeedback(true);
            setSelectedOutcome(existing.outcome);
        }
    }, [user?.id, organizationId]);

    const handleSubmit = async () => {
        if (!selectedOutcome || !user?.id) return;

        setIsSubmitting(true);

        try {
            const feedback = {
                organizationId,
                userId: user.id,
                outcome: selectedOutcome,
                triggerAction,
                timestamp: new Date().toISOString(),
            };

            // Store/update in localStorage (would be API call in production)
            const existing = JSON.parse(localStorage.getItem("collaboration_feedback") || "[]");

            // Remove any existing feedback for this user+org (update, not duplicate)
            const filtered = existing.filter(
                (f: any) => !(f.userId === user.id && f.organizationId === organizationId)
            );

            filtered.push(feedback);
            localStorage.setItem("collaboration_feedback", JSON.stringify(filtered));

            setIsSubmitted(true);

            setTimeout(() => {
                setIsSubmitted(false);
                onOpenChange(false);
            }, 1500);

        } catch (err) {
            console.error("Failed to submit outcome feedback:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        onOpenChange(false);
    };

    // Don't show if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                {isSubmitted ? (
                    /* Success State */
                    <div className="py-6 text-center">
                        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Check className="w-7 h-7 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">Thanks!</h3>
                        <p className="text-sm text-muted-foreground">
                            Your feedback helps others find great partners.
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-lg">
                                Did this lead to anything?
                            </DialogTitle>
                            <DialogDescription>
                                {hasExistingFeedback
                                    ? `Update your outcome with ${organizationName}`
                                    : `Help others by sharing your experience with ${organizationName}`
                                }
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 mt-4">
                            {outcomeOptions.map((option) => {
                                const Icon = option.icon;
                                const isSelected = selectedOutcome === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setSelectedOutcome(option.value)}
                                        className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-primary/10" : "bg-muted"
                                            }`}>
                                            <Icon className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                        </div>
                                        <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                                            {option.label}
                                        </span>
                                        {isSelected && (
                                            <Check className="w-4 h-4 text-primary ml-auto" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-between gap-3 mt-6">
                            <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting} className="text-muted-foreground">
                                Skip
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting || !selectedOutcome}>
                                {isSubmitting ? "Saving..." : hasExistingFeedback ? "Update" : "Submit"}
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground text-center mt-3">
                            Your response is aggregated anonymously. No individual feedback is shown.
                        </p>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
