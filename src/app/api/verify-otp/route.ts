import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json();

        // Validate inputs
        if (!email || !email.includes('@')) {
            return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 });
        }

        if (!otp || otp.length !== 6) {
            return NextResponse.json({ success: false, error: 'Valid 6-digit code is required' }, { status: 400 });
        }

        if (!supabase) {
            console.error('Supabase not configured');
            return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
        }

        // Fetch OTP record
        const { data: otpRecord, error: fetchError } = await supabase
            .from('otp_codes')
            .select('*')
            .eq('email', email.toLowerCase())
            .eq('verified', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (fetchError || !otpRecord) {
            return NextResponse.json({
                success: false,
                error: 'No verification code found. Please request a new one.'
            }, { status: 400 });
        }

        // Check if expired
        if (new Date(otpRecord.expires_at) < new Date()) {
            await supabase.from('otp_codes').delete().eq('id', otpRecord.id);
            return NextResponse.json({
                success: false,
                error: 'Verification code has expired. Please request a new one.'
            }, { status: 400 });
        }

        // Check attempts (max 5)
        if (otpRecord.attempts >= 5) {
            await supabase.from('otp_codes').delete().eq('id', otpRecord.id);
            return NextResponse.json({
                success: false,
                error: 'Too many attempts. Please request a new code.'
            }, { status: 400 });
        }

        // Increment attempts
        await supabase
            .from('otp_codes')
            .update({ attempts: otpRecord.attempts + 1 })
            .eq('id', otpRecord.id);

        // Verify OTP
        if (otpRecord.otp_code !== otp) {
            return NextResponse.json({
                success: false,
                error: 'Invalid verification code. Please try again.',
                attemptsRemaining: 5 - (otpRecord.attempts + 1)
            }, { status: 400 });
        }

        // Mark as verified and delete
        await supabase.from('otp_codes').delete().eq('id', otpRecord.id);

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully',
            purpose: otpRecord.purpose,
        });

    } catch (error: any) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Verification failed'
        }, { status: 500 });
    }
}
