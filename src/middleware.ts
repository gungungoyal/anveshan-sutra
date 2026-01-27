import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication (middleware protects these)
// NOTE: /explore removed - Supabase uses localStorage, not cookies, so middleware can't detect session
// The explore page handles auth check client-side instead
const PROTECTED_ROUTES = ['/dashboard', '/org', '/ngo-dashboard'];

/**
 * Lightweight middleware for auth gating.
 * 
 * ONLY checks for auth session presence via cookies - NO network calls.
 * Uses getSession() approach: parses JWT from cookie without Supabase API call.
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if route is protected
    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    if (!isProtected) {
        return NextResponse.next();
    }

    // Check for auth session in cookies (lightweight - no network call)
    const hasSession = checkAuthCookie(request);

    // Debug logging
    const cookies = request.cookies.getAll();
    console.log('[Middleware] Protected route:', pathname);
    console.log('[Middleware] Cookies found:', cookies.map(c => c.name).join(', '));
    console.log('[Middleware] Has session:', hasSession);

    // Not authenticated -> redirect to login
    if (!hasSession) {
        const loginUrl = new URL('/auth', request.url);
        loginUrl.searchParams.set('returnTo', pathname);
        console.log('[Middleware] Redirecting to:', loginUrl.toString());
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

/**
 * Lightweight auth check - only verifies JWT token presence in cookies.
 * NO network calls to Supabase. Just checks if token exists and is not expired.
 */
function checkAuthCookie(request: NextRequest): boolean {
    try {
        // Find auth token in cookies
        // Supabase stores session in sb-<project-ref>-auth-token cookie
        const cookies = request.cookies.getAll();
        const authTokenCookie = cookies.find(c => c.name.includes('-auth-token'));

        if (!authTokenCookie) {
            return false;
        }

        // Parse the cookie value
        let accessToken: string | null = null;
        let expiresAt: number | null = null;

        try {
            const parsed = JSON.parse(authTokenCookie.value);
            accessToken = parsed.access_token || parsed[0]?.access_token;
            expiresAt = parsed.expires_at || parsed[0]?.expires_at;
        } catch {
            // Try direct value (fallback)
            accessToken = authTokenCookie.value;
        }

        if (!accessToken) {
            return false;
        }

        // Check if token is expired (if we have expiry info)
        if (expiresAt) {
            const now = Math.floor(Date.now() / 1000);
            if (expiresAt < now) {
                // Token expired
                return false;
            }
        }

        // Token exists and is not expired -> session is valid
        return true;
    } catch (error) {
        console.error('Middleware auth cookie check error:', error);
        return false;
    }
}

// Configure which routes trigger middleware
// NOTE: /explore removed - uses client-side auth check
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/org/:path*',
        '/ngo-dashboard/:path*',
    ],
};
