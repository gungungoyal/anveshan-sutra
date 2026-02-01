"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, AuthUser } from '@/lib/services/auth';

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    refreshUser: async () => { },
    clearError: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user profile from database
    const fetchUser = useCallback(async () => {
        try {
            setError(null);
            const { user: authUser } = await getCurrentUser();
            setUser(authUser);
            return authUser;
        } catch (error) {
            console.error('[AuthProvider] fetchUser error:', error);
            setUser(null);
            setError('Unable to load user profile');
            return null;
        }
    }, []);

    useEffect(() => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        let mounted = true;

        // We already checked supabase above, so it's safe to use here
        const sb = supabase!;

        // Initial session check - this is the ONLY place we set isLoading to false initially
        const initializeAuth = async () => {
            try {
                // ✅ PERFORMANCE FIX: Reduced timeout from 10s to 4s for faster fallback
                const timeoutMs = 4000;
                const timeoutPromise = new Promise<null>((_, reject) => {
                    setTimeout(() => reject(new Error('Auth initialization timed out')), timeoutMs);
                });

                const authPromise = (async () => {
                    // First, try to get the current session
                    const { data: { session }, error } = await sb.auth.getSession();

                    if (error) {
                        return null;
                    }

                    if (session?.user) {
                        return await fetchUser();
                    } else {
                        return null;
                    }
                })();

                // Race between auth and timeout
                try {
                    await Promise.race([authPromise, timeoutPromise]);
                } catch (timeoutError) {
                    // Timeout - set error and proceed without user
                    setError('Connection is slow. Some features may be limited.');
                }
            } catch {
                // Auth error - proceed without user
            } finally {
                // CRITICAL: Only set loading false after we've checked everything
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };


        initializeAuth();

        // Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = sb.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    if (session?.user) {
                        await fetchUser();
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchUser]);

    // Manual refresh function
    const refreshUser = useCallback(async () => {
        await fetchUser();
    }, [fetchUser]);

    // Clear error state
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, error, refreshUser, clearError }}>
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
