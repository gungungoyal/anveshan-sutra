/**
 * Locked Content Overlay Component
 * Displays a locked state overlay over organization details
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, CreditCard, CheckCircle } from "lucide-react";

interface LockedContentOverlayProps {
    organizationName: string;
    price?: number;
    onUnlock: () => void;
}

export default function LockedContentOverlay({
    organizationName,
    price = 99,
    onUnlock,
}: LockedContentOverlayProps) {
    return (
        <div className="relative">
            {/* Blurred content preview */}
            <div className="filter blur-sm pointer-events-none select-none opacity-40">
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-4 bg-muted rounded w-full"></div>
                            <div className="h-4 bg-muted rounded w-5/6"></div>
                            <div className="h-4 bg-muted rounded w-2/3"></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="h-4 bg-muted rounded w-1/2"></div>
                            <div className="flex gap-2">
                                <div className="h-8 bg-muted rounded w-20"></div>
                                <div className="h-8 bg-muted rounded w-24"></div>
                                <div className="h-8 bg-muted rounded w-20"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Centered unlock prompt */}
            <div className="absolute inset-0 flex items-center justify-center">
                <Card className="max-w-md w-full mx-4 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
                    <CardContent className="pt-6 text-center">
                        {/* Lock Icon */}
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-6">
                            <Lock className="w-10 h-10 text-primary" />
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-foreground mb-3">
                            Unlock Full Profile
                        </h3>

                        {/* Description */}
                        <p className="text-muted-foreground mb-6">
                            Get complete access to <span className="font-semibold text-foreground">{organizationName}</span>'s detailed information
                        </p>

                        {/* Pricing */}
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 mb-6">
                            <div className="flex items-baseline justify-center gap-1 mb-2">
                                <span className="text-4xl font-bold text-primary">₹{price}</span>
                                <span className="text-muted-foreground">/one-time</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Lifetime access to this organization</p>
                        </div>

                        {/* Features */}
                        <div className="text-left space-y-3 mb-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">Complete Mission & Vision</p>
                                    <p className="text-xs text-muted-foreground">Full organizational details</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">Projects & Impact Data</p>
                                    <p className="text-xs text-muted-foreground">Key projects and achievements</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">Partnership History</p>
                                    <p className="text-xs text-muted-foreground">Known partners and collaborators</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">Contact Information</p>
                                    <p className="text-xs text-muted-foreground">Direct communication channels</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <Button
                            onClick={onUnlock}
                            size="lg"
                            className="w-full"
                        >
                            <CreditCard className="w-5 h-5 mr-2" />
                            Unlock Now - ₹{price}
                        </Button>

                        {/* Security Note */}
                        <p className="text-xs text-muted-foreground mt-4">
                            🔒 Secure mock payment • No real charges
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
