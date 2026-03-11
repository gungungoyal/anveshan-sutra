import { supabase } from '../supabase';

/**
 * Project Expectations Service
 * Handles CRUD operations for CSR project expectations
 */

export interface ProjectExpectation {
    id: string;
    user_id: string;
    beneficiary_range: string;
    timeline_months: string;
    geography_type: string;
    geography_spread: string;
    reporting_intensity: string;
    on_ground_presence: string;
    program_nature: string;
    created_at: string;
    updated_at: string;
}

export interface CreateProjectExpectationData {
    beneficiaryRange: string;
    timelineMonths: string;
    geographyType: string;
    geographySpread: string;
    reportingIntensity: string;
    onGroundPresence: string;
    programNature: string;
}

/**
 * Get project expectation for a specific user
 * @param userId - User ID to fetch expectation for
 * @returns Project expectation or null if not found
 */
export async function getProjectExpectation(userId: string): Promise<ProjectExpectation | null> {
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    try {
        const { data, error } = await supabase
            .from('project_expectations')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            // If no rows found, return null (not an error)
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        return data;
    } catch (error) {
        console.error('[ProjectExpectations] Error fetching:', error);
        throw error;
    }
}

/**
 * Create or update project expectation for a user
 * @param userId - User ID
 * @param data - Project expectation data
 * @returns Created/updated project expectation
 */
export async function upsertProjectExpectation(
    userId: string,
    data: CreateProjectExpectationData
): Promise<ProjectExpectation> {
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    try {
        const expectationData = {
            user_id: userId,
            beneficiary_range: data.beneficiaryRange,
            timeline_months: data.timelineMonths,
            geography_type: data.geographyType,
            geography_spread: data.geographySpread,
            reporting_intensity: data.reportingIntensity,
            on_ground_presence: data.onGroundPresence,
            program_nature: data.programNature,
            updated_at: new Date().toISOString(),
        };

        const { data: result, error } = await supabase
            .from('project_expectations')
            .upsert(expectationData, {
                onConflict: 'user_id',
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return result;
    } catch (error) {
        console.error('[ProjectExpectations] Error upserting:', error);
        throw error;
    }
}

/**
 * Delete project expectation for a user
 * @param userId - User ID
 * @returns Success boolean
 */
export async function deleteProjectExpectation(userId: string): Promise<boolean> {
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    try {
        const { error } = await supabase
            .from('project_expectations')
            .delete()
            .eq('user_id', userId);

        if (error) {
            throw error;
        }

        return true;
    } catch (error) {
        console.error('[ProjectExpectations] Error deleting:', error);
        return false;
    }
}
