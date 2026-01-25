"use client";

import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/lib/stores/userStore";

interface RequireAuthProps {
    children: React.ReactNode;
    /** @deprecated Setup checks now handled by /start page */
    requireSetup?: boolean;
}

/**
 * RequireAuth - Simplified wrapper
 * 
 * Auth protection is now handled by middleware.ts
 * This component is kept for backwards compatibility.
 * 
 * @deprecated Consider removing this wrapper since middleware handles auth.
 */
export default function RequireAuth({
    children,
}: RequireAuthProps) {
    // Middleware already verified auth - just render children
    return <>{children}</>;
}

/**
 * UI-only access check hook - for conditional rendering (NOT redirects)
 * 
 * Use this for:
 * - Showing/hiding UI elements based on auth state
 * - Displaying different content for different roles
 * - Prompting users to complete setup
 * 
 * DO NOT use for navigation/redirects - middleware handles that.
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
        // Quick helpers for UI conditionals
        canSave: isAuthenticated && (role === "csr" || hasOrganization || role === "incubator"),
        needsSetup: role === "ngo" && !hasOrganization,
        showSetupPrompt: role === "incubator" && !hasOrganization,
    };
}
