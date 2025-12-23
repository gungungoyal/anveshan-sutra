import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export async function GET(request: NextRequest) {
    try {
        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        // Get session from authorization header or cookies
        const authHeader = request.headers.get('authorization');
        let userId: string | null = null;

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (!error && user) {
                userId = user.id;
            }
        }

        // If no auth header, try to get from session
        if (!userId) {
            const { data: { session } } = await supabase.auth.getSession();
            userId = session?.user?.id || null;
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('name, phone, user_role, onboarding_step')
            .eq('id', userId)
            .single();

        // Check if user has an organization  
        const { data: orgLink, error: orgError } = await supabase
            .from('user_organizations')
            .select('organization_id')
            .eq('user_id', userId)
            .limit(1)
            .single();

        const hasOrganization = !orgError && !!orgLink;

        return NextResponse.json({
            step: profile?.onboarding_step || 'personal_info',
            name: profile?.name || null,
            phone: profile?.phone || null,
            role: profile?.user_role || null,
            hasOrganization,
        });
    } catch (error: any) {
        console.error('Onboarding status error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
