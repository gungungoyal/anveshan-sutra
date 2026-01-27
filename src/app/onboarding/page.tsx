"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Heart, Rocket, Building2, Loader2, CheckCircle,
    Target, Handshake, GraduationCap, Search, Globe
} from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/lib/stores/userStore";
import { useAuth } from "@/hooks/useAuth";
import { completeOnboarding as completeOnboardingApi } from "@/lib/services/onboarding";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { fetchWithTimeout } from "@/lib/utils/async";

type Role = "ngo" | "incubator" | "csr";
type PrimaryGoal = "funding" | "partnerships" | "programs" | "scouting";

const roles = [
    {
        id: "ngo" as Role,
        title: "NGO / Non-Profit",
        icon: Heart,
        color: "bg-green-500",
    },
    {
        id: "incubator" as Role,
        title: "Incubator / Accelerator",
        icon: Rocket,
        color: "bg-sky-500",
    },
    {
        id: "csr" as Role,
        title: "CSR / Corporate",
        icon: Building2,
        color: "bg-orange-500",
    },
];

const goals = [
    {
        id: "funding" as PrimaryGoal,
        title: "Funding",
        description: "Looking for grants or CSR funding",
        icon: Target,
    },
    {
        id: "partnerships" as PrimaryGoal,
        title: "Partnerships",
        description: "Seeking collaboration opportunities",
        icon: Handshake,
    },
    {
        id: "programs" as PrimaryGoal,
        title: "Programs",
        description: "Running or joining programs",
        icon: GraduationCap,
    },
    {
        id: "scouting" as PrimaryGoal,
        title: "Scouting",
        description: "Discovering organizations",
        icon: Search,
    },
];

const countries = [
    "India",
    "United States",
    "United Kingdom",
    "Singapore",
    "UAE",
    "Other",
];

