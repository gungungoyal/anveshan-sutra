"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { X, MessageSquare, Bug, Lightbulb, HelpCircle, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface PlatformFeedbackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type FeedbackType = "ux" | "feature" | "bug" | "other";

const feedbackTypes: { value: FeedbackType; label: string; icon: typeof MessageSquare; description: string }[] = [
    { value: "ux", label: "UX Issue", icon: MessageSquare, description: "Something is confusing or hard to use" },
    { value: "feature", label: "Feature Request", icon: Lightbulb, description: "Suggest a new feature or improvement" },
    { value: "bug", label: "Bug Report", icon: Bug, description: "Something isn't working correctly" },
    { value: "other", label: "Other", icon: HelpCircle, description: "General feedback or question" },
];

/**
 * LAYER 1 — Platform Feedback (Private)
 * 
 * Private feedback form for logged-in users to report UX issues,
 * request features, or report bugs. Feedback is NOT public.
 */
export default function PlatformFeedbackModal({ open, onOpenChange }: PlatformFeedbackModalProps) {
    const { isAuthenticated } = useAuth();
    const pathname = usePathname();

    const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!selectedType) {
            toast.error("Please select a feedback type");
            return;
        }

        setIsSubmitting(true);

        try {
            // In a real app, this would send to backend
            // For now, we'll simulate and store locally
            const feedback = {
                type: selectedType,
                message: message.trim() || null,
                page: pathname,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
            };

            // Store in localStorage for MVP (would be API call in production)
            const existing = JSON.parse(localStorage.getItem("platform_feedback") || "[]");
            existing.push(feedback);
            localStorage.setItem("platform_feedback", JSON.stringify(existing));

            setIsSubmitted(true);

            // Reset after delay
            setTimeout(() => {
                setIsSubmitted(false);
                setSelectedType(null);
                setMessage("");
                onOpenChange(false);
            }, 2000);

        } catch (err) {
            toast.error("Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setSelectedType(null);
            setMessage("");
            setIsSubmitted(false);
            onOpenChange(false);
        }
    };

    // Require authentication
    if (!isAuthenticated) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Sign in to give feedback</DialogTitle>
                        <DialogDescription>
                            Please sign in to share your feedback with us.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={handleClose}>Cancel</Button>
                        <Button asChild>
                            <a href={`/auth?returnTo=${encodeURIComponent(pathname)}`}>Sign In</a>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                {isSubmitted ? (
                    /* Success State */
                    <div className="py-8 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Thank you!</h3>
                        <p className="text-muted-foreground">
                            Your feedback helps us improve Drivya.AI for everyone.
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                Give Feedback
                            </DialogTitle>
                            <DialogDescription>
                                Help us improve Drivya.AI. Your feedback is private and helps us build a better platform.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 mt-4">
                            {/* Feedback Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-3">
                                    What type of feedback is this?
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {feedbackTypes.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = selectedType === type.value;
                                        return (
                                            <button
                                                key={type.value}
                                                onClick={() => setSelectedType(type.value)}
                                                className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary/50"
                                                    }`}
                                            >
                                                <Icon className={`w-5 h-5 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                                <p className={`font-medium text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>
                                                    {type.label}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {type.description}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Optional Message */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Tell us more <span className="text-muted-foreground font-normal">(optional)</span>
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe your experience or suggestion..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                                />
                            </div>

                            {/* Context Info */}
                            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                                <p>📍 Page: <span className="font-mono">{pathname}</span></p>
                                <p className="mt-1 opacity-75">This context helps us understand your feedback better.</p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} disabled={isSubmitting || !selectedType}>
                                    {isSubmitting ? (
                                        <>Submitting...</>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit Feedback
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
