"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Star, Eye, Heart, ChevronRight,
    Sparkles, Clock, Bookmark, AlertCircle
} from "lucide-react";

// Placeholder organization item
function OrgPlaceholder({
    variant = "default"
}: {
    variant?: "high-fit" | "new" | "saved" | "low-priority" | "default"
}) {
    const variants = {
        "high-fit": { badge: "92% Match", badgeClass: "bg-green-500 text-white" },
        "new": { badge: "New", badgeClass: "bg-blue-500 text-white" },
        "saved": { badge: "Saved", badgeClass: "bg-amber-500 text-white" },
        "low-priority": { badge: "45% Match", badgeClass: "bg-slate-400 text-white" },
        "default": { badge: "", badgeClass: "" },
    };

    const { badge, badgeClass } = variants[variant];

    return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
                {/* Placeholder avatar */}
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <div className="w-8 h-8 bg-muted-foreground/20 rounded" />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-4 w-32 bg-muted rounded" />
                        {badge && (
                            <Badge className={badgeClass}>{badge}</Badge>
                        )}
                    </div>
                    <div className="h-3 w-48 bg-muted rounded" />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4" />
                </Button>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Page Title - Decision Focused */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground mb-1">
                        What should I look at today?
                    </h1>
                    <p className="text-muted-foreground">
                        Your decision workspace
                    </p>
                </div>

                <div className="grid gap-8">
                    {/* Section 1: High-Fit Organizations */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Sparkles className="w-5 h-5 text-green-500" />
                                    High-Fit Organizations
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                    View all
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Organizations most aligned with your goals
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <OrgPlaceholder variant="high-fit" />
                            <OrgPlaceholder variant="high-fit" />
                            <OrgPlaceholder variant="high-fit" />
                        </CardContent>
                    </Card>

                    {/* Section 2: Recently Added */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                    Recently Added
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                    View all
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                New opportunities added this week
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <OrgPlaceholder variant="new" />
                            <OrgPlaceholder variant="new" />
                        </CardContent>
                    </Card>

                    {/* Section 3: Saved / Shortlisted */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Bookmark className="w-5 h-5 text-amber-500" />
                                    Saved Organizations
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                    View all
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Your shortlisted organizations for follow-up
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Bookmark className="w-10 h-10 text-muted-foreground/30 mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    No saved organizations yet
                                </p>
                                <p className="text-xs text-muted-foreground/70">
                                    Click the heart icon on any organization to save it here
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 4: Low-Priority */}
                    <Card className="border-dashed">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
                                    <AlertCircle className="w-5 h-5 text-slate-400" />
                                    Low Priority
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                    View all
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Organizations with lower alignment scores
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <OrgPlaceholder variant="low-priority" />
                            <OrgPlaceholder variant="low-priority" />
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}
