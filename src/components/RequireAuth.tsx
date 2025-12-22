"use client";

import { usePathname, useSearchParams, redirect } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/lib/stores/userStore";
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
    children: React.ReactNode;
    /** Require organization setup - blocks NGO completely, prompts Incubator */
    requireSetup?: boolean;
}

/**
 * Hard access control guard (Next.js App Router version)
 * 
 * Enforcement levels:
 * 1. Auth required → redirect to /auth
 * 2. Role required → redirect to / if not selected
 * 3. Setup required → role-specific enforcement
 */
export default function RequireAuth({
    children,
    requireSetup = false
}: RequireAuthProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading } = useAuth();
    const { role, hasOrganization } = useUserStore();

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // 1. Auth check - redirect to login
    if (!isAuthenticated) {
        const returnTo = encodeURIComponent(pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''));
        redirect(`/auth?returnTo=${returnTo}`);
    }

    // 2. Role check - must have selected a role
    if (!role) {
        redirect("/");
    }

    // 3. Setup enforcement (role-specific)
    if (requireSetup && !hasOrganization) {
        // NGO MUST have setup - redirect to setup
        if (role === "ngo") {
            redirect("/start/ngo");
        }

        // Incubator - allow but will show prompt in component
        // CSR - no setup required
    }

    return <>{children}</>;
}

/**
 * Check if user can access advanced features
 * Returns: { canAccess: boolean, reason?: string }
 */
export function useAccessCheck() {
    const { isAuthenticated } = useAuth();
    const { role, hasOrganization } = useUserStore();

    const checkAdvancedAccess = () => {
        if (!isAuthenticated) {
            return {
                canAccess: false,
                reason: "Sign in to access this feature",
                action: "signin"
            };
        }

        if (!role) {
            return {
                canAccess: false,
                reason: "Select your role to continue",
                action: "selectRole"
            };
        }

        // NGO must have organization
        if (role === "ngo" && !hasOrganization) {
            return {
                canAccess: false,
                reason: "Set up your NGO profile to find relevant CSR and Incubator partners.",
                action: "setup"
            };
        }

        // Incubator without org can access but with limitations
        if (role === "incubator" && !hasOrganization) {
            return {
                canAccess: true,
                reason: "Complete your Incubator profile to unlock alignment insights.",
                action: "promptSetup",
                isLimited: true
            };
        }

        // CSR and fully-setup users have full access
        return { canAccess: true };
    };

    return {
        isAuthenticated,
        role,
        hasOrganization,
        checkAdvancedAccess,
        // Quick helpers
        canSave: isAuthenticated && (role === "csr" || hasOrganization || role === "incubator"),
        needsSetup: role === "ngo" && !hasOrganization,
        showSetupPrompt: role === "incubator" && !hasOrganization,
    };
}
