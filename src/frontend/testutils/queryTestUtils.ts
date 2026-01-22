import type { BehandlingDto } from '../generated';

import { QueryClient } from '@tanstack/react-query';

import { hentBehandlingQueryKey } from '../generated/@tanstack/react-query.gen';

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

export const setBehandlingQueryData = (
    queryClient: QueryClient,
    behandlingId: string,
    behandling: BehandlingDto
): void => {
    const queryKey = hentBehandlingQueryKey({ path: { behandlingId } });
    queryClient.setQueryData(queryKey, { data: behandling });
};
