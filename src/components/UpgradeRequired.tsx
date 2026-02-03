"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

/**
 * UpgradeRequired - Dumb UI Component
 * 
 * Responsibilities (ONLY UI):
 * - Display a title
 * - Display short value text
 * - Show one CTA button: "Upgrade to unlock"
 * - Emit onUpgradeClick
 * 
 * Must NOT:
 * - Know user role
 * - Know limits
 * - Know pricing
 * - Know Razorpay
 * - Decide when to appear
 */

interface UpgradeRequiredProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onUpgradeClick: () => void;
}

export function UpgradeRequired({
    open,
    onOpenChange,
    title,
    description,
    onUpgradeClick,
}: UpgradeRequiredProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center sm:text-center">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-xl">{title}</DialogTitle>
                    <DialogDescription className="text-muted-foreground pt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center pt-4">
                    <Button
                        size="lg"
                        onClick={() => {
                            onUpgradeClick();
                            onOpenChange(false);
                        }}
                        className="gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        Upgrade to unlock
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
