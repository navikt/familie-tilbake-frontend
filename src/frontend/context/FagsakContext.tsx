import type { ReactElement, ReactNode } from 'react';
import type { FagsakDto, SchemaEnum2 as Fagsystem } from '@/generated';
import type { Error as ModellError } from '@/generated-new';

import { useSuspenseQuery } from '@tanstack/react-query';
import { createContext, use, useEffect } from 'react';

import { hentFagsak } from '@/generated/sdk.gen';
import { settSporingsYtelsestype } from '@/utils/sporing';

export const FagsakContext = createContext<FagsakDto | undefined>(undefined);

type Props = {
    fagsystem: Fagsystem;
    eksternFagsakId: string;
    children: ReactNode;
};

export class FagsakIkkeStøttetError extends Error {
    tittel: string;
    fagsystem: Fagsystem;
    fagsakId?: string;
    constructor(tittel: string, message: string, fagsystem: Fagsystem, fagsakId?: string) {
        super(message);
        this.tittel = tittel;
        this.fagsystem = fagsystem;
        this.fagsakId = fagsakId;
    }
}

export class FagsakIkkeFunnetError extends Error {}

// Feil som skyldes ugyldig input gir samme svar uansett hvor mange ganger vi spør
const erIkkeGjenforsøkbar = (error: unknown): boolean =>
    error instanceof FagsakIkkeStøttetError || error instanceof FagsakIkkeFunnetError;

export const FagsakProvider = ({ fagsystem, eksternFagsakId, children }: Props): ReactElement => {
    const { data: fagsak } = useSuspenseQuery({
        queryKey: ['fagsak', fagsystem, eksternFagsakId],
        // biome-ignore lint/suspicious/noExplicitAny: error-objektet kan ha ulik form avhengig av feilen som oppstår, og er utypet i SDK-et
        retry: (count: number, error: any) => {
            return count < 2 && !erIkkeGjenforsøkbar(error);
        },
        queryFn: async () => {
            const result = await hentFagsak({
                path: {
                    fagsystem: fagsystem,
                    eksternFagsakId: eksternFagsakId,
                },
            }).catch(e => {
                if (e instanceof Error) {
                    throw e;
                }
                throw new Error(
                    `Kunne ikke laste fagsak for ${fagsystem}/${eksternFagsakId}. Fagsaken finnes ikke eller du har ikke tilgang.`,
                    { cause: e }
                );
            });

            if (!result.data?.data) {
                switch (result.status) {
                    case 405:
                        throw new FagsakIkkeStøttetError(
                            (result.error as ModellError).tittel,
                            (result.error as ModellError).melding,
                            fagsystem,
                            eksternFagsakId
                        );
                    case 400:
                    case 404:
                        throw new FagsakIkkeFunnetError(
                            `Fant ingen fagsak for fagsystem: ${fagsystem} og fagsak: ${eksternFagsakId}.`
                        );
                    case 403:
                        throw new Error(
                            `Du har ikke tilgang til fagsak for fagsystem: ${fagsystem} og fagsak: ${eksternFagsakId}.`
                        );
                    default:
                        throw new Error(
                            `En feil har oppstått. Kunne ikke laste fagsak for fagsystem: ${fagsystem} og fagsak: ${eksternFagsakId}.`
                        );
                }
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
