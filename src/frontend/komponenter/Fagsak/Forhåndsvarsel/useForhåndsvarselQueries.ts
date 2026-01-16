import type { ForhåndsvarselDto, Varselbrevtekst } from '../../../generated';
import type { UseQueryResult } from '@tanstack/react-query';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { useBehandling } from '../../../context/BehandlingContext';
import { hentForhåndsvarselinfo, hentForhåndsvarselTekst } from '../../../generated';

export type UseForhåndsvarselQueriesReturn = {
    readonly varselbrevteksterQuery: UseQueryResult<Varselbrevtekst | undefined>;
    readonly forhåndsvarselInfo: ForhåndsvarselDto | undefined;
    readonly varselbrevtekster: Varselbrevtekst | undefined;
    readonly forhåndsvarselInfoLoading: boolean;
    readonly varselbrevteksterLoading: boolean;
    readonly forhåndsvarselInfoError: boolean;
    readonly varselbrevteksterError: boolean;
};

export const useForhåndsvarselQueries = (): UseForhåndsvarselQueriesReturn => {
    const behandling = useBehandling();

    const forhåndsvarselInfoQuery = useSuspenseQuery({
        queryKey: ['hentForhåndsvarselInfo', behandling.behandlingId],
        queryFn: () =>
            hentForhåndsvarselinfo({
                path: {
                    behandlingId: behandling.behandlingId,
                },
            }),
        select: data => data.data?.data,
    });

    const varselbrevteksterQuery = useQuery({
        queryKey: ['hentForhåndsvarselTekst', behandling.behandlingId],
        queryFn: () =>
            hentForhåndsvarselTekst({
                path: {
                    behandlingId: behandling.behandlingId,
                },
            }),
        select: data => data.data?.data,
    });

    return {
        varselbrevteksterQuery: varselbrevteksterQuery,
        forhåndsvarselInfo: forhåndsvarselInfoQuery.data,
        varselbrevtekster: varselbrevteksterQuery.data,
        forhåndsvarselInfoLoading: forhåndsvarselInfoQuery.isLoading,
        varselbrevteksterLoading: varselbrevteksterQuery.isLoading,
        forhåndsvarselInfoError: forhåndsvarselInfoQuery.isError,
        varselbrevteksterError: varselbrevteksterQuery.isError,
    };
};
