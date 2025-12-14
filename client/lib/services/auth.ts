/**
 * Authentication Service
 * Direct Supabase Auth calls
 */

import { supabase } from '../supabase';
import { User, AuthResponse } from '@shared/api';

export interface AuthUser extends User { }

/**
 * Sign up a new user
 */
export async function signUp(
    email: string,
    password: string,
    name: string,
    role: 'ngo' | 'funder'
): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
        if (!supabase) {
            return { user: null, error: 'Supabase not configured' };
        }

        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role,
                    profile_complete: false,
                    verified: false,
                },
            },
        });

        if (authError) {
            console.error('Supabase auth signup error:', authError);
            return { user: null, error: authError.message };
        }

        if (!authData.user) {
            return { user: null, error: 'Failed to create user' };
        }

        // Create user profile in database
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                id: authData.user.id,
                email,
                name,
                role,
                profile_complete: false,
                verified: false,
            });

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't fail signup if profile creation fails, user can update later
        }

        const user: AuthUser = {
            id: authData.user.id,
            email,
            name,
            role,
            profile_complete: false,
            verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        return { user, error: null };
    } catch (error: any) {
        console.error('SignUp error:', error);
        return { user: null, error: error.message || 'Signup failed' };
    }
}

/**
 * Sign in an existing user
 */
export async function signIn(
    email: string,
    password: string
): Promise<{ user: AuthUser | null; token: string | null; error: string | null }> {
    try {
        if (!supabase) {
            return { user: null, token: null, error: 'Supabase not configured' };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Supabase auth login error:', error);
            return { user: null, token: null, error: 'Invalid email or password' };
        }

        if (!data.session || !data.user) {
            return { user: null, token: null, error: 'Failed to create session' };
        }

        // Get user profile from database
        const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        const user: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: profileData?.name || data.user.user_metadata?.name || email.split('@')[0],
            role: profileData?.role || data.user.user_metadata?.role || 'ngo',
            profile_complete: profileData?.profile_complete || false,
            verified: profileData?.verified || false,
            created_at: profileData?.created_at || new Date().toISOString(),
            updated_at: profileData?.updated_at || new Date().toISOString(),
        };

        return { user, token: data.session.access_token, error: null };
    } catch (error: any) {
        console.error('SignIn error:', error);
        return { user: null, token: null, error: error.message || 'Login failed' };
    }
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

        const authUser: AuthUser = {
            id: user.id,
            email: user.email || '',
            name: profileData?.name || user.user_metadata?.name || user.email?.split('@')[0] || '',
            role: profileData?.role || user.user_metadata?.role || 'ngo',
            profile_complete: profileData?.profile_complete || false,
            verified: profileData?.verified || false,
            phone: profileData?.phone || undefined,
            avatar_url: profileData?.avatar_url || undefined,
            organization_name: profileData?.organization_name || undefined,
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
 * Update user password
 */
export async function updatePassword(
    currentPassword: string,
    newPassword: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        if (!supabase) {
            return { success: false, error: 'Supabase not configured' };
        }

        // First verify current password by attempting to sign in
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) {
            return { success: false, error: 'Not authenticated' };
        }

        // Verify current password
        const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (verifyError) {
            return { success: false, error: 'Current password is incorrect' };
        }

        // Update to new password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        return { success: true, error: null };
    } catch (error: any) {
        console.error('UpdatePassword error:', error);
        return { success: false, error: error.message || 'Failed to update password' };
    }
}

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
