/**
 * Async Utilities
 * Timeout wrappers to prevent stuck loading states
 */

// Default timeout in milliseconds
const DEFAULT_TIMEOUT_MS = 15000; // 15 seconds

/**
 * Wraps a fetch call with a timeout using AbortController.
 * If the request takes longer than timeoutMs, it will be aborted.
 */
export async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection and try again.');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Wraps any promise with a timeout.
 * If the promise doesn't resolve within timeoutMs, rejects with an error.
 */
export async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = DEFAULT_TIMEOUT_MS,
    errorMessage: string = 'Operation timed out'
): Promise<T> {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(errorMessage));
        }, timeoutMs);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        return result;
    } finally {
        clearTimeout(timeoutId!);
    }
}
