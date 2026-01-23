import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/explore', '/org'];

// Routes that require onboarding to be complete
const ONBOARDED_ROUTES = ['/dashboard', '/explore'];

/**
 * Middleware for server-side auth gating.
 * Runs before every request to protected routes.
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Handle /start route - decision gate
    if (pathname === '/start') {
        return handleStartRoute(request);
    }

    // Check if route is protected
    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    if (!isProtected) {
        return NextResponse.next();
    }

    // Get session from cookies
    const session = await getSessionFromRequest(request);

    // Not authenticated -> redirect to login
    if (!session) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('returnTo', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check onboarding for routes that require it
    const requiresOnboarding = ONBOARDED_ROUTES.some(route => pathname.startsWith(route));
    if (requiresOnboarding && !session.onboardingComplete) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    return NextResponse.next();
}

/**
 * Handle /start route logic:
 * - Unauthenticated -> /login
 * - Authenticated without role -> /onboarding
 * - Authenticated with role -> /dashboard
 */
async function handleStartRoute(request: NextRequest): Promise<NextResponse> {
    const session = await getSessionFromRequest(request);

    // Not authenticated -> login
    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // No role set -> onboarding
    if (!session.role) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // Onboarding not complete -> onboarding
    if (!session.onboardingComplete) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // Fully onboarded -> dashboard based on role
    const dashboardPath = getDashboardPath(session.role);
    return NextResponse.redirect(new URL(dashboardPath, request.url));
}

/**
 * Get session from request cookies.
 */
async function getSessionFromRequest(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return null;
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
            return null;
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
            return null;
        }

        // Verify token
        const { data: { user }, error } = await supabase.auth.getUser(accessToken);
        if (error || !user) {
            return null;
        }

        // Get profile
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('user_role, onboarding_step, onboarding_complete')
            .eq('id', user.id)
            .single();

        return {
            userId: user.id,
            email: user.email,
            role: profile?.user_role || null,
            onboardingStep: profile?.onboarding_step || 'personal_info',
            onboardingComplete: profile?.onboarding_complete || false,
        };
    } catch (error) {
        console.error('Middleware auth error:', error);
        return null;
    }
}

/**
 * Get dashboard path based on user role.
 */
function getDashboardPath(role: string | null): string {
    switch (role) {
        case 'ngo':
            return '/ngo-dashboard';
        case 'incubator':
        case 'csr':
            return '/explore';
        default:
            return '/dashboard';
    }
}

// Configure which routes trigger middleware
export const config = {
    matcher: [
        '/start',
        '/dashboard/:path*',
        '/explore/:path*',
        '/org/:path*',
    ],
};
