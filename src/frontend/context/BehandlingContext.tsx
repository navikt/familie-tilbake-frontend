import type { BehandlingsoppsummeringDto, BehandlingDto } from '../generated/types.gen';
import type { ReactNode } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';
import * as React from 'react';
import { createContext, useContext, useMemo } from 'react';

import { hentBehandlingOptions } from '../generated/@tanstack/react-query.gen';

export const finnBehandlingId = (
    behandlinger: BehandlingsoppsummeringDto[],
    eksternBrukId: string
): string | undefined => {
    const behandling = behandlinger.find(b => b.eksternBrukId === eksternBrukId);
    return behandling?.behandlingId;
};

export const BehandlingContext = createContext<BehandlingDto | undefined>(undefined);

type Props = {
    behandlingId: string;
    children: ReactNode;
};

export const BehandlingProvider = ({ behandlingId, children }: Props): React.ReactElement => {
    const { data: behandlingResponse } = useSuspenseQuery(
        hentBehandlingOptions({
            path: {
                behandlingId,
            },
        })
    );

    const behandling = useMemo((): BehandlingDto => {
        if (!behandlingResponse?.data) {
            throw new Error('Kunne ikke laste behandling');
        }
        return behandlingResponse.data;
    }, [behandlingResponse]);

    return <BehandlingContext.Provider value={behandling}>{children}</BehandlingContext.Provider>;
};

export const useBehandling = (): BehandlingDto => {
    const context = useContext(BehandlingContext);
    if (!context) {
        throw new Error('useBehandling må brukes innenfor BehandlingProvider');
    }
    return context;
};
