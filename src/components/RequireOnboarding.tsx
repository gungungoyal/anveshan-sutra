"use client";

import { redirect } from "next/navigation";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/lib/stores/userStore";

interface RequireOnboardingProps {
    children: React.ReactNode;
    requireOrg?: boolean; // Whether this route requires organization setup
}

/**
 * Route guard component (Next.js App Router version)
 * 1. Redirects to /onboarding if role + intent not set
 * 2. Redirects NGO/Incubator to /org-submit if no org profile
 * 3. Allows CSR to access in read-only mode
 */
export default function RequireOnboarding({ children, requireOrg = true }: RequireOnboardingProps) {
    const pathname = usePathname();
    const { role, intent, onboardingComplete, hasOrganization } = useUserStore();

    // Check if onboarding is complete (role + intent selected)
    const isOnboarded = role && intent && onboardingComplete;

    if (!isOnboarded) {
        // Redirect to onboarding page
        redirect("/onboarding");
    }

    // CSR users can always access (read-only exploration mode)
    if (role === 'csr') {
        return <>{children}</>;
    }

    // NGO and Incubator need org profile for routes that require it
    if (requireOrg && !hasOrganization) {
        // Redirect to org-submit to create profile first
        redirect("/org-submit");
    }

    return <>{children}</>;
}
