import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a QueryClient configured for testing.
 * Disables retries, refetching, and sets short cache times.
 */
export const createTestQueryClient = (): QueryClient => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
                staleTime: 0,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
            },
            mutations: {
                retry: false,
            },
        },
    });
};
