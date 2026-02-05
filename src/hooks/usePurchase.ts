/**
 * Purchase Hooks
 * React hooks for managing organization purchase state
 */

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
    hasPurchasedOrganization,
    getPurchasedOrganizationIds,
    recordPurchase,
} from '@/lib/services/purchases';
import {
    processMockPayment,
    MockCardDetails,
    MockPaymentResult,
} from '@/lib/services/mockPayment';

/**
 * Check if current user has purchased a specific organization
 */
export function usePurchaseCheck(organizationId: string) {
    const { user, isAuthenticated } = useAuth();
    const [isPurchased, setIsPurchased] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkPurchase = async () => {
            if (!isAuthenticated || !user) {
                setIsPurchased(false);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const purchased = await hasPurchasedOrganization(user.id, organizationId);
            setIsPurchased(purchased);
            setIsLoading(false);
        };

        checkPurchase();
    }, [organizationId, user, isAuthenticated]);

    return { isPurchased, isLoading };
}

/**
 * Get all purchased organization IDs for current user
 */
export function usePurchasedOrgs() {
    const { user, isAuthenticated } = useAuth();
    const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPurchased = async () => {
            if (!isAuthenticated || !user) {
                setPurchasedIds(new Set());
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const result = await getPurchasedOrganizationIds(user.id);
            if (result.success) {
                setPurchasedIds(new Set(result.organizationIds));
            }
            setIsLoading(false);
        };

        loadPurchased();
    }, [user, isAuthenticated]);

    return { purchasedIds, isLoading, refresh: () => setPurchasedIds(new Set()) };
}

/**
 * Hook for purchasing an organization with mock payment
 */
export function usePurchase() {
    const { user, isAuthenticated } = useAuth();
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [paymentResult, setPaymentResult] = useState<MockPaymentResult | null>(null);

    const purchaseOrganization = async (
        organizationId: string,
        cardDetails: MockCardDetails,
        amount: number = 99
    ): Promise<MockPaymentResult> => {
        if (!isAuthenticated || !user) {
            return {
                success: false,
                error: 'Not authenticated',
                message: 'Please sign in to continue',
            };
        }

        setIsPurchasing(true);
        setPaymentResult(null);

        try {
            // Process mock payment
            const result = await processMockPayment(cardDetails, amount);
            setPaymentResult(result);

            if (result.success && result.transactionId) {
                // Record purchase in database
                const recordResult = await recordPurchase(user.id, organizationId, {
                    amountPaid: amount,
                    paymentMethod: 'mock_card',
                    transactionId: result.transactionId,
                });

                if (!recordResult.success) {
                    return {
                        success: false,
                        error: 'Failed to record purchase',
                        message: 'Payment succeeded but failed to unlock content. Please contact support.',
                    };
                }
            }

            return result;
        } catch (error: any) {
            const errorResult = {
                success: false,
                error: 'Payment error',
                message: error.message || 'An unexpected error occurred',
            };
            setPaymentResult(errorResult);
            return errorResult;
        } finally {
            setIsPurchasing(false);
        }
    };

    return {
        purchaseOrganization,
        isPurchasing,
        paymentResult,
        resetPaymentResult: () => setPaymentResult(null),
    };
}
