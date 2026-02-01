/**
 * Shortlist Service
 * Manages saved/bookmarked organizations for users
 */

import { supabase } from '../supabase';
import { SearchResult } from '@shared/api';

/**
 * Get all saved organizations for a user with full org details
 */
export async function getSavedOrganizations(userId: string): Promise<{
    success: boolean;
    organizations: SearchResult[];
    error?: string;
}> {
    if (!supabase) {
        return { success: false, organizations: [], error: 'Supabase not configured' };
    }

    try {
        // Get shortlist entries with organization details
        const { data: shortlistData, error: shortlistError } = await supabase
            .from('shortlist')
            .select(`
                organization_id,
                created_at,
                organizations (
                    id,
                    name,
                    type,
                    website,
                    headquarters,
                    region,
                    mission,
                    description,
                    verification_status,
                    funding_type,
                    confidence,
                    alignment_score
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (shortlistError) {
            console.error('Error fetching shortlist:', shortlistError);
            return { success: false, organizations: [], error: shortlistError.message };
        }

        if (!shortlistData || shortlistData.length === 0) {
            return { success: true, organizations: [] };
        }

        // Fetch focus areas for each organization
        const orgIds = shortlistData
            .map(item => item.organizations?.id)
            .filter(Boolean) as string[];

        // Handle edge case: no valid org IDs
        if (orgIds.length === 0) {
            return { success: true, organizations: [] };
        }

        const { data: focusAreasData } = await supabase
            .from('organization_focus_areas')
            .select('organization_id, focus_area')
            .in('organization_id', orgIds);

        // Build focus areas map
        const focusAreasMap = new Map<string, string[]>();
        focusAreasData?.forEach(fa => {
            const areas = focusAreasMap.get(fa.organization_id) || [];
            areas.push(fa.focus_area);
            focusAreasMap.set(fa.organization_id, areas);
        });

        // Transform to SearchResult format
        const organizations: SearchResult[] = shortlistData
            .filter(item => item.organizations)
            .map(item => {
                const org = item.organizations!;
                return {
                    id: org.id,
                    name: org.name,
                    type: org.type as any,
                    website: org.website || '',
                    headquarters: org.headquarters,
                    region: org.region,
                    mission: org.mission,
                    description: org.description,
                    verificationStatus: org.verification_status as any,
                    fundingType: org.funding_type as any,
                    confidence: org.confidence || 0,
                    alignmentScore: org.alignment_score || 0,
                    focusAreas: focusAreasMap.get(org.id) || [],
                    projects: [],
                    targetBeneficiaries: [],
                    partnerHistory: [],
                };
            });

        return { success: true, organizations };
    } catch (error) {
        console.error('Unexpected error in getSavedOrganizations:', error);
        return {
            success: false,
            organizations: [],
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Save an organization to user's shortlist
 */
export async function saveOrganization(
    userId: string,
    organizationId: string
): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        const { error } = await supabase
            .from('shortlist')
            .insert({
                user_id: userId,
                organization_id: organizationId,
            });

        if (error) {
            // Ignore duplicate key errors (already saved)
            if (error.code === '23505') {
                return { success: true };
            }
            console.error('Error saving organization:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error in saveOrganization:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Remove an organization from user's shortlist
 */
export async function removeSavedOrganization(
    userId: string,
    organizationId: string
): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        const { error } = await supabase
            .from('shortlist')
            .delete()
            .eq('user_id', userId)
            .eq('organization_id', organizationId);

        if (error) {
            console.error('Error removing organization:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error in removeSavedOrganization:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Check if an organization is saved by the user
 */
export async function isOrganizationSaved(
    userId: string,
    organizationId: string
): Promise<{ success: boolean; isSaved: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, isSaved: false, error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase
            .from('shortlist')
            .select('id')
            .eq('user_id', userId)
            .eq('organization_id', organizationId)
            .maybeSingle();

        if (error) {
            console.error('Error checking if organization is saved:', error);
            return { success: false, isSaved: false, error: error.message };
        }

        return { success: true, isSaved: !!data };
    } catch (error) {
        console.error('Unexpected error in isOrganizationSaved:', error);
        return {
            success: false,
            isSaved: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Get all saved organization IDs for a user (lightweight check)
 */
export async function getSavedOrganizationIds(userId: string): Promise<{
    success: boolean;
    organizationIds: string[];
    error?: string;
}> {
    if (!supabase) {
        return { success: false, organizationIds: [], error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase
            .from('shortlist')
            .select('organization_id')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching saved organization IDs:', error);
            return { success: false, organizationIds: [], error: error.message };
        }

        const organizationIds = data?.map(item => item.organization_id) || [];
        return { success: true, organizationIds };
    } catch (error) {
        console.error('Unexpected error in getSavedOrganizationIds:', error);
        return {
            success: false,
            organizationIds: [],
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
