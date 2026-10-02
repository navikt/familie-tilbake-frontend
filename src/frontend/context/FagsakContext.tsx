import type { ReactElement, ReactNode } from 'react';
import type { FagsakDto, SchemaEnum2 as Fagsystem } from '@/generated';

import { useSuspenseQuery } from '@tanstack/react-query';
import { createContext, use, useEffect } from 'react';

import { hentFagsak } from '@/generated/sdk.gen';
import { ApiStatusError, hentHttpStatus } from '@/utils/httpUtils';
import { settSporingsYtelsestype } from '@/utils/sporing';

export const FagsakContext = createContext<FagsakDto | undefined>(undefined);

type Props = {
    fagsystem: Fagsystem;
    tilbakekrevingSakId: string;
    children: ReactNode;
};

// Feil som skyldes ugyldig input gir samme svar uansett hvor mange ganger vi spør
const erIkkeGjenforsøkbar = (error: unknown): boolean =>
    error instanceof ApiStatusError && error.status >= 400 && error.status < 500;

export const FagsakProvider = ({
    fagsystem,
    tilbakekrevingSakId,
    children,
}: Props): ReactElement => {
    const { data: fagsak } = useSuspenseQuery({
        queryKey: ['fagsak', fagsystem, tilbakekrevingSakId],
        // biome-ignore lint/suspicious/noExplicitAny: error-objektet kan ha ulik form avhengig av feilen som oppstår, og er utypet i SDK-et
        retry: (count: number, error: any) => {
            return count < 2 && !erIkkeGjenforsøkbar(error);
        },
        queryFn: async () => {
            const result = await hentFagsak({
                path: {
                    fagsystem: fagsystem,
                    eksternFagsakId: tilbakekrevingSakId,
                },
            }).catch(e => {
                if (e instanceof Error) {
                    throw e;
                }
                throw new Error(
                    `Kunne ikke laste fagsak for ${fagsystem}/${tilbakekrevingSakId}. Fagsaken finnes ikke eller du har ikke tilgang.`,
                    { cause: e }
                );
            });

            const httpStatus = hentHttpStatus(result);
            const feilmelding = result.data?.frontendFeilmelding ?? result.data?.melding;
            if (httpStatus && httpStatus >= 400) {
                throw new ApiStatusError(httpStatus, feilmelding);
            }

            if (!result.data?.data) {
                if (result.data?.status === 'IKKE_TILGANG') {
                    throw new ApiStatusError(403, feilmelding);
                }
                throw new ApiStatusError(httpStatus ?? 500, feilmelding);
            }

            return result.data.data;
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
