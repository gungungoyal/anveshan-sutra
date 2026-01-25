"use client";

import { ReactNode } from "react";

interface RequireOnboardingProps {
    children: ReactNode;
    /** @deprecated Org checks now handled by /start page */
    requireOrg?: boolean;
}

/**
 * RequireOnboarding - Simplified wrapper
 * 
 * Auth and onboarding protection is now handled by:
 * - middleware.ts for auth checks
 * - /start page for role/onboarding routing
 * 
 * This component is kept for backwards compatibility but no longer performs
 * client-side checks, API calls, or redirects.
 * 
 * @deprecated Consider removing this wrapper since middleware + /start handle routing.
 */
export default function RequireOnboarding({ children }: RequireOnboardingProps) {
    // Middleware and /start page handle auth/onboarding - just render children
    return <>{children}</>;
}
