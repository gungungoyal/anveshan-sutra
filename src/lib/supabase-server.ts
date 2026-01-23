import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Create a Supabase client for server-side operations.
 * Uses service role key to bypass RLS for auth checks.
 */
export function createServerClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.warn('Supabase server credentials not configured');
        return null;
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Get the current user from request cookies.
 * Returns user data and onboarding status.
 */
export async function getServerSession() {
    const supabase = createServerClient();
    if (!supabase) return null;

    try {
        const cookieStore = await cookies();

        // Get auth token from cookies
        // Supabase stores session in sb-<project-ref>-auth-token cookie
        const authCookies = cookieStore.getAll();
        const authTokenCookie = authCookies.find(c => c.name.includes('-auth-token'));

        if (!authTokenCookie) {
            return null;
        }

        // Parse the cookie value (it's JSON with access_token)
        let accessToken: string | null = null;
        try {
            const parsed = JSON.parse(authTokenCookie.value);
            accessToken = parsed.access_token || parsed[0]?.access_token;
        } catch {
            // Try direct value
            accessToken = authTokenCookie.value;
        }

        if (!accessToken) {
            return null;
        }

        // Verify the token and get user
        const { data: { user }, error } = await supabase.auth.getUser(accessToken);

        if (error || !user) {
            return null;
        }

        // Get user profile for role and onboarding status
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('user_role, onboarding_step, onboarding_complete')
            .eq('id', user.id)
            .single();

        // Check if user has an organization
        const { data: orgLink } = await supabase
            .from('user_organizations')
            .select('organization_id')
            .eq('user_id', user.id)
            .limit(1)
            .single();

        return {
            user: {
                id: user.id,
                email: user.email,
            },
            role: profile?.user_role || null,
            onboardingStep: profile?.onboarding_step || 'personal_info',
            onboardingComplete: profile?.onboarding_complete || false,
            hasOrganization: !!orgLink,
        };
    } catch (error) {
        console.error('getServerSession error:', error);
        return null;
    }
}
