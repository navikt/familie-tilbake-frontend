import type { ReactElement, ReactNode } from 'react';
import type { FagsakDto } from '~/generated';
import type { Error as ModellError } from '~/generated-new';

import { useSuspenseQuery } from '@tanstack/react-query';
import { createContext, use } from 'react';
import { useParams } from 'react-router';

import { hentFagsak } from '~/generated/sdk.gen';
import { Fagsystem } from '~/kodeverk';

export const FagsakContext = createContext<FagsakDto | undefined>(undefined);

type Props = {
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

export const FagsakProvider = ({ children }: Props): ReactElement => {
    const { fagsystem: fagsystemParam, fagsakId: eksternFagsakId } = useParams();
    const fagsystem =
        fagsystemParam == 'KS'
            ? Fagsystem[fagsystemParam satisfies keyof typeof Fagsystem]
            : (fagsystemParam as Fagsystem);

    const { data: fagsak } = useSuspenseQuery({
        queryKey: ['fagsak', fagsystem, eksternFagsakId],
        retry: (count, error) => {
            return count < 4 && !(error instanceof FagsakIkkeStøttetError);
        },
        queryFn: async () => {
            const result = await hentFagsak({
                path: {
                    fagsystem: fagsystem,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    eksternFagsakId: eksternFagsakId!,
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
                    default:
                        throw new Error(
                            `Kunne ikke laste fagsak for ${fagsystem}/${eksternFagsakId}. Fagsaken finnes ikke eller du har ikke tilgang.`
                        );
                }
            }

            return result.data.data;
        },
    });

    return <FagsakContext value={fagsak}>{children}</FagsakContext>;
};

export const useFagsak = (): FagsakDto => {
    const context = use(FagsakContext);
    if (!context) {
        throw new Error('useFagsak må brukes innenfor FagsakProvider');
    }

    return context;
};
