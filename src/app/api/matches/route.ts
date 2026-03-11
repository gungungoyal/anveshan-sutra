import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export async function GET(req: Request) {
    if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    try {
        // 1. Get current auth user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch the logged-in user's complete profile
        const { data: seekerProfile, error: seekerError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

        if (seekerError || !seekerProfile) {
            console.error('[Matches API] Error fetching seeker profile:', seekerError);
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // 3. Fetch all other profiles
        const { data: allProfiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('*')
            .neq('id', authUser.id)
            // .eq('form_filled', true) // Ideally only match with complete profiles

        if (profilesError) {
            console.error('[Matches API] Error fetching other profiles:', profilesError);
            return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
        }

        if (!allProfiles || allProfiles.length === 0) {
             return NextResponse.json({ matches: [] });
        }

        // 4. Calculate Scores
        const scoredMatches = allProfiles.map((candidate) => {
            let score = 0;
            const matchFactors: string[] = [];

            // A. Focus Areas Match (40 Points)
            const seekerFocus = seekerProfile.focus_areas || [];
            const candidateFocus = candidate.focus_areas || [];
            
            if (seekerFocus.length > 0 && candidateFocus.length > 0) {
                const intersection = seekerFocus.filter((f: string) => candidateFocus.includes(f));
                if (intersection.length > 0) {
                    const focusScore = Math.min((intersection.length / seekerFocus.length) * 40, 40);
                    score += focusScore;
                    matchFactors.push(intersection[0]); // Add primary focus match
                }
            }

            // B. Geography Match (30 Points)
            const seekerGeo = seekerProfile.geography || [];
            const candidateGeo = candidate.geography || [];

            if (seekerGeo.length > 0 && candidateGeo.length > 0) {
                const isPanIndiaGlobal = (arr: string[]) => arr.includes('Pan India') || arr.includes('Global');
                
                if (isPanIndiaGlobal(seekerGeo) || isPanIndiaGlobal(candidateGeo)) {
                    score += 30; // Automatic full match if either operates everywhere
                    matchFactors.push('Geographic Alignment');
                } else {
                    const geoIntersection = seekerGeo.filter((g: string) => candidateGeo.includes(g));
                    if (geoIntersection.length > 0) {
                        const geoScore = Math.min((geoIntersection.length / seekerGeo.length) * 30, 30);
                        score += geoScore;
                        matchFactors.push(geoIntersection[0]);
                    }
                }
            }

            // C. Partnership Type Match (20 Points)
            const seekerPartnerships = seekerProfile.partnership_types || [];
            const candidatePartnerships = candidate.partnership_types || [];

            if (seekerPartnerships.length > 0 && candidatePartnerships.length > 0) {
                 const partnershipIntersection = seekerPartnerships.filter((p: string) => candidatePartnerships.includes(p));
                 if (partnershipIntersection.length > 0) {
                     score += 20;
                     if (matchFactors.length < 3) matchFactors.push('Synergy');
                 }
            }

            // D. Budget & Timeline (10 Points)
            if (seekerProfile.budget_range && candidate.budget_range && seekerProfile.budget_range === candidate.budget_range) {
                score += 5;
            }
            if (seekerProfile.timeline && candidate.timeline && seekerProfile.timeline === candidate.timeline) {
                score += 5;
            }

            // Optional: Hardcoded dummy name if organization_name is missing during early dev
            const displayInitials = candidate.organization_name 
                ? candidate.organization_name.substring(0, 2).toUpperCase() 
                : candidate.role ? candidate.role.substring(0, 2).toUpperCase() : '??';

            return {
                id: candidate.id,
                initials: displayInitials,
                name: candidate.organization_name || 'Organization',
                type: candidate.role === 'csr' ? 'CSR Partner' : candidate.role === 'ngo' ? 'NGO' : candidate.role === 'incubator' ? 'Incubator' : 'Partner',
                score: Math.round(score),
                matchFactors: matchFactors.slice(0, 3) // max 3 pills
            };
        });

        // 5. Filter out extremely low scores (noise) and sort Descending
        const relevantMatches = scoredMatches
            // .filter(m => m.score > 20) // uncomment to hide bad matches
            .sort((a, b) => b.score - a.score);

        return NextResponse.json({ matches: relevantMatches });

    } catch (error: any) {
        console.error('[Matches API] General error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
