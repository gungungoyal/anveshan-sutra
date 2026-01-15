import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering to prevent build symlink conflicts
export const dynamic = 'force-dynamic';

// Initialize Supabase Admin client with service role key
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

export async function POST(request: NextRequest) {
    try {
        const { email, newPassword } = await request.json();

        // Validate inputs
        if (!email || !email.includes('@')) {
            return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 });
        }

        if (!newPassword || newPassword.length < 8) {
            return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            console.error('Supabase Admin not configured');
            return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
        }

        // Find the user by email
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();

        if (userError) {
            console.error('Error fetching users:', userError);
            return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
        }

        const user = userData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (!user) {
            // Don't reveal if user exists - return generic success for security
            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, the password has been reset.'
            });
        }

        // Update the user's password using admin API
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );

        if (updateError) {
            console.error('Error updating password:', updateError);
            return NextResponse.json({ success: false, error: 'Failed to reset password' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Password has been reset successfully',
        });

    } catch (error: any) {
        console.error('Reset password error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to reset password'
        }, { status: 500 });
    }
}
