"use client";

import { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
    redirectTo?: string;
}

/**
 * ProtectedRoute - Simplified wrapper
 * 
 * Auth protection is now handled by middleware.ts
 * This component is kept for backwards compatibility but no longer performs
 * client-side auth checks or redirects.
 * 
 * @deprecated Consider removing this wrapper since middleware handles auth.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    // Middleware already verified auth - just render children
    return <>{children}</>;
}
