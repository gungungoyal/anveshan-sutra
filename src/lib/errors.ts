/**
 * Centralized Error Types and Utilities
 * Provides consistent error handling across services and API routes
 */

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Base error class for all custom application errors
 */
export class AppError extends Error {
    code: string;
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, code: string, statusCode = 500, isOperational = true) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Network-related errors (timeouts, connection failures)
 */
export class NetworkError extends AppError {
    constructor(message = 'Network request failed') {
        super(message, 'NETWORK_ERROR', 503);
    }
}

/**
 * Authentication and authorization errors
 */
export class AuthError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 'AUTH_ERROR', 401);
    }
}

/**
 * Input validation errors
 */
export class ValidationError extends AppError {
    constructor(message = 'Invalid input') {
        super(message, 'VALIDATION_ERROR', 400);
    }
}

/**
 * Supabase configuration errors
 */
export class SupabaseNotConfiguredError extends AppError {
    constructor(message = 'Database connection not configured') {
        super(message, 'SUPABASE_NOT_CONFIGURED', 503);
    }
}

/**
 * Database operation errors
 */
export class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 'DATABASE_ERROR', 500);
    }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 'NOT_FOUND', 404);
    }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 'RATE_LIMIT', 429);
    }
}

// ============================================================================
// ERROR RESPONSE TYPES
// ============================================================================

/**
 * Standard error response for services
 */
export interface ServiceError {
    success: false;
    error: string;
    errorCode?: string;
    details?: Record<string, unknown>;
}

/**
 * Standard success response for services
 */
export interface ServiceSuccess<T = unknown> {
    success: true;
    data?: T;
    message?: string;
}

export type ServiceResponse<T = unknown> = ServiceSuccess<T> | ServiceError;

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Convert unknown error to ServiceError format
 */
export function handleServiceError(error: unknown, context: string): ServiceError {
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
        console.error(`[${context}] Error:`, error);
    }

    // Handle AppError instances
    if (error instanceof AppError) {
        return {
            success: false,
            error: error.message,
            errorCode: error.code,
        };
    }

    // Handle standard Error instances
    if (error instanceof Error) {
        return {
            success: false,
            error: error.message,
            errorCode: 'UNKNOWN_ERROR',
        };
    }

    // Handle string errors
    if (typeof error === 'string') {
        return {
            success: false,
            error,
            errorCode: 'UNKNOWN_ERROR',
        };
    }

    // Handle unknown error types
    return {
        success: false,
        error: 'An unexpected error occurred',
        errorCode: 'UNKNOWN_ERROR',
    };
}

/**
 * Check if Supabase is configured, throw error if not
 */
export function ensureSupabaseConfigured(supabase: any): void {
    if (!supabase) {
        throw new SupabaseNotConfiguredError();
    }
}

/**
 * Sanitize error message for user display
 * Removes technical details that could leak sensitive information
 */
export function sanitizeErrorMessage(error: string): string {
    // List of technical error patterns to replace
    const patterns = [
        { regex: /column ".*?" does not exist/i, replacement: 'Database configuration error' },
        { regex: /relation ".*?" does not exist/i, replacement: 'Database configuration error' },
        { regex: /violates.*?constraint/i, replacement: 'Invalid data provided' },
        { regex: /duplicate key value/i, replacement: 'This item already exists' },
        { regex: /PGRST\d+/g, replacement: 'Database error' },
    ];

    let sanitized = error;
    for (const { regex, replacement } of patterns) {
        if (regex.test(sanitized)) {
            sanitized = replacement;
            break;
        }
    }

    return sanitized;
}

/**
 * Create a user-friendly error message from error code
 */
export function getUserFriendlyMessage(errorCode: string): string {
    const messages: Record<string, string> = {
        NETWORK_ERROR: 'Unable to connect. Please check your internet connection and try again.',
        AUTH_ERROR: 'Authentication failed. Please sign in again.',
        VALIDATION_ERROR: 'Please check your input and try again.',
        SUPABASE_NOT_CONFIGURED: 'Service temporarily unavailable. Please try again later.',
        DATABASE_ERROR: 'Something went wrong. Please try again.',
        NOT_FOUND: 'The requested item was not found.',
        RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
        UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    };

    return messages[errorCode] || messages.UNKNOWN_ERROR;
}

/**
 * Wrap a promise with better error handling
 */
export async function withErrorHandling<T>(
    promise: Promise<T>,
    context: string
): Promise<ServiceResponse<T>> {
    try {
        const data = await promise;
        return { success: true, data };
    } catch (error) {
        return handleServiceError(error, context);
    }
}
