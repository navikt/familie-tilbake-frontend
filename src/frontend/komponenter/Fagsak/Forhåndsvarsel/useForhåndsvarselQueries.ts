import type { BehandlingDto, BrukeruttalelseDto, Varselbrevtekst } from '../../../generated';
import type { UseQueryResult, UseSuspenseQueryResult } from '@tanstack/react-query';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { hentForhåndsvarselinfo, hentForhåndsvarselTekst } from '../../../generated';

export type ForhåndsvarselInfo = {
    varselbrevSendtTid: string | undefined;
    uttalelsesfrist: string | undefined;
    brukeruttalelse: BrukeruttalelseDto | undefined;
};

export type UseForhåndsvarselQueriesReturn = {
    readonly forhåndsvarselInfoQuery: UseSuspenseQueryResult<Error | ForhåndsvarselInfo>;
    readonly varselbrevteksterQuery: UseQueryResult<Varselbrevtekst | undefined>;
    readonly forhåndsvarselInfo: ForhåndsvarselInfo;
    readonly varselbrevtekster: Varselbrevtekst | undefined;
    readonly forhåndsvarselInfoLoading: boolean;
    readonly varselbrevteksterLoading: boolean;
    readonly forhåndsvarselInfoError: boolean;
    readonly varselbrevteksterError: boolean;
};

export const useForhåndsvarselQueries = (
    behandling: BehandlingDto
): UseForhåndsvarselQueriesReturn => {
    const forhåndsvarselInfoQuery = useSuspenseQuery({
        queryKey: ['hentForhåndsvarselInfo', behandling.behandlingId],
        queryFn: () =>
            hentForhåndsvarselinfo({
                path: {
                    behandlingId: behandling.behandlingId,
                },
            }),
        select: data => {
            const info = data.data?.data;
            return {
                varselbrevSendtTid: info?.varselbrevDto?.varselbrevSendtTid,
                uttalelsesfrist: info?.varselbrevDto?.uttalelsesfrist,
                brukeruttalelse: info?.brukeruttalelse,
            };
        },
    });

    const varselbrevteksterQuery = useQuery({
        queryKey: ['hentForhåndsvarselTekst', behandling.behandlingId],
        queryFn: () =>
            hentForhåndsvarselTekst({
                path: {
                    behandlingId: behandling.behandlingId,
                },
            }),
        enabled: !!behandling.behandlingId,
        select: data => data.data?.data,
    });

    return {
        forhåndsvarselInfoQuery,
        varselbrevteksterQuery,
        forhåndsvarselInfo: forhåndsvarselInfoQuery.data,
        varselbrevtekster: varselbrevteksterQuery.data,
        forhåndsvarselInfoLoading: forhåndsvarselInfoQuery.isLoading,
        varselbrevteksterLoading: varselbrevteksterQuery.isLoading,
        forhåndsvarselInfoError: forhåndsvarselInfoQuery.isError,
        varselbrevteksterError: varselbrevteksterQuery.isError,
    };
};
