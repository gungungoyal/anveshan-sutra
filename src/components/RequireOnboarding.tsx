"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/stores/userStore";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface RequireOnboardingProps {
    children: React.ReactNode;
    requireOrg?: boolean; // Whether this route requires organization setup
}

/**
 * Route guard component (Next.js App Router version)
 * 1. Redirects to /auth if not authenticated
 * 2. Redirects to /onboarding if onboarding not complete
 * 3. Redirects NGO/Incubator to /org-submit if no org profile
 * 4. Allows CSR to access in read-only mode
 */
export default function RequireOnboarding({ children, requireOrg = true }: RequireOnboardingProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    const { role, intent, onboardingComplete, hasOrganization, onboardingStep } = useUserStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            // Wait for auth to load
            if (authLoading) return;

            // NOTE: Auth redirect removed - middleware.ts handles auth protection
            // If not authenticated, middleware will redirect
            if (!isAuthenticated) {
                return;
            }

            // Check onboarding status from API for accurate data
            try {
                const response = await fetch('/api/onboarding-status');
                if (response.ok) {
                    const status = await response.json();

                    // If onboarding not complete, redirect to onboarding
                    if (status.step !== 'complete' && status.step !== 'org_form') {
                        router.push('/onboarding');
                        return;
                    }

                    // If at org_form step but no org, redirect to org-submit
                    if (status.step === 'org_form' && !status.hasOrganization) {
                        router.push('/org-submit');
                        return;
                    }

                    // CSR users can always access (read-only exploration mode)
                    if (status.role === 'csr') {
                        setIsChecking(false);
                        return;
                    }

                    // NGO and Incubator need org profile for routes that require it
                    if (requireOrg && !status.hasOrganization) {
                        router.push('/org-submit');
                        return;
                    }
                }
            } catch (error) {
                console.error('Error checking onboarding status:', error);
            }

            setIsChecking(false);
        };

        checkAccess();
    }, [authLoading, isAuthenticated, router, requireOrg, user]);

    // Show loader while checking
    if (authLoading || isChecking) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
