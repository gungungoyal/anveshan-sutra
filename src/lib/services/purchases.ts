/**
 * Purchase Service
 * Manages organization purchase state for the mock payment system
 */

import { supabase } from '../supabase';

export interface Purchase {
    id: string;
    userId: string;
    organizationId: string;
    amountPaid: number;
    paymentMethod: string;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    purchasedAt: string;
    expiresAt?: string;
}

/**
 * Check if a user has purchased access to an organization
 */
export async function hasPurchasedOrganization(
    userId: string,
    organizationId: string
): Promise<boolean> {
    try {
        if (!supabase) {
            console.warn('Supabase not configured');
            return false;
        }

        const { data, error } = await supabase
            .from('organization_purchases')
            .select('id')
            .eq('user_id', userId)
            .eq('organization_id', organizationId)
            .eq('payment_status', 'completed')
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 is "not found" error, which is expected
            console.error('Error checking purchase:', error);
            return false;
        }

        return !!data;
    } catch (error) {
        console.error('Failed to check purchase:', error);
        return false;
    }
}

/**
 * Get all organization IDs that a user has purchased
 */
export async function getPurchasedOrganizationIds(
    userId: string
): Promise<{ success: boolean; organizationIds: string[] }> {
    try {
        if (!supabase) {
            console.warn('Supabase not configured');
            return { success: false, organizationIds: [] };
        }

        const { data, error } = await supabase
            .from('organization_purchases')
            .select('organization_id')
            .eq('user_id', userId)
            .eq('payment_status', 'completed');

        if (error) {
            console.error('Error fetching purchased organizations:', error);
            return { success: false, organizationIds: [] };
        }

        const organizationIds = data?.map((p: any) => p.organization_id) || [];
        return { success: true, organizationIds };
    } catch (error) {
        console.error('Failed to fetch purchased organizations:', error);
        return { success: false, organizationIds: [] };
    }
}

/**
 * Record a new organization purchase
 */
export async function recordPurchase(
    userId: string,
    organizationId: string,
    options?: {
        amountPaid?: number;
        paymentMethod?: string;
        transactionId?: string;
    }
): Promise<{ success: boolean; error?: string; purchase?: Purchase }> {
    try {
        if (!supabase) {
            return { success: false, error: 'Supabase not configured' };
        }

        // Check if already purchased
        const alreadyPurchased = await hasPurchasedOrganization(userId, organizationId);
        if (alreadyPurchased) {
            return { success: false, error: 'Organization already purchased' };
        }

        const { data, error } = await supabase
            .from('organization_purchases')
            .insert({
                user_id: userId,
                organization_id: organizationId,
                amount_paid: options?.amountPaid || 99,
                payment_method: options?.paymentMethod || 'mock_card',
                payment_status: 'completed',
                transaction_id: options?.transactionId,
            })
            .select()
            .single();

        if (error) {
            console.error('Error recording purchase:', error);
            return { success: false, error: error.message };
        }

        const purchase: Purchase = {
            id: data.id,
            userId: data.user_id,
            organizationId: data.organization_id,
            amountPaid: data.amount_paid,
            paymentMethod: data.payment_method,
            paymentStatus: data.payment_status,
            transactionId: data.transaction_id,
            purchasedAt: data.purchased_at,
            expiresAt: data.expires_at,
        };

        return { success: true, purchase };
    } catch (error: any) {
        console.error('Failed to record purchase:', error);
        return { success: false, error: error.message || 'Failed to record purchase' };
    }
}

/**
 * Get all purchases for a user
 */
export async function getUserPurchases(
    userId: string
): Promise<{ success: boolean; purchases: Purchase[] }> {
    try {
        if (!supabase) {
            console.warn('Supabase not configured');
            return { success: false, purchases: [] };
        }

        const { data, error } = await supabase
            .from('organization_purchases')
            .select('*')
            .eq('user_id', userId)
            .order('purchased_at', { ascending: false });

        if (error) {
            console.error('Error fetching user purchases:', error);
            return { success: false, purchases: [] };
        }

        const purchases: Purchase[] = (data || []).map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            organizationId: p.organization_id,
            amountPaid: p.amount_paid,
            paymentMethod: p.payment_method,
            paymentStatus: p.payment_status,
            transactionId: p.transaction_id,
            purchasedAt: p.purchased_at,
            expiresAt: p.expires_at,
        }));

        return { success: true, purchases };
    } catch (error) {
        console.error('Failed to fetch user purchases:', error);
        return { success: false, purchases: [] };
    }
}
