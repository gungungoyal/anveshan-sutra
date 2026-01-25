/**
 * Authentication Service
 * Direct Supabase Auth calls
 * 
 * Supports:
 * - Email + Password with OTP verification (primary)
 * - Email Magic Link (OTP) - legacy/backup
 * - Google OAuth (coming soon)
 * - LinkedIn OAuth (coming soon)
 */

import { supabase } from '../supabase';
import { User, AuthResponse } from '@shared/api';
import { fetchWithTimeout } from '../utils/async';

export interface AuthUser extends User {
    organization_id?: string;
    organization_type?: string;
}

// API base URL - auto-detect based on environment
const API_BASE = typeof window !== 'undefined'
    ? window.location.origin
    : '';

/**
 * Send OTP to email for verification
 */
export async function sendOtp(
    email: string,
    purpose: 'signup' | 'login' | 'password_reset' = 'signup'
): Promise<{ success: boolean; error: string | null; expiresAt?: string }> {
    try {
        const response = await fetchWithTimeout(`${API_BASE}/api/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, purpose }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || 'Failed to send verification code' };
        }

        return { success: true, error: null, expiresAt: data.expiresAt };
    } catch (error: any) {
        console.error('sendOtp error:', error);
        return { success: false, error: error.message || 'Failed to send verification code' };
    }
}

/**
 * Verify OTP code
 */
export async function verifyOtp(
    email: string,
    otp: string
): Promise<{ success: boolean; verified: boolean; purpose?: string; error: string | null }> {
    try {
        const response = await fetchWithTimeout(`${API_BASE}/api/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, verified: false, error: data.error || 'Failed to verify code' };
        }

        return { success: true, verified: data.verified, purpose: data.purpose, error: null };
    } catch (error: any) {
        console.error('verifyOtp error:', error);
        return { success: false, verified: false, error: error.message || 'Failed to verify code' };
    }
}

/**
 * Sign up with Email + Password
 * Requires email verification via OTP before this is called
 */
export async function signUpWithPassword(
    email: string,
    password: string,
    name: string
): Promise<{ user: AuthUser | null; error: string | null; errorCode?: string }> {
    try {
        if (!supabase) {
            return { user: null, error: 'Supabase not configured' };
        }

        // Create user in Supabase Auth
        // Note: We skip email confirmation since we already verified via OTP
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    email_verified: true // Mark as verified since OTP was verified
                },
                // Don't send confirmation email - we already verified via OTP
            },
        });

        if (error) {
            console.error('Signup error:', error);

            // Check for duplicate user error
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('user already registered') ||
                errorMessage.includes('already been registered') ||
                errorMessage.includes('already exists') ||
                error.message.includes('User already registered')) {
                return {
                    user: null,
                    error: 'This email is already registered. Please sign in instead.',
                    errorCode: 'USER_EXISTS'
                };
            }

            return { user: null, error: error.message };
        }

        // Supabase returns a user with identities: [] if the user already exists
        // This is a "fake" signup response - the user wasn't actually created
        if (data.user && data.user.identities && data.user.identities.length === 0) {
            return {
                user: null,
                error: 'This email is already registered. Please sign in instead.',
                errorCode: 'USER_EXISTS'
            };
        }

        if (!data.user) {
            return { user: null, error: 'Failed to create account' };
        }

        // Create user profile
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                id: data.user.id,
                email: data.user.email,
                name,
                role: 'ngo', // Default role, will be updated during onboarding
                email_verified: true, // OTP was verified before signup
                profile_complete: false,
                verified: false,
            });

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // User was created but profile failed - this shouldn't block signup
        }

        const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || '',
            name,
            role: 'ngo',
            profile_complete: false,
            verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        return { user: authUser, error: null };
    } catch (error: any) {
        console.error('signUpWithPassword error:', error);
        return { user: null, error: error.message || 'Failed to create account' };
    }
}

/**
 * Sign in with Email + Password
 */
