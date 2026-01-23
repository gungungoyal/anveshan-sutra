"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: ReactNode;
    redirectTo?: string;
}

/**
 * Wrapper component that protects routes requiring authentication.
 * Redirects unauthenticated users to /auth with return URL.
 */
export default function ProtectedRoute({ children, redirectTo = "/login" }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            const returnTo = window.location.pathname + window.location.search;
            router.push(`${redirectTo}?returnTo=${encodeURIComponent(returnTo)}`);
        }
    }, [isAuthenticated, isLoading, router, redirectTo]);

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Don't render until authenticated
    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
