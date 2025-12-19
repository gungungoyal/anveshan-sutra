import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/services/auth";

/**
 * OAuth callback handler
 * Handles the redirect after successful Google/LinkedIn sign-in
 */
export default function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/search";

    useEffect(() => {
        const handleCallback = async () => {
            if (!supabase) {
                navigate("/auth", { replace: true });
                return;
            }

            try {
                // Get the session from the URL hash
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Auth callback error:", error);
                    navigate("/auth?error=auth_failed", { replace: true });
                    return;
                }

                if (session) {
                    // Get or create user profile
                    const { user } = await getCurrentUser();

                    if (user) {
                        localStorage.setItem("user_role", user.role);
                    }

                    // Redirect to the intended destination
                    navigate(returnTo, { replace: true });
                } else {
                    // No session, redirect back to auth
                    navigate("/auth", { replace: true });
                }
            } catch (error) {
                console.error("Callback error:", error);
                navigate("/auth?error=callback_failed", { replace: true });
            }
        };

        handleCallback();
    }, [navigate, returnTo]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Completing sign in...</p>
            </div>
        </div>
    );
}
