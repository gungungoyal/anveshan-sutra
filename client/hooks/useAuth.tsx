import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, AuthUser } from '@/lib/services/auth';

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check initial session
        const checkSession = async () => {
            try {
                if (!supabase) {
                    setIsLoading(false);
                    return;
                }

                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    const { user: authUser } = await getCurrentUser();
                    setUser(authUser);
                }
            } catch (error) {
                console.error('Auth check error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        if (supabase) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(
                async (event, session) => {
                    if (session) {
                        const { user: authUser } = await getCurrentUser();
                        setUser(authUser);
                    } else {
                        setUser(null);
                    }
                }
            );

            return () => subscription.unsubscribe();
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

/**
 * Hook to check if user is authenticated before performing an action.
 * If not authenticated, returns a redirect path to auth.
 */
export function useAuthGate() {
    const { isAuthenticated, isLoading } = useAuth();

    const checkAuth = (returnPath?: string): { allowed: boolean; redirectTo?: string } => {
        if (isLoading) {
            return { allowed: false };
        }

        if (!isAuthenticated) {
            const returnTo = returnPath || window.location.pathname + window.location.search;
            return {
                allowed: false,
                redirectTo: `/auth?returnTo=${encodeURIComponent(returnTo)}`
            };
        }

        return { allowed: true };
    };

    return { checkAuth, isAuthenticated, isLoading };
}
