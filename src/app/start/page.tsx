import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/supabase-server';

/**
 * /start - Server-side decision gate
 * 
 * This page has NO visible UI. It only redirects:
 * - Unauthenticated → /login
 * - Authenticated without role → /onboarding
 * - Authenticated with role → /dashboard (or role-specific dashboard)
 * 
 * Primary logic is in middleware.ts. This page is a fallback.
 */
export default async function StartPage() {
    let session: {
        user: { id: string; email: string | undefined };
        role: string | null;
        onboardingStep: string;
        onboardingComplete: boolean;
        hasOrganization: boolean;
    } | null = null;

    try {
        session = await getServerSession();
    } catch (error) {
        console.error('/start: Error getting session:', error);
        // If session check fails, redirect to login
        redirect('/login');
    }

    // Not authenticated → login
    if (!session) {
        redirect('/login');
    }

    // No role or onboarding not complete → onboarding
    if (!session.role || !session.onboardingComplete) {
        redirect('/onboarding');
    }

    // Redirect to appropriate dashboard based on role
    switch (session.role) {
        case 'ngo':
            redirect('/ngo-dashboard');
            break;
        case 'incubator':
        case 'csr':
            redirect('/explore');
            break;
        default:
            redirect('/dashboard');
    }
}
