"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart, Rocket, Building2, ArrowRight, ArrowLeft, CheckCircle,
    User, Phone, Loader2
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserStore, OnboardingStep } from "@/lib/stores/userStore";
import { useAuth } from "@/hooks/useAuth";
import { savePersonalInfo, saveRole, getOnboardingStatus, getDashboardPath } from "@/lib/services/onboarding";
import { toast } from "sonner";

type Role = "ngo" | "incubator" | "csr";

const roles = [
    {
        id: "ngo" as Role,
        title: "NGO / Non-Profit",
        description: "Find CSR partners and incubators aligned with your mission",
        icon: Heart,
        color: "bg-green-500",
        borderColor: "border-green-500",
        gradient: "from-green-500 to-emerald-600",
    },
    {
        id: "incubator" as Role,
        title: "Incubator / Accelerator",
        description: "Connect with NGOs and CSR teams for impact partnerships",
        icon: Rocket,
        color: "bg-sky-500",
        borderColor: "border-sky-500",
        gradient: "from-sky-500 to-blue-600",
    },
    {
        id: "csr" as Role,
        title: "CSR / Corporate",
        description: "Discover verified NGOs for your CSR initiatives",
        icon: Building2,
        color: "bg-orange-500",
        borderColor: "border-orange-500",
        gradient: "from-orange-500 to-amber-600",
    },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    const {
        setRole, setIntent, completeOnboarding,
        setOnboardingStep, setPersonalInfo, setHasOrganization,
        onboardingStep: storeStep, userName, hasOrganization
    } = useUserStore();

    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);

    // Form state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    // Check onboarding status on mount
    useEffect(() => {
        const checkStatus = async () => {
            if (!user?.id) {
                setIsCheckingStatus(false);
                return;
            }

            const status = await getOnboardingStatus(user.id);
            if (status) {
                // If user already has organization, redirect to dashboard
                if (status.hasOrganization) {
                    setHasOrganization(true);
                    router.push(getDashboardPath(status.role));
                    return;
                }

                // Set form values from existing data
                if (status.name) setName(status.name);
                if (status.phone) setPhone(status.phone);
                if (status.role) setSelectedRole(status.role as Role);

                // Resume from the correct step
                switch (status.step) {
                    case 'personal_info':
                        setCurrentStep(1);
                        break;
                    case 'role_selection':
                        setCurrentStep(2);
                        break;
                    case 'org_form':
                        // Redirect to org form
                        router.push('/org-submit');
                        return;
                    case 'complete':
                        // Redirect to dashboard
                        router.push(getDashboardPath(status.role));
                        return;
                }
            }
            setIsCheckingStatus(false);
        };

        if (!authLoading && isAuthenticated) {
            checkStatus();
        } else if (!authLoading && !isAuthenticated) {
            router.push('/auth');
        }
    }, [user, authLoading, isAuthenticated, router, setHasOrganization]);

    // Pre-fill name from auth user
    useEffect(() => {
        if (user?.name && !name) {
            setName(user.name);
        }
    }, [user, name]);

    const handleStep1Submit = async () => {
        if (!name.trim()) {
            toast.error("Please enter your name");
            return;
        }
        if (!phone.trim()) {
            toast.error("Please enter your phone number");
            return;
        }

        // Basic phone validation (Indian format)
        const phoneRegex = /^[6-9]\d{9}$/;
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        if (!phoneRegex.test(cleanPhone)) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        setIsLoading(true);
        try {
            if (!user?.id) {
                toast.error("Please log in to continue");
                return;
            }

            const result = await savePersonalInfo(user.id, name, phone, user.email || '');
            if (result.success) {
                setPersonalInfo(name, phone);
                setOnboardingStep('role_selection');
                setCurrentStep(2);
            } else {
                toast.error(result.error || "Failed to save information");
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep2Submit = async () => {
        if (!selectedRole) {
            toast.error("Please select your role");
            return;
        }

        setIsLoading(true);
        try {
            if (!user?.id) {
                toast.error("Please log in to continue");
                return;
            }

            const result = await saveRole(user.id, selectedRole);
            if (result.success) {
                // Update local store
                setRole(selectedRole);
                const defaultIntent = selectedRole === "ngo" ? "seeker"
                    : selectedRole === "incubator" ? "both"
                        : "provider";
                setIntent(defaultIntent);
                setOnboardingStep('org_form');
                completeOnboarding();

                // Redirect to org form
                router.push('/org-submit');
            } else {
                toast.error(result.error || "Failed to save role");
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    // Loading states
    if (authLoading || isCheckingStatus) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const stepProgress = (currentStep / 2) * 100;

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-12 max-w-2xl">
                {/* Progress Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Step {currentStep} of 2</span>
                        <span>{Math.round(stepProgress)}% Complete</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${stepProgress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </motion.div>

                {/* Welcome Message */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full mb-6"
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Account Created Successfully!</span>
                    </motion.div>

                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Welcome to Drivya.AI
                    </h1>
                    <p className="text-muted-foreground">
                        {currentStep === 1
                            ? "Let's start with your personal information"
                            : "Select your role to personalize your experience"}
                    </p>
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-2xl p-8 shadow-lg"
                >
                    <AnimatePresence mode="wait">
                        {/* Step 1: Personal Info */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary-foreground" />
                                    </div>
                                    <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Full Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your full name"
                                            className="h-12 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            Phone Number *
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+91 XXXXX XXXXX"
                                            className="h-12 rounded-xl"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            We'll use this to contact you about matches
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleStep1Submit}
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-xl text-base"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Continue
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        )}

                        {/* Step 2: Role Selection */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-primary-foreground" />
                                    </div>
                                    <h2 className="text-xl font-bold text-foreground">Select Your Role</h2>
                                </div>

                                {/* Role Cards */}
                                <div className="space-y-4">
                                    {roles.map((role, index) => {
                                        const Icon = role.icon;
                                        const isSelected = selectedRole === role.id;

                                        return (
                                            <motion.button
                                                key={role.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                onClick={() => setSelectedRole(role.id)}
                                                className={`relative w-full p-5 rounded-xl border-2 text-left transition-all ${isSelected
                                                    ? `${role.borderColor} bg-primary/5 shadow-md`
                                                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Icon */}
                                                    <div className={`w-12 h-12 ${role.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                                        <Icon className="w-6 h-6 text-white" />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-foreground">
                                                            {role.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {role.description}
                                                        </p>
                                                    </div>

                                                    {/* Selection indicator */}
                                                    {isSelected && (
                                                        <div className={`w-6 h-6 ${role.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                                                            <CheckCircle className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Navigation */}
                                <div className="flex gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(1)}
                                        className="flex-1 h-12 rounded-xl"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleStep2Submit}
                                        disabled={!selectedRole || isLoading}
                                        className="flex-1 h-12 rounded-xl"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Continue
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <p className="text-xs text-center text-muted-foreground">
                                    You can change your role anytime from settings
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
