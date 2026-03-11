/**
 * Organizations Service
 * Direct Supabase calls for organization data
 */

import { supabase } from '../supabase';
import { Organization, SearchResult, SearchParams } from '@shared/api';
import { mockOrganizations, getAllFocusAreas, getAllRegions } from '@/data/organizations';

/**
 * Calculate base alignment score based on organization attributes
 * This is the consistent score shown across all pages
 */
function calculateBaseAlignmentScore(org: Organization): number {
    let score = 50; // Base score

    // Focus area breadth bonus (more focus areas = more alignment potential)
    if (org.focusAreas && org.focusAreas.length > 0) {
        score += Math.min(20, org.focusAreas.length * 5);
    }

    // Region presence bonus
    if (org.region) {
        score += 10;
    }

    // Verification boost
    if (org.verificationStatus === "verified") {
        score += 10;
    }

    // Confidence factor bonus (scaled)
    const confidenceFactor = (org.confidence || 75) / 100;
    score += Math.round(10 * confidenceFactor);

    return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate alignment score based on organization attributes and search params
 * If no filters are applied, returns base score for consistency
 */
function calculateAlignmentScore(org: Organization, params: SearchParams): number {
    // Use base score for consistency when no specific filters are applied
    const hasActiveFilters = params.focusArea || params.region || params.fundingType;

    if (!hasActiveFilters) {
        return calculateBaseAlignmentScore(org);
    }

    // Start with base score when filters are applied
    let score = 50;

    // Focus area match
    if (params.focusArea) {
        const areaMatch = org.focusAreas.some(
            (area) => area.toLowerCase() === params.focusArea?.toLowerCase()
        );
        if (areaMatch) score += 20;
    } else if (org.focusAreas && org.focusAreas.length > 0) {
        score += Math.min(15, org.focusAreas.length * 4);
    }

    // Region match
    if (params.region) {
        const regionMatch = org.region.toLowerCase().includes(params.region.toLowerCase());
        if (regionMatch) score += 15;
    } else if (org.region) {
        score += 8;
    }

    // Funding type match
    if (params.fundingType) {
        if (org.fundingType === params.fundingType) score += 10;
    }

    // Verification boost
    if (org.verificationStatus === "verified") score += 5;

    // Apply confidence factor (scaled to not dominate)
    const confidenceFactor = (org.confidence || 75) / 100;
    score = Math.round(score * (0.7 + 0.3 * confidenceFactor));

    return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate personalized alignment score based on user's interest areas
 * This gives higher scores to orgs with matching focus areas
 */
function calculatePersonalizedAlignment(org: Organization, userInterests: string[], params: SearchParams): number {
    // If no user interests, fall back to standard calculation
    if (!userInterests || userInterests.length === 0) {
        return calculateAlignmentScore(org, params);
    }

    let score = 40; // Lower base score - let matching drive the score up

    // Calculate focus area overlap - primary scoring factor
    if (org.focusAreas && org.focusAreas.length > 0) {
        const matchingAreas = org.focusAreas.filter(area =>
            userInterests.some(interest =>
                interest.toLowerCase() === area.toLowerCase()
            )
        );

        // +15 points per matching area, max +45
        score += Math.min(45, matchingAreas.length * 15);

        // Bonus for having multiple matching areas (synergy)
        if (matchingAreas.length >= 2) {
            score += 5;
        }
    }

    // Region match from search params
    if (params.region && org.region) {
        const regionMatch = org.region.toLowerCase().includes(params.region.toLowerCase());
        if (regionMatch) score += 10;
    }

    // Verification boost
    if (org.verificationStatus === "verified") {
        score += 10;
    }

    // Filter focus area match (additional boost if user is also filtering)
    if (params.focusArea) {
        const filterMatch = org.focusAreas.some(
            (area) => area.toLowerCase() === params.focusArea?.toLowerCase()
        );
        if (filterMatch) score += 5;
    }

    // Apply confidence factor (minimal impact)
    const confidenceFactor = (org.confidence || 75) / 100;
    score = Math.round(score * (0.85 + 0.15 * confidenceFactor));

    return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Filter organizations based on search parameters
 */
function filterOrganizations(orgs: Organization[], params: SearchParams): Organization[] {
    return orgs.filter((org) => {
        // Query filter (name, mission, description)
        if (params.query) {
            const query = params.query.toLowerCase();
            const matchesQuery =
                org.name.toLowerCase().includes(query) ||
                org.mission.toLowerCase().includes(query) ||
                org.description.toLowerCase().includes(query) ||
                org.focusAreas.some((area) => area.toLowerCase().includes(query));

            if (!matchesQuery) return false;
        }

        // Focus area filter
        if (params.focusArea) {
            const hasArea = org.focusAreas.some(
                (area) => area.toLowerCase() === params.focusArea?.toLowerCase()
            );
            if (!hasArea) return false;
        }

        // Region filter
        if (params.region) {
            const regionMatch = org.region.toLowerCase().includes(params.region.toLowerCase());
            if (!regionMatch) return false;
        }

        // Funding type filter
        if (params.fundingType) {
            if (org.fundingType !== params.fundingType) return false;
        }

        // Verification status filter
        if (params.verificationStatus) {
            if (org.verificationStatus !== params.verificationStatus) return false;
        }

        return true;
    });
}

/**
 * Get all organizations - tries Supabase first, falls back to mock data
 */
export async function getOrganizations(): Promise<{
    organizations: SearchResult[];
    total: number;
}> {
    try {
        // Try Supabase first
        if (supabase) {
            const { data, error } = await supabase
                .from('organizations')
                .select(`
          *,
          organization_focus_areas(focus_area)
        `);

            if (!error && data) {
                // Transform Supabase data to our format
                const organizations: SearchResult[] = data.map((org: any) => ({
                    id: org.id,
                    name: org.name,
                    type: org.type,
                    website: org.website || '',
                    headquarters: org.headquarters,
                    region: org.region,
                    focusAreas: org.organization_focus_areas?.map((fa: any) => fa.focus_area) || [],
                    mission: org.mission,
                    description: org.description,
                    verificationStatus: org.verification_status || 'unverified',
                    projects: [],
                    fundingType: org.funding_type || 'recipient',
                    targetBeneficiaries: [],
                    partnerHistory: [],
                    confidence: org.confidence || 75,
                    alignmentScore: org.alignment_score || org.confidence || 75,
                }));

                return { organizations, total: organizations.length };
            }

            // If there's an error from Supabase, throw to show error message
            if (error) {
                console.error('Supabase error:', error);
                throw new Error('Unable to load organizations. Please try again later.');
            }
        }
    } catch (error) {
        console.error('Failed to fetch organizations:', error);
        throw error;
    }

    // If no supabase configured, return empty with error
    return { organizations: [], total: 0 };
}

/**
 * Get a single organization by ID
 */
export async function getOrganizationById(id: string): Promise<SearchResult | null> {
    try {
        // Try Supabase first
        if (supabase) {
            const { data, error } = await supabase
                .from('organizations')
                .select(`
          *,
          organization_focus_areas(focus_area),
          projects(*),
          target_beneficiaries(beneficiary),
          partner_history(partner_name)
        `)
                .eq('id', id)
                .single();

            if (!error && data) {
                // Build org object first to calculate consistent alignment score
                const org: Organization = {
                    id: data.id,
                    name: data.name,
                    type: data.type,
                    website: data.website || '',
                    headquarters: data.headquarters,
                    region: data.region,
                    focusAreas: data.organization_focus_areas?.map((fa: any) => fa.focus_area) || [],
                    mission: data.mission,
                    description: data.description,
                    verificationStatus: data.verification_status || 'unverified',
                    projects: data.projects || [],
                    fundingType: data.funding_type || 'recipient',
                    targetBeneficiaries: data.target_beneficiaries?.map((tb: any) => tb.beneficiary) || [],
                    partnerHistory: data.partner_history?.map((ph: any) => ph.partner_name) || [],
                    confidence: data.confidence || 75,
                };

                return {
                    ...org,
                    alignmentScore: calculateBaseAlignmentScore(org),
                };
            }
        }
    } catch (error) {
        console.warn('Failed to fetch from Supabase, using mock data:', error);
    }

    // Fallback to mock data
    const mockOrg = mockOrganizations.find((o) => o.id === id);
    if (!mockOrg) return null;

    return {
        ...mockOrg,
        alignmentScore: calculateBaseAlignmentScore(mockOrg),
    };
}

/**
 * Search organizations with filters - SERVER-SIDE FILTERING
 * ✅ PERFORMANCE FIX: Filters applied in Supabase, not client-side
 */
export async function searchOrganizations(params: SearchParams, userInterests?: string[]): Promise<{
    success: boolean;
    results: SearchResult[];
    total: number;
    focusAreas: string[];
    regions: string[];
}> {
    try {
        if (!supabase) {
            return {
                success: false,
                results: [],
                total: 0,
                focusAreas: getAllFocusAreas(),
                regions: getAllRegions(),
            };
        }

        // ✅ Build query with server-side filters
        // CRITICAL FIX: Include count: 'exact' to get total count for pagination
        let query = supabase
            .from('organizations')
            .select(`
                *,
                organization_focus_areas(focus_area)
            `, { count: 'exact' });

        // Apply text search filter (name, mission, description)
        if (params.query) {
            const searchTerm = params.query.trim();
            query = query.or(`name.ilike.%${searchTerm}%,mission.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        // Apply region filter
        if (params.region) {
            query = query.ilike('region', `%${params.region}%`);
        }

        // Apply funding type filter
        if (params.fundingType) {
            query = query.eq('funding_type', params.fundingType);
        }

        // Apply verification status filter
        if (params.verificationStatus) {
            query = query.eq('verification_status', params.verificationStatus);
        }

        // Apply sorting
        switch (params.sortBy) {
            case "alignment":
                // Alignment score is calculated client-side, so we do not order by it here.
                // We'll sort the final array in memory after calculation.
                // However, we still need a deterministic fallback sort, e.g., created_at
                query = query.order('created_at', { ascending: false });
                break;
            case "confidence":
                query = query.order('confidence', { ascending: false });
                break;
            case "name":
                query = query.order('name', { ascending: true });
                break;
            case "recency":
                query = query.order('created_at', { ascending: false });
                break;
            default:
                query = query.order('created_at', { ascending: false });
        }

        // Apply pagination
        const limit = params.limit || 20;
        const offset = params.offset || 0;
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Supabase search error:', error);
            throw new Error(error.message);
        }

        if (!data) {
            return {
                success: true,
                results: [],
                total: 0,
                focusAreas: getAllFocusAreas(),
                regions: getAllRegions(),
            };
        }

        // Transform Supabase data to SearchResult format
        const organizations: Organization[] = data.map((org: any) => ({
            id: org.id,
            name: org.name,
            type: org.type,
            website: org.website || '',
            headquarters: org.headquarters,
            region: org.region,
            focusAreas: org.organization_focus_areas?.map((fa: any) => fa.focus_area) || [],
            mission: org.mission,
            description: org.description,
            verificationStatus: org.verification_status || 'unverified',
            projects: [],
            fundingType: org.funding_type || 'recipient',
            targetBeneficiaries: [],
            partnerHistory: [],
            confidence: org.confidence || 75,
        }));

        // Apply focus area filter client-side (complex array matching)
        let filtered = organizations;
        if (params.focusArea) {
            filtered = organizations.filter(org =>
                org.focusAreas.some(area =>
                    area.toLowerCase() === params.focusArea?.toLowerCase()
                )
            );
        }

        // Calculate alignment scores with personalization
        const results: SearchResult[] = filtered.map((org) => ({
            ...org,
            alignmentScore: userInterests && userInterests.length > 0
                ? calculatePersonalizedAlignment(org, userInterests, params)
                : calculateAlignmentScore(org, params),
        }));

        // Re-sort by alignment if that's the sort option (since we calculated scores client-side)
        if (params.sortBy === "alignment") {
            results.sort((a, b) => b.alignmentScore - a.alignmentScore);
        }

        return {
            success: true,
            results,
            total: count || results.length,
            focusAreas: getAllFocusAreas(),
            regions: getAllRegions(),
        };
    } catch (error) {
        console.error('Search error:', error);
        return {
            success: false,
            results: [],
            total: 0,
            focusAreas: getAllFocusAreas(),
            regions: getAllRegions(),
        };
    }
}

/**
 * Submit a new organization
 */
export async function submitOrganization(data: {
    name: string;
    type: string;
    website?: string;
    headquarters: string;
    region: string;
    focusAreas: string[];
    mission: string;
    description: string;
    fundingType?: string;
    contactEmail?: string;
}): Promise<{ success: boolean; organization?: SearchResult; error?: string }> {
    try {
        if (!supabase) {
            return { success: false, error: 'Supabase not configured' };
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        // Generate a unique ID using crypto.randomUUID() to prevent collisions
        const id = crypto.randomUUID();

        // Insert organization
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .insert({
                id,
                name: data.name,
                type: data.type,
                website: data.website || null,
                headquarters: data.headquarters,
                region: data.region,
                mission: data.mission,
                description: data.description,
                funding_type: data.fundingType || 'recipient',
                verification_status: 'unverified',
                moderation_status: 'pending',
                confidence: 50, // New submissions start with lower confidence
                contact_email: data.contactEmail || user?.email || null,
                submitted_by: user?.id || null,
            })
            .select()
            .single();

        if (orgError) {
            console.error('Error submitting organization:', orgError);
            return { success: false, error: orgError.message };
        }

        // Insert focus areas
        if (data.focusAreas.length > 0) {
            const focusAreaInserts = data.focusAreas.map((area, index) => ({
                organization_id: id,
                focus_area: area,
                is_primary: index === 0,
            }));

            const { error: focusError } = await supabase
                .from('organization_focus_areas')
                .insert(focusAreaInserts);

            if (focusError) {
                console.error('Error inserting focus areas:', focusError);
                // Continue anyway - org was created
            }
        }

        // Link user to organization if user is logged in
        if (user) {
            const { error: linkError } = await supabase
                .from('user_organizations')
                .insert({
                    user_id: user.id,
                    organization_id: id,
                    role: 'owner',
                });

            if (linkError) {
                console.error('Error linking user to organization:', linkError);
                // Continue anyway - org was created
            }
        }

        const organization: SearchResult = {
            id: orgData.id,
            name: orgData.name,
            type: orgData.type,
            website: orgData.website || '',
            headquarters: orgData.headquarters,
            region: orgData.region,
            focusAreas: data.focusAreas,
            mission: orgData.mission,
            description: orgData.description,
            verificationStatus: 'unverified',
            projects: [],
            fundingType: orgData.funding_type || 'recipient',
            targetBeneficiaries: [],
            partnerHistory: [],
            confidence: orgData.confidence || 50,
            alignmentScore: orgData.confidence || 50,
        };

        return { success: true, organization };
    } catch (error: any) {
        console.error('Submit organization error:', error);
        return { success: false, error: error.message || 'Failed to submit organization' };
    }
}

/**
 * Get all focus areas
 */
export async function getFocusAreas(): Promise<string[]> {
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('focus_areas')
                .select('name')
                .order('name');

            if (!error && data && data.length > 0) {
                return data.map((fa: any) => fa.name);
            }
        }
    } catch (error) {
        console.warn('Failed to fetch focus areas from Supabase:', error);
    }

    return getAllFocusAreas();
}

/**
 * Get all regions
 */
export async function getRegions(): Promise<string[]> {
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('organizations')
                .select('region')
                .not('region', 'is', null);

            if (!error && data) {
                const regions = Array.from(new Set(data.map((o: any) => o.region))).sort();
                if (regions.length > 0) return regions as string[];
            }
        }
    } catch (error) {
        console.warn('Failed to fetch regions from Supabase:', error);
    }

    return getAllRegions();
}

/**
 * Update an existing organization
 */
export async function updateOrganization(
    id: string,
    data: {
        name?: string;
        type?: string;
        website?: string;
        headquarters?: string;
        region?: string;
        focusAreas?: string[];
        mission?: string;
        description?: string;
        fundingType?: string;
    }
): Promise<{ success: boolean; organization?: SearchResult; error?: string }> {
    try {
        if (!supabase) {
            return { success: false, error: 'Supabase not configured' };
        }

        // Prepare update data
        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (data.name !== undefined) updateData.name = data.name;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.website !== undefined) updateData.website = data.website || null;
        if (data.headquarters !== undefined) updateData.headquarters = data.headquarters;
        if (data.region !== undefined) updateData.region = data.region;
        if (data.mission !== undefined) updateData.mission = data.mission;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.fundingType !== undefined) updateData.funding_type = data.fundingType;

        // Update organization
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (orgError) {
            console.error('Error updating organization:', orgError);
            return { success: false, error: orgError.message };
        }

        // Update focus areas if provided
        if (data.focusAreas && data.focusAreas.length > 0) {
            // First, fetch existing focus areas for rollback if needed
            const { data: existingFocusAreas } = await supabase
                .from('organization_focus_areas')
                .select('focus_area, is_primary')
                .eq('organization_id', id);

            // Delete existing focus areas
            const { error: deleteError } = await supabase
                .from('organization_focus_areas')
                .delete()
                .eq('organization_id', id);

            if (deleteError) {
                console.error('Failed to delete existing focus areas:', deleteError);
                return { success: false, error: 'Failed to update focus areas' };
            }

            // Insert new focus areas
            const focusAreaInserts = data.focusAreas.map((area, index) => ({
                organization_id: id,
                focus_area: area,
                is_primary: index === 0,
            }));

            const { error: insertError } = await supabase
                .from('organization_focus_areas')
                .insert(focusAreaInserts);

            if (insertError) {
                console.error('Failed to insert new focus areas:', insertError);

                // Attempt rollback by reinserting old focus areas
                if (existingFocusAreas && existingFocusAreas.length > 0) {
                    await supabase
                        .from('organization_focus_areas')
                        .insert(existingFocusAreas.map(fa => ({
                            organization_id: id,
                            focus_area: fa.focus_area,
                            is_primary: fa.is_primary,
                        })));
                }

                return { success: false, error: 'Failed to update focus areas' };
            }
        }

        const organization: SearchResult = {
            id: orgData.id,
            name: orgData.name,
            type: orgData.type,
            website: orgData.website || '',
            headquarters: orgData.headquarters,
            region: orgData.region,
            focusAreas: data.focusAreas || [],
            mission: orgData.mission,
            description: orgData.description,
            verificationStatus: orgData.verification_status || 'pending',
            projects: [],
            fundingType: orgData.funding_type || 'recipient',
            targetBeneficiaries: [],
            partnerHistory: [],
            confidence: orgData.confidence || 50,
            alignmentScore: orgData.confidence || 50,
        };

        return { success: true, organization };
    } catch (error: any) {
        console.error('Update organization error:', error);
        return { success: false, error: error.message || 'Failed to update organization' };
    }
}

/**
 * Get organizations created by a specific user
 * Note: This requires a user_id column in organizations table or a separate linking table
 * For now, we'll return all organizations as the schema doesn't have user ownership
 */
export async function getUserOrganizations(userId?: string): Promise<{
    success: boolean;
    organizations: SearchResult[];
    error?: string;
}> {
    try {
        if (!supabase) {
            return { success: false, organizations: [], error: 'Supabase not configured' };
        }

        // For now, fetch all organizations
        // In a real app, you'd filter by user_id
        const { data, error } = await supabase
            .from('organizations')
            .select(`
                *,
                organization_focus_areas(focus_area)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user organizations:', error);
            return { success: false, organizations: [], error: error.message };
        }

        const organizations: SearchResult[] = (data || []).map((org: any) => ({
            id: org.id,
            name: org.name,
            type: org.type,
            website: org.website || '',
            headquarters: org.headquarters,
            region: org.region,
            focusAreas: org.organization_focus_areas?.map((fa: any) => fa.focus_area) || [],
            mission: org.mission,
            description: org.description,
            verificationStatus: org.verification_status || 'unverified',
            projects: [],
            fundingType: org.funding_type || 'recipient',
            targetBeneficiaries: [],
            partnerHistory: [],
            confidence: org.confidence || 75,
            alignmentScore: org.alignment_score || org.confidence || 75,
        }));

        return { success: true, organizations };
    } catch (error: any) {
        console.error('Get user organizations error:', error);
        return { success: false, organizations: [], error: error.message || 'Failed to fetch organizations' };
    }
}

/**
 * Delete an organization
 */
export async function deleteOrganization(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (!supabase) {
            return { success: false, error: 'Supabase not configured' };
        }

        const { error } = await supabase
            .from('organizations')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting organization:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Delete organization error:', error);
        return { success: false, error: error.message || 'Failed to delete organization' };
    }
}

