import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Routes that require authentication (middleware protects these)
const PROTECTED_ROUTES = ['/dashboard', '/explore', '/org', '/ngo-dashboard'];

/**
 * Lightweight middleware for auth gating.
 * 
 * ONLY checks for auth session presence - NO database queries.
 * Role and onboarding checks are handled by /start page (server component).
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if route is protected
    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    if (!isProtected) {
        return NextResponse.next();
    }

    // Check for auth session (lightweight - only parses JWT, no DB call)
    const hasSession = await checkAuthSession(request);

    // Not authenticated -> redirect to login
    if (!hasSession) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('returnTo', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

/**
 * Lightweight auth check - only verifies JWT token presence and validity.
 * NO database queries for user profile, role, or onboarding status.
 */
async function checkAuthSession(request: NextRequest): Promise<boolean> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return false;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    try {
        // Find auth token in cookies
        const cookies = request.cookies.getAll();
        const authTokenCookie = cookies.find(c => c.name.includes('-auth-token'));

        if (!authTokenCookie) {
            return false;
        }

        // Parse the cookie value
        let accessToken: string | null = null;
        try {
            const parsed = JSON.parse(authTokenCookie.value);
            accessToken = parsed.access_token || parsed[0]?.access_token;
        } catch {
            accessToken = authTokenCookie.value;
        }

        if (!accessToken) {
            return false;
        }

        // Verify token with Supabase Auth (this is an Auth API call, not a DB query)
        const { data: { user }, error } = await supabase.auth.getUser(accessToken);

        // Return true if user exists and token is valid
        return !error && !!user;
    } catch (error) {
        console.error('Middleware auth error:', error);
        return false;
    }
}

// Configure which routes trigger middleware
// NOTE: /start is NOT included - it's a server component that handles its own routing
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/explore/:path*',
        '/org/:path*',
        '/ngo-dashboard/:path*',
    ],
};
