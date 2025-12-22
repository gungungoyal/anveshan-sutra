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

            if (!error && data && data.length > 0) {
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
        }
    } catch (error) {
        console.warn('Failed to fetch from Supabase, using mock data:', error);
    }

    // Fallback to mock data
    const organizations: SearchResult[] = mockOrganizations.map((org) => ({
        ...org,
        alignmentScore: org.confidence || 75,
    }));

    return { organizations, total: organizations.length };
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
 * Search organizations with filters
 */
export async function searchOrganizations(params: SearchParams): Promise<{
    success: boolean;
    results: SearchResult[];
    total: number;
    focusAreas: string[];
    regions: string[];
}> {
    try {
        const { organizations } = await getOrganizations();

        // Convert SearchResult back to Organization for filtering
        const orgsForFilter: Organization[] = organizations.map(org => ({
            id: org.id,
            name: org.name,
            type: org.type,
            website: org.website,
            headquarters: org.headquarters,
            region: org.region,
            focusAreas: org.focusAreas,
            mission: org.mission,
            description: org.description,
            verificationStatus: org.verificationStatus,
            projects: org.projects,
            fundingType: org.fundingType,
            targetBeneficiaries: org.targetBeneficiaries,
            partnerHistory: org.partnerHistory,
            confidence: org.confidence,
        }));

        // Filter organizations
        const filtered = filterOrganizations(orgsForFilter, params);

        // Map to search results with alignment scores
        const results: SearchResult[] = filtered.map((org) => ({
            ...org,
            alignmentScore: calculateAlignmentScore(org, params),
        }));

        // Sort results
        switch (params.sortBy) {
            case "alignment":
                results.sort((a, b) => b.alignmentScore - a.alignmentScore);
                break;
            case "confidence":
                results.sort((a, b) => b.confidence - a.confidence);
                break;
            case "name":
                results.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "recency":
            default:
                // Keep original order
                break;
        }

        return {
            success: true,
            results,
            total: results.length,
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
}): Promise<{ success: boolean; organization?: SearchResult; error?: string }> {
    try {
        if (!supabase) {
            return { success: false, error: 'Supabase not configured' };
        }

        // Generate a unique ID
        const id = `org-${Date.now()}`;

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
                verification_status: 'pending',
                confidence: 50, // New submissions start with lower confidence
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

            await supabase.from('organization_focus_areas').insert(focusAreaInserts);
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
            verificationStatus: 'pending',
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
            // Delete existing focus areas
            await supabase
                .from('organization_focus_areas')
                .delete()
                .eq('organization_id', id);

            // Insert new focus areas
            const focusAreaInserts = data.focusAreas.map((area, index) => ({
                organization_id: id,
                focus_area: area,
                is_primary: index === 0,
            }));

            await supabase.from('organization_focus_areas').insert(focusAreaInserts);
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

