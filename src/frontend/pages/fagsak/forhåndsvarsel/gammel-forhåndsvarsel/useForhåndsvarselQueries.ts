import type { UseQueryResult } from '@tanstack/react-query';
import type { ForhåndsvarselDto, RessursByte, Varselbrevtekst } from '@/generated';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { useBehandling } from '@/context/BehandlingContext';
import { hentForhåndsvarselinfo, hentForhåndsvarselTekst } from '@/generated';
import {
    behandlingHentDokumentInfoOptions,
    behandlingHentDokumentOptions,
} from '@/generated-new/@tanstack/react-query.gen';

export type UseForhåndsvarselQueriesReturn = {
    readonly varselbrevteksterQuery: UseQueryResult<Varselbrevtekst | undefined>;
    readonly forhåndsvarselInfo: ForhåndsvarselDto | undefined;
    readonly varselbrevtekster: Varselbrevtekst | undefined;
    readonly forhåndsvarselInfoLoading: boolean;
    readonly varselbrevteksterLoading: boolean;
    readonly forhåndsvarselInfoError: boolean;
    readonly varselbrevteksterError: boolean;
    readonly sendtDokument: RessursByte | undefined;
    readonly sendtDokumentLoading: boolean;
    readonly sendtDokumentError: boolean;
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
        select: data => data.data?.data ?? undefined,
    });

    const varselErSendt = !!forhåndsvarselInfoQuery.data?.varselbrevDto?.varselbrevSendtTid;

    const dokumentInfoQuery = useQuery({
        ...behandlingHentDokumentInfoOptions({
            path: { behandlingId: behandling.behandlingId, dokumentType: 'VARSELBREV' },
        }),
        enabled: varselErSendt,
    });

    const sendtDokumentQuery = useQuery({
        ...behandlingHentDokumentOptions({
            path: {
                behandlingId: behandling.behandlingId,
                journalpostId: dokumentInfoQuery.data?.journalpostId ?? '',
                dokumentInfoId: dokumentInfoQuery.data?.dokumentId ?? '',
            },
        }),
        enabled: !!dokumentInfoQuery.data?.journalpostId && !!dokumentInfoQuery.data?.dokumentId,
        select: (blob): RessursByte => ({
            data: URL.createObjectURL(new Blob([blob], { type: 'application/pdf' })),
            status: 'SUKSESS',
            melding: 'OK',
        }),
    });

    const varselbrevteksterQuery = useQuery({
        queryKey: ['hentForhåndsvarselTekst', behandling.behandlingId],
        queryFn: () =>
            hentForhåndsvarselTekst({
                path: {
                    behandlingId: behandling.behandlingId,
                },
            }),
        select: data => data.data?.data ?? undefined,
    });

    return {
        varselbrevteksterQuery: varselbrevteksterQuery,
        forhåndsvarselInfo: forhåndsvarselInfoQuery.data,
        varselbrevtekster: varselbrevteksterQuery.data,
        forhåndsvarselInfoLoading: forhåndsvarselInfoQuery.isLoading,
        varselbrevteksterLoading: varselbrevteksterQuery.isLoading,
        forhåndsvarselInfoError: forhåndsvarselInfoQuery.isError,
        varselbrevteksterError: varselbrevteksterQuery.isError,
        sendtDokument: sendtDokumentQuery.data,
        sendtDokumentLoading: sendtDokumentQuery.isLoading,
        sendtDokumentError: sendtDokumentQuery.isError,
    };
};
