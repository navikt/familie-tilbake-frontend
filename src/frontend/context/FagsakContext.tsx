import type { FagsakDto } from '../generated';
import type { ReactNode } from 'react';

import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext } from 'react';
import { useParams } from 'react-router';

import { hentFagsak } from '../generated/sdk.gen';
import { Fagsystem } from '../kodeverk';

export type FagsakHook = {
    fagsak: FagsakDto | undefined;
    isLoading: boolean;
    error: string | undefined;
};

type FagsakContextType = {
    fagsak: FagsakDto | undefined;
    isLoading: boolean;
    error: string | undefined;
};

export const FagsakContext = createContext<FagsakContextType | undefined>(undefined);

type FagsakProviderProps = {
    children: ReactNode;
};

export const FagsakProvider = ({ children }: FagsakProviderProps): React.ReactElement => {
    const { fagsystem: fagsystemParam, fagsakId: eksternFagsakId } = useParams();
    const fagsystem =
        fagsystemParam == 'KS'
            ? Fagsystem[fagsystemParam as keyof typeof Fagsystem]
            : (fagsystemParam as Fagsystem);

    const {
        data: fagsak,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['fagsak', fagsystem, eksternFagsakId],
        queryFn: async () => {
            const result = await hentFagsak({
                path: {
                    fagsystem: fagsystem,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    eksternFagsakId: eksternFagsakId!,
                },
            });

            return result.data?.data;
        },
        enabled: !!fagsystem && !!eksternFagsakId,
    });

    const value = {
        fagsak,
        isLoading,
        error: isError ? error?.message : undefined,
    };

    return <FagsakContext.Provider value={value}>{children}</FagsakContext.Provider>;
};

export const useFagsak = (): FagsakHook => {
    const context = useContext(FagsakContext);
    if (!context) {
        return {
            fagsak: undefined,
            isLoading: false,
            error: undefined,
        };
    }

    return {
        fagsak: context.fagsak,
        isLoading: context.isLoading,
        error: context.error,
    };
};
