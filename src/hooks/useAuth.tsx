"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, AuthUser } from '@/lib/services/auth';

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user profile from database
    const fetchUser = useCallback(async () => {
        try {
            const { user: authUser } = await getCurrentUser();
            setUser(authUser);
            return authUser;
        } catch (error) {
            console.error('[AuthProvider] fetchUser error:', error);
            setUser(null);
            return null;
        }
    }, []);

    useEffect(() => {
        if (!supabase) {
            console.warn('[AuthProvider] Supabase not configured');
            setIsLoading(false);
            return;
        }

        let mounted = true;

        // We already checked supabase above, so it's safe to use here
        const sb = supabase!;

        // Initial session check - this is the ONLY place we set isLoading to false initially
        const initializeAuth = async () => {
            try {
                console.log('[AuthProvider] Initializing auth...');

                // First, try to get the current session
                const { data: { session }, error } = await sb.auth.getSession();

                if (error) {
                    console.error('[AuthProvider] getSession error:', error);
                    if (mounted) setIsLoading(false);
                    return;
                }

                if (session?.user) {
                    console.log('[AuthProvider] Session found, fetching user profile...');
                    if (mounted) {
                        await fetchUser();
                    }
                } else {
                    console.log('[AuthProvider] No session found');
                }
            } catch (error) {
                console.error('[AuthProvider] initializeAuth error:', error);
            } finally {
                // CRITICAL: Only set loading false after we've checked everything
                if (mounted) {
                    console.log('[AuthProvider] Initialization complete');
                    setIsLoading(false);
                }
            }
        };

        initializeAuth();

        // Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = sb.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[AuthProvider] Auth state changed:', event);

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
        console.log('[AuthProvider] Manual refresh triggered');
        await fetchUser();
    }, [fetchUser]);

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, refreshUser }}>
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
