"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
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

// Safety timeout (ms) to prevent infinite loading if Supabase hangs
const AUTH_TIMEOUT_MS = 4000;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let didTimeout = false;

        // Safety timeout: if auth check hangs, force loading to false
        const timeoutId = setTimeout(() => {
            didTimeout = true;
            console.warn('Auth check timed out after', AUTH_TIMEOUT_MS, 'ms');
            setIsLoading(false);
        }, AUTH_TIMEOUT_MS);

        // Check initial session
        const checkSession = async () => {
            try {
                if (!supabase) {
                    if (!didTimeout) setIsLoading(false);
                    clearTimeout(timeoutId);
                    return;
                }

                const { data: { session } } = await supabase.auth.getSession();

                if (session && !didTimeout) {
                    const { user: authUser } = await getCurrentUser();
                    if (!didTimeout) setUser(authUser);
                }
            } catch (error) {
                console.error('Auth check error:', error);
            } finally {
                if (!didTimeout) setIsLoading(false);
                clearTimeout(timeoutId);
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

    // Manual refresh function
    const refreshUser = async () => {
        try {
            if (!supabase) return;
            const { user: authUser } = await getCurrentUser();
            setUser(authUser);
        } catch (error) {
            console.error('Refresh user error:', error);
        }
    };

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
