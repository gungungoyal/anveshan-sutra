/**
 * Mock Payment Service
 * Simulates payment processing without real money transactions
 */

export interface MockPaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
    message?: string;
}

export interface MockCardDetails {
    cardNumber: string;
    expiry: string;
    cvv: string;
    cardholderName?: string;
}

/**
 * Validate mock card number format
 * Accepts Luhn-valid card numbers or test cards
 */
export function validateMockCard(cardNumber: string): boolean {
    // Remove spaces and dashes
    const cleaned = cardNumber.replace(/[\s-]/g, '');

    // Must be numeric and 13-19 digits
    if (!/^\d{13,19}$/.test(cleaned)) {
        return false;
    }

    // Luhn algorithm for card validation
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i], 10);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

/**
 * Validate expiry date (MM/YY format)
 */
export function validateExpiry(expiry: string): boolean {
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;

    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10) + 2000;

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const expiryDate = new Date(year, month - 1);

    return expiryDate > now;
}

/**
 * Validate CVV (3-4 digits)
 */
export function validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
}

/**
 * Generate a mock transaction ID
 */
export function generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `TXN-${timestamp}-${random}`;
}

/**
 * Process mock payment
 * Simulates payment processing with test card behavior
 */
export async function processMockPayment(
    cardDetails: MockCardDetails,
    amount: number
): Promise<MockPaymentResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { cardNumber, expiry, cvv } = cardDetails;

    // Validate card number
    if (!validateMockCard(cardNumber)) {
        return {
            success: false,
            error: 'Invalid card number',
            message: 'Please enter a valid card number',
        };
    }

    // Validate expiry
    if (!validateExpiry(expiry)) {
        return {
            success: false,
            error: 'Invalid or expired card',
            message: 'Please check the expiry date',
        };
    }

    // Validate CVV
    if (!validateCVV(cvv)) {
        return {
            success: false,
            error: 'Invalid CVV',
            message: 'Please enter a valid CVV',
        };
    }

    const cleaned = cardNumber.replace(/[\s-]/g, '');

    // Test cards with guaranteed behavior
    if (cleaned === '4242424242424242') {
        // Always succeeds
        return {
            success: true,
            transactionId: generateTransactionId(),
            message: 'Payment successful!',
        };
    }

    if (cleaned === '4000000000000002') {
        // Always fails
        return {
            success: false,
            error: 'Card declined',
            message: 'Your card was declined. Please try another card.',
        };
    }

    if (cleaned === '4000000000009995') {
        // Insufficient funds
        return {
            success: false,
            error: 'Insufficient funds',
            message: 'Insufficient funds in your account.',
        };
    }

    // For all other valid cards, simulate 95% success rate
    const shouldSucceed = Math.random() < 0.95;

    if (shouldSucceed) {
        return {
            success: true,
            transactionId: generateTransactionId(),
            message: 'Payment successful!',
        };
    } else {
        return {
            success: false,
            error: 'Payment failed',
            message: 'Payment processing failed. Please try again.',
        };
    }
}

/**
 * Format card number for display (e.g., "**** **** **** 1234")
 */
export function formatCardNumberDisplay(cardNumber: string): string {
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    const lastFour = cleaned.slice(-4);
    return `**** **** **** ${lastFour}`;
}

/**
 * Get card brand from number
 */
export function getCardBrand(cardNumber: string): string {
    const cleaned = cardNumber.replace(/[\s-]/g, '');

    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    if (/^35/.test(cleaned)) return 'JCB';

    return 'Unknown';
}
