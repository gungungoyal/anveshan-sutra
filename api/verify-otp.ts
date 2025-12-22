import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

const MAX_ATTEMPTS = 5;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { email, otp } = req.body;

        // Validate inputs
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, error: 'Valid email is required' });
        }

        if (!otp || otp.length !== 6) {
            return res.status(400).json({ success: false, error: 'Valid 6-digit OTP is required' });
        }

        if (!supabase) {
            console.error('Supabase not configured');
            return res.status(500).json({ success: false, error: 'Database not configured' });
        }

        // Get the latest OTP for this email
        const { data: otpRecord, error: fetchError } = await supabase
            .from('otp_codes')
            .select('*')
            .eq('email', email.toLowerCase())
            .eq('verified', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (fetchError || !otpRecord) {
            return res.status(400).json({
                success: false,
                error: 'No verification code found. Please request a new one.'
            });
        }

        // Check if too many attempts
        if (otpRecord.attempts >= MAX_ATTEMPTS) {
            // Delete the OTP record
            await supabase.from('otp_codes').delete().eq('id', otpRecord.id);

            return res.status(400).json({
                success: false,
                error: 'Too many attempts. Please request a new verification code.'
            });
        }

        // Check if expired
        if (new Date(otpRecord.expires_at) < new Date()) {
            // Delete the expired OTP
            await supabase.from('otp_codes').delete().eq('id', otpRecord.id);

            return res.status(400).json({
                success: false,
                error: 'Verification code has expired. Please request a new one.'
            });
        }

        // Check if OTP matches
        if (otpRecord.otp_code !== otp) {
            // Increment attempts
            await supabase
                .from('otp_codes')
                .update({ attempts: otpRecord.attempts + 1 })
                .eq('id', otpRecord.id);

            const remainingAttempts = MAX_ATTEMPTS - otpRecord.attempts - 1;

            return res.status(400).json({
                success: false,
                error: `Invalid verification code. ${remainingAttempts} attempts remaining.`
            });
        }

        // OTP is valid! Mark as verified
        await supabase
            .from('otp_codes')
            .update({ verified: true })
            .eq('id', otpRecord.id);

        return res.status(200).json({
            success: true,
            verified: true,
            purpose: otpRecord.purpose,
            message: 'Email verified successfully'
        });

    } catch (error: any) {
        console.error('Verify OTP error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to verify code'
        });
    }
}
