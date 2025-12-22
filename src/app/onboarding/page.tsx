"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Rocket, Building2, ArrowRight, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/stores/userStore";
import { useAuth } from "@/hooks/useAuth";

type Role = "ngo" | "incubator" | "csr";

const roles = [
    {
        id: "ngo" as Role,
        title: "NGO / Non-Profit",
        description: "Find CSR partners and incubators aligned with your mission",
        icon: Heart,
        color: "bg-green-500",
        borderColor: "border-green-500",
        nextStep: "/org-submit",
    },
    {
        id: "incubator" as Role,
        title: "Incubator / Accelerator",
        description: "Connect with NGOs and CSR teams for impact partnerships",
        icon: Rocket,
        color: "bg-sky-500",
        borderColor: "border-sky-500",
        nextStep: "/org-submit",
    },
    {
        id: "csr" as Role,
        title: "CSR / Corporate",
        description: "Discover verified NGOs for your CSR initiatives",
        icon: Building2,
        color: "bg-orange-500",
        borderColor: "border-orange-500",
        nextStep: "/search",
    },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { setRole, setIntent, completeOnboarding } = useUserStore();
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = async () => {
        if (!selectedRole) return;

        setIsLoading(true);

        // Save role to store
        setRole(selectedRole);

        // Set default intent based on role (using valid UserIntent types)
        const defaultIntent = selectedRole === "ngo" ? "seeker"
            : selectedRole === "incubator" ? "both"
                : "provider";
        setIntent(defaultIntent);

        // Mark onboarding as complete
        completeOnboarding();

        // Navigate to next step
        const roleConfig = roles.find(r => r.id === selectedRole);
        router.push(roleConfig?.nextStep || "/search");
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Welcome Message */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full mb-6"
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Account Created Successfully!</span>
                    </motion.div>

                    <h1 className="text-4xl font-bold text-foreground mb-4">
                        Welcome to Drivya.AI
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Let's personalize your experience. Select your role to get started with relevant features and matching.
                    </p>
                </div>

                {/* Role Selection */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    {roles.map((role, index) => {
                        const Icon = role.icon;
                        const isSelected = selectedRole === role.id;

                        return (
                            <motion.button
                                key={role.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => setSelectedRole(role.id)}
                                className={`relative p-6 rounded-2xl border-2 text-left transition-all ${isSelected
                                    ? `${role.borderColor} bg-primary/5 shadow-lg scale-[1.02]`
                                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                                    }`}
                            >
                                {/* Selection indicator */}
                                {isSelected && (
                                    <div className={`absolute top-4 right-4 w-6 h-6 ${role.color} rounded-full flex items-center justify-center`}>
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`w-14 h-14 ${role.color} rounded-xl flex items-center justify-center mb-4`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    {role.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {role.description}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Continue Button */}
                <div className="text-center">
                    <Button
                        size="lg"
                        onClick={handleContinue}
                        disabled={!selectedRole || isLoading}
                        className="px-12 py-6 text-lg"
                    >
                        {isLoading ? (
                            "Setting up..."
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </Button>

                    <p className="text-sm text-muted-foreground mt-4">
                        You can change your role anytime from settings
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
