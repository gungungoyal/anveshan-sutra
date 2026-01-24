"use client";

import { supabase } from '@/lib/supabase';

export type OnboardingStep = 'personal_info' | 'role_selection' | 'interest_selection' | 'org_form' | 'complete';

export interface OnboardingStatus {
    step: OnboardingStep;
    name: string | null;
    phone: string | null;
    role: string | null;
    interestAreas: string[];
    hasOrganization: boolean;
}

/**
 * Get user's current onboarding status
 */
export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus | null> {
    if (!supabase) return null;

    try {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('name, phone, user_role, onboarding_step, interest_areas')
            .eq('id', userId)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
            return null;
        }

        // Check if user has an organization
        const { data: orgLink, error: orgError } = await supabase
            .from('user_organizations')
            .select('organization_id')
            .eq('user_id', userId)
            .limit(1)
            .single();

        const hasOrganization = !orgError && !!orgLink;

        return {
            step: profile?.onboarding_step || 'personal_info',
            name: profile?.name || null,
            phone: profile?.phone || null,
            role: profile?.user_role || null,
            interestAreas: profile?.interest_areas || [],
            hasOrganization,
        };
    } catch (error) {
        console.error('Error getting onboarding status:', error);
        return null;
    }
}

/**
 * Save personal info (Step 1)
 */
export async function savePersonalInfo(
    userId: string,
    name: string,
    phone: string,
    email: string
): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Database not configured' };
    }

    try {
        const { error } = await supabase
            .from('user_profiles')
            .upsert({
                id: userId,
                email: email.trim(),
                name: name.trim(),
                phone: phone.trim(),
                role: 'ngo', // Default role, will be updated in step 2
                onboarding_step: 'role_selection',
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'id'
            });

        if (error) {
            console.error('Error saving personal info:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Save personal info error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Save selected role (Step 2)
 */
export async function saveRole(
    userId: string,
    role: 'ngo' | 'incubator' | 'csr'
): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Database not configured' };
    }

    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({
                user_role: role,
                onboarding_step: 'interest_selection',
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

        if (error) {
            console.error('Error saving role:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Save role error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Save selected interests (Step 3)
 */
export async function saveInterests(
    userId: string,
    interests: string[]
): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Database not configured' };
    }

    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({
                interest_areas: interests,
                onboarding_step: 'org_form',
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

        if (error) {
            console.error('Error saving interests:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Save interests error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Mark onboarding as complete
 */
export async function completeOnboarding(
    userId: string
): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Database not configured' };
    }

    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({
                onboarding_complete: true,
                profile_complete: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

        if (error) {
            console.error('Error completing onboarding:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Complete onboarding error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if user already has an organization
 */
export async function checkUserHasOrganization(userId: string): Promise<boolean> {
    if (!supabase) return false;

    try {
        const { data, error } = await supabase
            .from('user_organizations')
            .select('id')
            .eq('user_id', userId)
            .limit(1)
            .single();

        return !error && !!data;
    } catch {
        return false;
    }
}

/**
 * Get the dashboard path based on user role
 */
export function getDashboardPath(role: string | null): string {
    switch (role) {
        case 'ngo':
            return '/ngo-dashboard';
        case 'incubator':
        case 'csr':
            return '/search';
        default:
            return '/search';
    }
}
