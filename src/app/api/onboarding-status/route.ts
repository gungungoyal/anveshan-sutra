import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering since this route uses request.headers
export const dynamic = 'force-dynamic';

// Initialize Supabase client with ANON KEY (respects RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY not configured - onboarding status API will not work');
}

export async function GET(request: NextRequest) {
    try {
        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        // Get auth token from cookies or authorization header
        let accessToken: string | null = null;

        // Try Authorization header first
        const authHeader = request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            accessToken = authHeader.substring(7);
        }

        // If no auth header, try to get from cookies
        if (!accessToken) {
            const cookies = request.cookies.getAll();
            const authTokenCookie = cookies.find(c => c.name.includes('-auth-token'));
            if (authTokenCookie) {
                try {
                    const parsed = JSON.parse(authTokenCookie.value);
                    accessToken = parsed.access_token || parsed[0]?.access_token;
                } catch {
                    accessToken = authTokenCookie.value;
                }
            }
        }

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create Supabase client with the user's access token
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // Verify token and get user
        const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user profile (RLS will ensure user can only see their own data)
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('name, phone, user_role, onboarding_step, interest_areas')
            .eq('id', user.id)
            .single();

        // Check if user has an organization
        const { data: orgLink, error: orgError } = await supabase
            .from('user_organizations')
            .select('organization_id')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle(); // Use maybeSingle() to avoid error when no rows

        const hasOrganization = !orgError && !!orgLink;

        return NextResponse.json({
            step: profile?.onboarding_step || 'personal_info',
            name: profile?.name || null,
            phone: profile?.phone || null,
            role: profile?.user_role || null,
            interestAreas: profile?.interest_areas || [],
            hasOrganization,
        });
    } catch (error: any) {
        console.error('Onboarding status error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
