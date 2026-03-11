import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export async function POST(request: NextRequest) {
    try {
        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const body = await request.json();
        
        // Extract session for email and metadata fallback
        const { data: { session } } = await supabase.auth.getSession();
        const userEmail = session?.user?.email || 'unknown@example.com';
        const userName = session?.user?.user_metadata?.name || 'New User';

        const {
            userId,
            role,
            orgName,
            description,
            focusAreas,
            geography,
            orgSize,
            website,
            // Step 3 — expectations
            partnershipTypes,
            budgetRange,
            timeline,
            partnerNotes,
        } = body;

        // Validate required fields
        if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        if (!orgName?.trim()) return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
        if (!description?.trim()) return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        if (!focusAreas || focusAreas.length === 0) return NextResponse.json({ error: 'At least one focus area is required' }, { status: 400 });
        if (!geography || geography.length === 0) return NextResponse.json({ error: 'At least one geography is required' }, { status: 400 });
        if (!orgSize) return NextResponse.json({ error: 'Organization size is required' }, { status: 400 });
        if (!partnershipTypes || partnershipTypes.length === 0) return NextResponse.json({ error: 'At least one partnership type is required' }, { status: 400 });

        // Try to add columns if they don't exist (idempotent migration)
        // This is a safety net in case the migration wasn't run separately
        try {
            await supabase.rpc('exec_sql', {
                sql: `
                    ALTER TABLE public.user_profiles
                        ADD COLUMN IF NOT EXISTS partnership_types TEXT[],
                        ADD COLUMN IF NOT EXISTS budget_range TEXT,
                        ADD COLUMN IF NOT EXISTS timeline TEXT,
                        ADD COLUMN IF NOT EXISTS partner_notes TEXT;
                `
            });
        } catch (_) {
            // Ignore — columns already exist or rpc not available
        }

        const { error } = await supabase
            .from('user_profiles')
            .upsert({
                id: userId,
                email: userEmail,
                name: userName,
                organization_name: orgName.trim(),
                ...(role ? { role } : {}),
                description: description.trim(),
                focus_areas: focusAreas,
                geography,
                org_size: orgSize,
                website: website?.trim() || null,
                partnership_types: partnershipTypes || [],
                budget_range: budgetRange || null,
                timeline: timeline || null,
                partner_notes: partnerNotes?.trim() || null,
                profile_complete: true,
                form_filled: true,
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error('[save-org-profile] DB error:', error);
            // If it's a column-not-found error, save without the new columns
            if (error.message?.includes('column') || error.code === '42703') {
                const { error: retryError } = await supabase
                    .from('user_profiles')
                    .upsert({
                        id: userId,
                        email: userEmail,
                        name: userName,
                        organization_name: orgName.trim(),
                        ...(role ? { role } : {}),
                        description: description.trim(),
                        focus_areas: focusAreas,
                        geography,
                        org_size: orgSize,
                        website: website?.trim() || null,
                        profile_complete: true,
                        form_filled: true,
                        updated_at: new Date().toISOString(),
                    });
                if (retryError) {
                    return NextResponse.json({ error: retryError.message }, { status: 500 });
                }
                console.log('[save-org-profile] Saved without expectations fields (columns missing)');
                return NextResponse.json({ success: true, note: 'expectations_skipped' });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log('[save-org-profile] Full profile saved for user:', userId);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[save-org-profile] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to save profile' }, { status: 500 });
    }
}
