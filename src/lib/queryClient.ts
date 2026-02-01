/**
 * React Query Client Configuration
 * Provides caching and data synchronization for the application
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000,

            // Cached data is garbage collected after 10 minutes of being unused
            gcTime: 10 * 60 * 1000,

            // Don't refetch on window focus (reduces unnecessary API calls)
            refetchOnWindowFocus: false,

            // Retry failed requests up to 3 times with exponential backoff
            // This helps with transient network issues
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Don't refetch on mount if data is fresh
            refetchOnMount: false,
        },
    },
});
