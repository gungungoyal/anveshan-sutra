import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Initialize Supabase Admin client (uses service role key to bypass RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null;

/**
 * Update user profile during onboarding
 * Uses service role key to bypass RLS - validates user ID matches auth
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('[update-profile] Received request:', JSON.stringify(body, null, 2));

        const { userId, email, name, role, userIntent, organizationName } = body;

        if (!userId) {
            console.error('[update-profile] Missing userId');
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            console.error('[update-profile] Supabase Admin client not configured - URL:', supabaseUrl, 'ServiceKey:', supabaseServiceKey ? 'present' : 'missing');
            return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
        }

        // Verify the user exists in auth
        console.log('[update-profile] Verifying user exists:', userId);
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (authError) {
            console.error('[update-profile] Auth error:', authError);
            return NextResponse.json({ success: false, error: 'Auth error: ' + authError.message }, { status: 404 });
        }
        if (!authUser?.user) {
            console.error('[update-profile] User not found in auth');
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }
        console.log('[update-profile] User verified:', authUser.user.email);

        // Upsert profile using admin client (bypasses RLS)
        // Using actual columns from the database
        console.log('[update-profile] Upserting profile...');
        const { error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .upsert({
                id: userId,
                email: email || authUser.user.email,
                name: name || 'User',
                organization_name: organizationName || null,
                onboarding_complete: true,
                profile_complete: true,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'id'
            });

        if (profileError) {
            console.error('Profile upsert error:', profileError);
            return NextResponse.json({
                success: false,
                error: profileError.message,
                details: profileError
            }, { status: 400 });
        }

        console.log('[update-profile] Profile updated for user:', userId);

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
        });

    } catch (error: any) {
        console.error('Update profile error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to update profile'
        }, { status: 500 });
    }
}
