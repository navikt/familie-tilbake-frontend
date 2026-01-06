import type { FagsakDto } from '../generated';
import type { ReactNode } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';
import React, { createContext, useContext } from 'react';
import { useParams } from 'react-router';

import { hentFagsak } from '../generated/sdk.gen';
import { Fagsystem } from '../kodeverk';

type FagsakContextType = {
    fagsak: FagsakDto;
};

export const FagsakContext = createContext<FagsakContextType | undefined>(undefined);

type Props = {
    children: ReactNode;
};

export const FagsakProvider = ({ children }: Props): React.ReactElement => {
    const { fagsystem: fagsystemParam, fagsakId: eksternFagsakId } = useParams();
    const fagsystem =
        fagsystemParam == 'KS'
            ? Fagsystem[fagsystemParam as keyof typeof Fagsystem]
            : (fagsystemParam as Fagsystem);

    const { data: fagsak } = useSuspenseQuery({
        queryKey: ['fagsak', fagsystem, eksternFagsakId],
        queryFn: async () => {
            const result = await hentFagsak({
                path: {
                    fagsystem: fagsystem,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    eksternFagsakId: eksternFagsakId!,
                },
            });

            if (!result.data?.data) {
                throw new Error('Kunne ikke laste fagsak');
            }

            return result.data.data;
        },
    });

    const value: FagsakContextType = {
        fagsak,
    };

    return <FagsakContext.Provider value={value}>{children}</FagsakContext.Provider>;
};

export const useFagsak = (): FagsakContextType => {
    const context = useContext(FagsakContext);
    if (!context) {
        throw new Error('useFagsak må brukes innenfor FagsakProvider');
    }

    return {
        fagsak: context.fagsak,
    };
};
