"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams?.get("returnTo") || "/onboarding";

    useEffect(() => {
        const handleCallback = async () => {
            if (!supabase) {
                router.push("/auth?error=no_supabase");
                return;
            }

            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Auth callback error:", error);
                    router.push(`/auth?error=${encodeURIComponent(error.message)}`);
                    return;
                }

                if (session) {
                    router.push(returnTo);
                } else {
                    router.push("/auth");
                }
            } catch (err) {
                console.error("Auth callback error:", err);
                router.push("/auth?error=callback_failed");
            }
        };

        handleCallback();
    }, [router, returnTo]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Completing sign in...</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