export async function signInWithPassword(
    email: string,
    password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
        if (!supabase) {
            return { user: null, error: 'Supabase not configured' };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Signin error:', error);
            return { user: null, error: error.message };
        }

        if (!data.user) {
            return { user: null, error: 'Invalid credentials' };
        }

        // Get the full user profile
        const { user } = await getCurrentUser();
        return { user, error: null };
    } catch (error: any) {
        console.error('signInWithPassword error:', error);
        return { user: null, error: error.message || 'Failed to sign in' };
    }
}

/**
 * Reset password - uses server-side API to update password after OTP verification
 * This works for unauthenticated users during the forgot password flow
 */
export async function resetPassword(
    email: string,
    newPassword: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        const response = await fetchWithTimeout(`${API_BASE}/api/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || 'Failed to reset password' };
        }

        return { success: true, error: null };
    } catch (error: any) {
        console.error('resetPassword error:', error);
        return { success: false, error: error.message || 'Failed to reset password' };
    }
}


/**
 * Sign in with Email Magic Link (OTP)
 * Sends a magic link to the user's email - no password required
 */
export async function signInWithMagicLink(
    email: string,
    redirectTo?: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        if (!supabase) {
            return { success: false, error: 'Supabase not configured' };
        }

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error('Magic link error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error: any) {
        console.error('signInWithMagicLink error:', error);
        return { success: false, error: error.message || 'Failed to send magic link' };
    }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(
    redirectTo?: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        if (!supabase) {
            return { success: false, error: 'Supabase not configured' };
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error('Google OAuth error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error: any) {
        console.error('signInWithGoogle error:', error);
        return { success: false, error: error.message || 'Failed to sign in with Google' };
    }
}

/**
 * Sign in with LinkedIn OAuth
 */
export async function signInWithLinkedIn(
    redirectTo?: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        if (!supabase) {
            return { success: false, error: 'Supabase not configured' };
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'linkedin_oidc',
            options: {
                redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error('LinkedIn OAuth error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error: any) {
        console.error('signInWithLinkedIn error:', error);
        return { success: false, error: error.message || 'Failed to sign in with LinkedIn' };
    }
}

/**
 * @deprecated Use signInWithMagicLink instead - password auth is disabled
 * Sign up a new user (kept for backward compatibility)
 */
export async function signUp(
    email: string,
    password: string,
    name: string,
    role: 'ngo' | 'funder'
): Promise<{ user: AuthUser | null; error: string | null }> {
    // Redirect to magic link flow
    console.warn('Password signup is deprecated. Use signInWithMagicLink instead.');
    const result = await signInWithMagicLink(email);
    if (result.success) {
        return { user: null, error: 'Check your email for a magic link to sign in' };
    }
    return { user: null, error: result.error };
}


/**
 * @deprecated Use signInWithMagicLink instead - password auth is disabled
 * Sign in an existing user (kept for backward compatibility)
 */
export async function signIn(
    email: string,
    password: string
): Promise<{ user: AuthUser | null; token: string | null; error: string | null }> {
    // Redirect to magic link flow
    console.warn('Password signin is deprecated. Use signInWithMagicLink instead.');
    const result = await signInWithMagicLink(email);
    if (result.success) {
        return { user: null, token: null, error: 'Check your email for a magic link to sign in' };
    }
    return { user: null, token: null, error: result.error };
}


/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: string | null }> {
    try {
        if (!supabase) {
            return { error: 'Supabase not configured' };
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
            return { error: error.message };
        }
        return { error: null };
    } catch (error: any) {
        console.error('SignOut error:', error);
        return { error: error.message || 'Logout failed' };
    }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
        if (!supabase) {
            return { user: null, error: 'Supabase not configured' };
        }

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return { user: null, error: error?.message || 'Not authenticated' };
        }

        // Get user profile from database
        const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // Get user's organization (if any)
        let orgData: { id: string; name: string; type: string } | null = null;
        const { data: userOrgLink } = await supabase
            .from('user_organizations')
            .select('organization_id, organizations(id, name, type)')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();

        if (userOrgLink?.organizations) {
            const org = userOrgLink.organizations as any;
            orgData = {
                id: org.id,
                name: org.name,
                type: org.type,
            };
        }

        const authUser: AuthUser = {
            id: user.id,
            email: user.email || '',
            name: profileData?.name || user.user_metadata?.name || user.email?.split('@')[0] || '',
            role: profileData?.role || user.user_metadata?.role || 'ngo',
            profile_complete: profileData?.profile_complete || false,
            verified: profileData?.verified || false,
            phone: profileData?.phone || undefined,
            avatar_url: profileData?.avatar_url || undefined,
            organization_name: orgData?.name || profileData?.organization_name || undefined,
            organization_id: orgData?.id || undefined,
            organization_type: orgData?.type || undefined,
            bio: profileData?.bio || undefined,
            preferences: profileData?.preferences || { notifications: true, theme: 'system', newsletter: false },
            created_at: profileData?.created_at || new Date().toISOString(),
            updated_at: profileData?.updated_at || new Date().toISOString(),
        };

        return { user: authUser, error: null };
    } catch (error: any) {
        console.error('GetCurrentUser error:', error);
        return { user: null, error: error.message || 'Failed to get user' };
    }
}

/**
 * Get the current session
 */
export async function getSession() {
    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!supabase) {
        console.warn('Supabase not configured');
        return { unsubscribe: () => { } };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
            if (session?.user) {
                const { user } = await getCurrentUser();
                callback(user);
            } else {
                callback(null);
            }
        }
    );

    return {
        unsubscribe: () => subscription.unsubscribe(),
    };
}

/**
 * Update user profile
 */
export async function updateProfile(updates: {
    name?: string;
    phone?: string;
    avatar_url?: string;
    organization_name?: string;
    bio?: string;
    preferences?: {
        notifications?: boolean;
        theme?: 'light' | 'dark' | 'system';
        newsletter?: boolean;
    };
    profile_complete?: boolean;
}): Promise<{ success: boolean; error: string | null }> {
    try {
        if (!supabase) {
            return { success: false, error: 'Supabase not configured' };
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Get current profile to merge preferences
        const { data: currentProfile } = await supabase
            .from('user_profiles')
            .select('preferences')
            .eq('id', user.id)
            .single();

        const mergedPreferences = updates.preferences
            ? { ...(currentProfile?.preferences || {}), ...updates.preferences }
            : undefined;

        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.phone !== undefined) updateData.phone = updates.phone;
        if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;
        if (updates.organization_name !== undefined) updateData.organization_name = updates.organization_name;
        if (updates.bio !== undefined) updateData.bio = updates.bio;
        if (updates.profile_complete !== undefined) updateData.profile_complete = updates.profile_complete;
        if (mergedPreferences) updateData.preferences = mergedPreferences;

        const { error } = await supabase
            .from('user_profiles')
            .update(updateData)
            .eq('id', user.id);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error: any) {
        console.error('UpdateProfile error:', error);
        return { success: false, error: error.message || 'Failed to update profile' };
    }
}

/**
 * Password-based authentication is disabled on Drivya.AI
 * Use signInWithMagicLink, signInWithGoogle, or signInWithLinkedIn instead.
 */

/**
 * Upload avatar to Supabase Storage
 */
export async function uploadAvatar(
    file: File
): Promise<{ url: string | null; error: string | null }> {
    try {
        if (!supabase) {
            return { url: null, error: 'Supabase not configured' };
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { url: null, error: 'Not authenticated' };
        }

        // Generate unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return { url: null, error: uploadError.message };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Update user profile with avatar URL
        await updateProfile({ avatar_url: publicUrl });

        return { url: publicUrl, error: null };
    } catch (error: any) {
        console.error('UploadAvatar error:', error);
        return { url: null, error: error.message || 'Failed to upload avatar' };
    }
}
