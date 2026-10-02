import type { ReactElement, ReactNode } from 'react';
import type { FagsakDto, SchemaEnum2 as Fagsystem } from '@/generated';

import { useSuspenseQuery } from '@tanstack/react-query';
import { createContext, use, useEffect } from 'react';

import { hentFagsak } from '@/generated/sdk.gen';
import { ApiStatusError } from '@/utils/httpUtils';
import { settSporingsYtelsestype } from '@/utils/sporing';

export const FagsakContext = createContext<FagsakDto | undefined>(undefined);

type Props = {
    fagsystem: Fagsystem;
    tilbakekrevingSakId: string;
    children: ReactNode;
};

export const FagsakProvider = ({
    fagsystem,
    tilbakekrevingSakId,
    children,
}: Props): ReactElement => {
    const { data: fagsak } = useSuspenseQuery({
        queryKey: ['fagsak', fagsystem, tilbakekrevingSakId],
        queryFn: async () => {
            const { data } = await hentFagsak({
                path: { fagsystem, eksternFagsakId: tilbakekrevingSakId },
                throwOnError: true,
            });

            if (!data.data) {
                const feilmelding = data.frontendFeilmelding ?? data.melding;
                throw new ApiStatusError(data.status === 'IKKE_TILGANG' ? 403 : 500, feilmelding);
            }

            return data.data;
        },
    });

    useEffect(() => {
        settSporingsYtelsestype(fagsak.ytelsestype);
        return () => settSporingsYtelsestype(undefined);
    }, [fagsak.ytelsestype]);

    return <FagsakContext value={fagsak}>{children}</FagsakContext>;
};

export const useFagsak = (): FagsakDto => {
    const context = use(FagsakContext);
    if (!context) {
        throw new Error('useFagsak må brukes innenfor FagsakProvider');
    }

    return context;
};