export default function OnboardingPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    const { setRole, setIntent, completeOnboarding, setOnboardingStep, setHasOrganization } = useUserStore();

    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);

    // Form state - only 4 fields
    const [organizationName, setOrganizationName] = useState("");
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | null>(null);
    const [country, setCountry] = useState("");

    // Check if already onboarded - redirect to explore if so
    useEffect(() => {
        const checkStatus = async () => {
            if (!user?.id) {
                setIsCheckingStatus(false);
                return;
            }

            // Simple check: if user has profile_complete, redirect to explore
            // This prevents already-onboarded users from seeing this form again
            try {
                const response = await fetchWithTimeout('/api/onboarding-status', {
                    credentials: 'include',
                }, 10000);

                if (response.ok) {
                    const status = await response.json();

                    // If already completed onboarding, redirect to explore
                    if (status.profileComplete === true || status.onboardingComplete === true) {
                        console.log('[Onboarding] User already completed, redirecting to /explore');
                        router.push('/explore');
                        return;
                    }
                }
            } catch (error) {
                // API failed - that's okay, allow form to show
                console.warn('Could not check onboarding status:', error);
            }

            setIsCheckingStatus(false);
        };

        if (!authLoading && isAuthenticated) {
            checkStatus();
        } else if (!authLoading && !isAuthenticated) {
            setIsCheckingStatus(false);
        }
    }, [user, authLoading, isAuthenticated, router]);

    const handleSubmit = async () => {
        // Validate required fields
        if (!organizationName.trim()) {
            toast.error("Please enter your organization name");
            return;
        }
        if (!selectedRole) {
            toast.error("Please select your role");
            return;
        }
        if (!primaryGoal) {
            toast.error("Please select your primary goal");
            return;
        }
        if (!country) {
            toast.error("Please select your country");
            return;
        }

        // Get user ID - fallback to session if useAuth hasn't updated yet (race condition fix)
        let userId = user?.id;
        let userEmail = user?.email;
        let userName = user?.name;

        console.log('[Onboarding] handleSubmit - user from useAuth:', user?.id ? 'present' : 'null');
        console.log('[Onboarding] supabase client:', supabase ? 'configured' : 'null');

        if (!userId && supabase) {
            // Try to get user from current session as fallback
            console.log('[Onboarding] User not in context, checking session...');
            try {
                const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.getUser();
                console.log('[Onboarding] getUser result:', sessionUser?.id ? 'found user' : 'no user', 'error:', sessionError?.message || 'none');

                if (sessionUser) {
                    userId = sessionUser.id;
                    userEmail = sessionUser.email || '';
                    userName = sessionUser.user_metadata?.name || organizationName.trim();
                }
            } catch (err) {
                console.error('[Onboarding] getUser threw exception:', err);
            }
        }

        if (!userId) {
            console.error('[Onboarding] No user ID found, redirecting to auth');
            toast.error("Please log in to continue");
            router.push('/auth');
            return;
        }

        console.log('[Onboarding] Proceeding with userId:', userId);

        setIsLoading(true);
        try {
            // Save to user_profiles via server-side API (bypasses RLS)
            const profileResponse = await fetchWithTimeout('/api/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    email: userEmail,
                    name: userName || organizationName.trim(),
                    role: selectedRole,
                    userIntent: selectedRole === "ngo" ? "seeker" : selectedRole === "incubator" ? "both" : "provider",
                    organizationName: organizationName.trim(),
                }),
            }, 15000);

            if (!profileResponse.ok) {
                const errorData = await profileResponse.json();
                console.error('Profile update error:', errorData);
                toast.error("Failed to save profile: " + (errorData.error || 'Unknown error'));
                setIsLoading(false);
                return;
            }

            // Update local store
            setRole(selectedRole);
            const defaultIntent = selectedRole === "ngo" ? "seeker"
                : selectedRole === "incubator" ? "both"
                    : "provider";
            setIntent(defaultIntent);
            setOnboardingStep('complete');
            completeOnboarding();
            setHasOrganization(true);

            // Profile already updated via /api/update-profile - no need for extra call

            toast.success("Welcome to Drivya.AI!");

            // Redirect to explore page
            router.push('/explore');
        } catch (error: any) {
            console.error('Onboarding error:', error);
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state - wait for auth to fully initialize
    if (authLoading || isCheckingStatus) {
        return (
            <AuthLayout>
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </AuthLayout>
        );
    }

    // ✅ Critical: Redirect to auth if not authenticated AFTER loading is complete
    if (!isAuthenticated) {
        router.push('/auth?returnTo=/onboarding');
        return (
            <AuthLayout>
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="flex-1 container mx-auto px-4 py-12 max-w-xl">
                {/* Welcome Message */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full mb-6"
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Account Created!</span>
                    </motion.div>

                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Quick Setup
                    </h1>
                    <p className="text-muted-foreground">
                        Tell us about yourself to get started (takes 30 seconds)
                    </p>
                </div>

                {/* Single Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-2xl p-8 shadow-lg"
                >
                    <div className="space-y-6">
                        {/* Organization Name */}
                        <div className="space-y-2">
                            <Label htmlFor="org-name" className="text-sm font-medium">
                                Organization Name *
                            </Label>
                            <Input
                                id="org-name"
                                value={organizationName}
                                onChange={(e) => setOrganizationName(e.target.value)}
                                placeholder="Enter your organization name"
                                className="h-12 rounded-xl"
                            />
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                I am a... *
                            </Label>
                            <div className="grid grid-cols-3 gap-3">
                                {roles.map((role) => {
                                    const Icon = role.icon;
                                    const isSelected = selectedRole === role.id;

                                    return (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => setSelectedRole(role.id)}
                                            className={`p-4 rounded-xl border-2 text-center transition-all ${isSelected
                                                ? "border-primary bg-primary/5 shadow-md"
                                                : "border-border hover:border-primary/30"
                                                }`}
                                        >
                                            <div className={`w-10 h-10 ${role.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-xs font-medium text-foreground">
                                                {role.title.split(' / ')[0]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Primary Goal */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Primary Goal *
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                                {goals.map((goal) => {
                                    const Icon = goal.icon;
                                    const isSelected = primaryGoal === goal.id;

                                    return (
                                        <button
                                            key={goal.id}
                                            type="button"
                                            onClick={() => setPrimaryGoal(goal.id)}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/30"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{goal.title}</p>
                                                    <p className="text-xs text-muted-foreground">{goal.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Country */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Country *
                            </Label>
                            <Select value={country} onValueChange={setCountry}>
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || !organizationName || !selectedRole || !primaryGoal || !country}
                            className="w-full h-12 rounded-xl text-base"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Get Started
                                    <CheckCircle className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            You can update these details anytime from settings
                        </p>
                    </div>
                </motion.div>
            </div>
        </AuthLayout>
    );
}
