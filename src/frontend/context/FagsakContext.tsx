import type { ReactElement, ReactNode } from 'react';
import type { FagsakDto } from '~/generated';

import { useSuspenseQuery } from '@tanstack/react-query';
import { createContext, use } from 'react';
import { useParams } from 'react-router';

import { hentFagsak } from '~/generated/sdk.gen';
import { Fagsystem } from '~/kodeverk';

export const FagsakContext = createContext<FagsakDto | undefined>(undefined);

type Props = {
    children: ReactNode;
};

export const FagsakProvider = ({ children }: Props): ReactElement => {
    const { fagsystem: fagsystemParam, fagsakId: eksternFagsakId } = useParams();
    const fagsystem =
        fagsystemParam == 'KS'
            ? Fagsystem[fagsystemParam satisfies keyof typeof Fagsystem]
            : (fagsystemParam as Fagsystem);

    const { data: fagsak } = useSuspenseQuery({
        queryKey: ['fagsak', fagsystem, eksternFagsakId],
        queryFn: async () => {
            try {
                const result = await hentFagsak({
                    path: {
                        fagsystem: fagsystem,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        eksternFagsakId: eksternFagsakId!,
                    },
                });

                if (!result.data?.data) {
                    throw new Error(
                        `Kunne ikke laste fagsak for ${fagsystem}/${eksternFagsakId}. Fagsaken finnes ikke eller du har ikke tilgang.`
                    );
                }

                return result.data.data;
            } catch (error) {
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error(
                    `Kunne ikke laste fagsak for ${fagsystem}/${eksternFagsakId}. Fagsaken finnes ikke eller du har ikke tilgang.`,
                    { cause: error }
                );
            }
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
