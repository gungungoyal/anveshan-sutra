import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering to prevent build symlink conflicts
export const dynamic = 'force-dynamic';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create email transporter using Gmail SMTP
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

// Email template for OTP
function getEmailTemplate(otp: string, purpose: 'signup' | 'login' | 'password_reset'): { subject: string; html: string } {
  const purposeText = {
    signup: 'verify your email address',
    login: 'sign in to your account',
    password_reset: 'reset your password',
  };

  return {
    subject: `Your Drivya.AI Verification Code: ${otp}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Drivya.AI</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Your Partner Matching Platform</p>
    </div>
    <div style="padding: 40px 32px;">
      <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0; line-height: 1.5;">
        Hello! Use the verification code below to ${purposeText[purpose]}:
      </p>
      <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
        <div style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #6366f1; font-family: monospace;">
          ${otp}
        </div>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px 0; line-height: 1.5;">
        This code expires in <strong>10 minutes</strong>.
      </p>
      <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
    <div style="background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Drivya.AI. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { email, purpose = 'signup' } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email is required' }, { status: 400 });
    }

    // Validate purpose
    if (!['signup', 'login', 'password_reset'].includes(purpose)) {
      return NextResponse.json({ success: false, error: 'Invalid purpose' }, { status: 400 });
    }

    // Check environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('Gmail credentials not configured');
      return NextResponse.json({ success: false, error: 'Email service not configured' }, { status: 500 });
    }

    if (!supabase) {
      console.error('Supabase not configured');
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing OTPs for this email
    await supabase
      .from('otp_codes')
      .delete()
      .eq('email', email.toLowerCase());

    // Store OTP in database
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        email: email.toLowerCase(),
        otp_code: otp,
        purpose,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0,
      });

    if (insertError) {
      console.error('Failed to store OTP:', insertError);
      return NextResponse.json({ success: false, error: 'Failed to generate verification code' }, { status: 500 });
    }

    // Send email
    const transporter = createTransporter();
    const { subject, html } = getEmailTemplate(otp, purpose as any);

    await transporter.sendMail({
      from: `"Drivya.AI" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html,
    });

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send verification code'
    }, { status: 500 });
  }
}
