import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

/**
 * OAuth Callback Handler
 * Handles redirect after Google/LinkedIn sign-in
 */
export default function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    const returnTo = searchParams.get("returnTo") || "/";

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get session from URL hash (Supabase OAuth)
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Auth callback error:", error);
                    setError(error.message);
                    return;
                }

                if (data.session) {
                    // Successfully authenticated - redirect to intended destination
                    navigate(decodeURIComponent(returnTo), { replace: true });
                } else {
                    // No session - go back to auth
                    navigate("/auth", { replace: true });
                }
            } catch (err) {
                console.error("Callback error:", err);
                setError("Authentication failed. Please try again.");
            }
        };

        handleCallback();
    }, [navigate, returnTo]);

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-destructive mb-4">{error}</p>
                    <button
                        onClick={() => navigate("/auth")}
                        className="text-primary underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Completing sign in...</p>
            </div>
        </div>
    );
}
