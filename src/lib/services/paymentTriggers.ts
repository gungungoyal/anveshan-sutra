/**
 * Payment Trigger Service
 * 
 * Central place for all payment-related triggers.
 * Currently stubs that log and show upgrade modal.
 * Future: Will integrate with Razorpay or other payment gateway.
 */

export type UnlockType = 'single_org' | 'daily_unlimited' | 'full_access';

export interface UnlockRequest {
    type: UnlockType;
    orgId?: string;
    userId: string;
}

export interface UnlockResponse {
    success: boolean;
    message: string;
    unlocked?: boolean;
}

/**
 * Initiate unlock flow for an organization or access tier
 * 
 * @param request - Unlock request details
 * @returns Promise with success status and message
 * 
 * STUB: Currently just logs the request and returns placeholder.
 * Future: This will integrate with Razorpay to process payment.
 */
export async function initiateUnlock(request: UnlockRequest): Promise<UnlockResponse> {
    console.log('[PaymentTrigger] Unlock requested:', request);

    // STUB: Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));

    // Future: Razorpay integration here
    // 1. Create Razorpay order
    // 2. Show Razorpay checkout modal
    // 3. On success, call backend to unlock
    // 4. Update userStore with unlocked org ID

    return {
        success: false,
        message: 'Payment integration coming soon',
        unlocked: false,
    };
}

/**
 * Get pricing for unlock type
 * 
 * STUB: Returns placeholder pricing
 * Future: Fetch from backend pricing config
 */
export function getUnlockPricing(type: UnlockType): { amount: number; currency: string; description: string } {
    const pricing = {
        single_org: {
            amount: 99,
            currency: 'INR',
            description: 'Unlock this organization',
        },
        daily_unlimited: {
            amount: 499,
            currency: 'INR',
            description: 'Unlimited views for 24 hours',
        },
        full_access: {
            amount: 1999,
            currency: 'INR',
            description: 'Full access for 30 days',
        },
    };

    return pricing[type];
}
