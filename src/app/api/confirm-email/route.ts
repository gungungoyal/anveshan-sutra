import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Initialize Supabase Admin client (uses service role key)
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
 * Confirm a user's email using the Admin API
 * This is called after custom OTP verification to sync with Supabase's internal email_confirmed_at
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            console.error('Supabase Admin client not configured');
            return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
        }

        // Use Admin API to update user's email_confirmed_at
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            email_confirm: true,
        });

        if (error) {
            console.error('Failed to confirm email:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        console.log('[confirm-email] Email confirmed for user:', userId);

        return NextResponse.json({
            success: true,
            message: 'Email confirmed successfully',
        });

    } catch (error: any) {
        console.error('Confirm email error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to confirm email'
        }, { status: 500 });
    }
}
